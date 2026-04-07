import { Alert, IAlert } from '../models/Alert';
import { User } from '../models/User';
import { sendAlertTriggeredEmail, sendSessionNotificationEmail, TRADING_SESSIONS } from './emailService';

// Price cache to track previous prices for "crosses" condition
const priceCache: Map<string, number> = new Map();

// Check interval in milliseconds (30 seconds)
const CHECK_INTERVAL = 30 * 1000;

// Session notification tracking (to avoid duplicate notifications)
const sessionNotificationsSent: Map<string, Set<string>> = new Map();

/**
 * Fetch current price for a symbol from Yahoo Finance
 */
const fetchPrice = async (symbol: string): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    
    return price ?? null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

/**
 * Check if alert condition is met
 */
const checkAlertCondition = (
  alert: IAlert,
  currentPrice: number,
  previousPrice: number | undefined
): boolean => {
  switch (alert.condition) {
    case 'above':
      return currentPrice >= alert.targetPrice;
    case 'below':
      return currentPrice <= alert.targetPrice;
    case 'crosses':
      if (previousPrice === undefined) return false;
      // Price crossed the target from either direction
      return (
        (previousPrice < alert.targetPrice && currentPrice >= alert.targetPrice) ||
        (previousPrice > alert.targetPrice && currentPrice <= alert.targetPrice)
      );
    default:
      return false;
  }
};

/**
 * Process triggered alert
 */
const processTriggeredAlert = async (alert: IAlert, currentPrice: number): Promise<void> => {
  try {
    // Update alert status
    alert.status = 'triggered';
    alert.triggeredAt = new Date();
    alert.priceAtTrigger = currentPrice;
    
    // Add to history
    alert.history.push({
      triggeredAt: new Date(),
      priceAtTrigger: currentPrice,
      notificationSent: false,
    });

    await alert.save();

    // Send email notification if user has it enabled
    const user = await User.findById(alert.userId);
    if (user && user.preferences.emailNotifications && user.preferences.alertsEnabled) {
      const sent = await sendAlertTriggeredEmail(user, alert, currentPrice);
      
      if (sent) {
        alert.notificationSent = true;
        if (alert.history.length > 0) {
          alert.history[alert.history.length - 1].notificationSent = true;
        }
        await alert.save();
      }
    }

    console.log(`🔔 Alert triggered: ${alert.symbol} ${alert.condition} $${alert.targetPrice} (current: $${currentPrice})`);
  } catch (error) {
    console.error('Error processing triggered alert:', error);
  }
};

/**
 * Check all active alerts
 */
const checkAlerts = async (): Promise<void> => {
  try {
    // Get all active alerts
    const activeAlerts = await Alert.find({ status: 'active' });
    
    if (activeAlerts.length === 0) return;

    // Group alerts by symbol
    const alertsBySymbol: Map<string, IAlert[]> = new Map();
    for (const alert of activeAlerts) {
      const existing = alertsBySymbol.get(alert.symbol) || [];
      existing.push(alert);
      alertsBySymbol.set(alert.symbol, existing);
    }

    // Check each symbol
    for (const [symbol, alerts] of alertsBySymbol) {
      const currentPrice = await fetchPrice(symbol);
      
      if (currentPrice === null) continue;

      const previousPrice = priceCache.get(symbol);
      priceCache.set(symbol, currentPrice);

      // Check each alert for this symbol
      for (const alert of alerts) {
        // Check expiration
        if (alert.expiresAt && new Date() > alert.expiresAt) {
          alert.status = 'expired';
          await alert.save();
          console.log(`⏰ Alert expired: ${alert.symbol}`);
          continue;
        }

        // Check condition
        if (checkAlertCondition(alert, currentPrice, previousPrice)) {
          await processTriggeredAlert(alert, currentPrice);
        }
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
};

/**
 * Get current IST time string (HH:MM format)
 */
const getCurrentISTTime = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  const hours = istTime.getUTCHours().toString().padStart(2, '0');
  const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get today's date key for tracking notifications
 */
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check and send trading session notifications
 */
const checkSessionNotifications = async (): Promise<void> => {
  try {
    const currentTime = getCurrentISTTime();
    const todayKey = getTodayKey();

    // Initialize today's tracking if needed
    if (!sessionNotificationsSent.has(todayKey)) {
      sessionNotificationsSent.clear(); // Clear old days
      sessionNotificationsSent.set(todayKey, new Set());
    }

    const sentToday = sessionNotificationsSent.get(todayKey)!;

    // Check each session
    for (const [sessionKey, session] of Object.entries(TRADING_SESSIONS)) {
      const openKey = `${sessionKey}_open`;
      const closeKey = `${sessionKey}_close`;

      // Check opening (within 1 minute window)
      if (currentTime === session.openIST && !sentToday.has(openKey)) {
        await sendSessionNotificationsToUsers(sessionKey as keyof typeof TRADING_SESSIONS, true);
        sentToday.add(openKey);
      }

      // Check closing (within 1 minute window)
      if (currentTime === session.closeIST && !sentToday.has(closeKey)) {
        await sendSessionNotificationsToUsers(sessionKey as keyof typeof TRADING_SESSIONS, false);
        sentToday.add(closeKey);
      }
    }
  } catch (error) {
    console.error('Error checking session notifications:', error);
  }
};

/**
 * Send session notifications to subscribed users
 */
const sendSessionNotificationsToUsers = async (
  session: keyof typeof TRADING_SESSIONS,
  isOpening: boolean
): Promise<void> => {
  try {
    // Find users with this session enabled
    const users = await User.find({
      'preferences.emailNotifications': true,
      [`preferences.tradingSessionAlerts.${session}`]: true,
    });

    for (const user of users) {
      await sendSessionNotificationEmail(user, session, isOpening);
    }

    console.log(`📊 Sent ${session} ${isOpening ? 'opening' : 'closing'} notifications to ${users.length} users`);
  } catch (error) {
    console.error('Error sending session notifications:', error);
  }
};

let alertCheckInterval: NodeJS.Timeout | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;

/**
 * Start the alert monitoring service
 */
export const startAlertService = (): void => {
  console.log('🚀 Starting alert monitoring service...');
  
  // Run initial check
  checkAlerts();
  checkSessionNotifications();

  // Set up intervals
  alertCheckInterval = setInterval(checkAlerts, CHECK_INTERVAL);
  sessionCheckInterval = setInterval(checkSessionNotifications, 60 * 1000); // Check every minute

  console.log(`✅ Alert service started (checking every ${CHECK_INTERVAL / 1000}s)`);
};

/**
 * Stop the alert monitoring service
 */
export const stopAlertService = (): void => {
  if (alertCheckInterval) {
    clearInterval(alertCheckInterval);
    alertCheckInterval = null;
  }
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  console.log('🛑 Alert service stopped');
};
