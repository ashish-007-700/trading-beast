import nodemailer from 'nodemailer';
import { IUser } from '../models/User';
import { IAlert } from '../models/Alert';

// Trading session times in IST (UTC+5:30)
export const TRADING_SESSIONS = {
  tokyo: { name: 'Tokyo', openIST: '05:30', closeIST: '14:30' },
  sydney: { name: 'Sydney', openIST: '03:30', closeIST: '12:30' },
  london: { name: 'London', openIST: '13:30', closeIST: '22:30' },
  newYork: { name: 'New York', openIST: '18:30', closeIST: '03:30' },
};

// Create reusable transporter
const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('⚠️ Gmail credentials not configured. Email service disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

let transporter: nodemailer.Transporter | null = null;

export const initEmailService = () => {
  transporter = createTransporter();
  if (transporter) {
    console.log('✅ Email service initialized');
  }
};

export const isEmailServiceEnabled = () => transporter !== null;

// Send alert triggered email
export const sendAlertTriggeredEmail = async (
  user: IUser,
  alert: IAlert,
  currentPrice: number
): Promise<boolean> => {
  if (!transporter) {
    console.warn('Email service not configured');
    return false;
  }

  const conditionText = alert.condition === 'above' ? 'rose above' :
                        alert.condition === 'below' ? 'fell below' : 'crossed';

  const mailOptions = {
    from: `"Trading Beast" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `🔔 Alert Triggered: ${alert.symbol} ${conditionText} $${alert.targetPrice}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1E222D; color: #D1D4DC; padding: 24px; border-radius: 8px;">
        <h1 style="color: #2962FF; margin-bottom: 24px;">🔔 Price Alert Triggered</h1>
        
        <div style="background: #131722; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 12px 0; color: #fff;">${alert.symbol}</h2>
          <p style="margin: 4px 0; color: #9CA3AF;">
            Price ${conditionText} your target of <strong style="color: #fff;">$${alert.targetPrice.toLocaleString()}</strong>
          </p>
          <p style="margin: 4px 0; color: #9CA3AF;">
            Current price: <strong style="color: ${currentPrice >= alert.targetPrice ? '#22C55E' : '#EF4444'};">$${currentPrice.toLocaleString()}</strong>
          </p>
        </div>
        
        ${alert.message ? `
        <div style="background: #131722; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0; color: #9CA3AF;"><strong>Note:</strong> ${alert.message}</p>
        </div>
        ` : ''}
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
          Triggered at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
        
        <hr style="border: none; border-top: 1px solid #374151; margin: 24px 0;" />
        
        <p style="color: #6B7280; font-size: 12px; text-align: center;">
          Trading Beast | Your Personal Trading Assistant
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Alert email sent to ${user.email} for ${alert.symbol}`);
    return true;
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return false;
  }
};

// Send trading session notification
export const sendSessionNotificationEmail = async (
  user: IUser,
  session: keyof typeof TRADING_SESSIONS,
  isOpening: boolean
): Promise<boolean> => {
  if (!transporter) {
    return false;
  }

  const sessionInfo = TRADING_SESSIONS[session];
  const action = isOpening ? 'Opening' : 'Closing';

  const mailOptions = {
    from: `"Trading Beast" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `📊 ${sessionInfo.name} Market ${action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1E222D; color: #D1D4DC; padding: 24px; border-radius: 8px;">
        <h1 style="color: #2962FF; margin-bottom: 24px;">📊 Trading Session Update</h1>
        
        <div style="background: #131722; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 12px 0; color: #fff;">${sessionInfo.name} Market is ${isOpening ? 'Opening' : 'Closing'}</h2>
          <p style="margin: 4px 0; color: #9CA3AF;">
            ${isOpening 
              ? `The ${sessionInfo.name} trading session has started. Trading hours: ${sessionInfo.openIST} - ${sessionInfo.closeIST} IST`
              : `The ${sessionInfo.name} trading session is ending soon.`
            }
          </p>
        </div>
        
        <div style="background: #131722; padding: 16px; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; color: #fff;">All Session Times (IST)</h3>
          <table style="width: 100%; color: #9CA3AF; font-size: 14px;">
            <tr><td>🇯🇵 Tokyo</td><td>05:30 - 14:30</td></tr>
            <tr><td>🇦🇺 Sydney</td><td>03:30 - 12:30</td></tr>
            <tr><td>🇬🇧 London</td><td>13:30 - 22:30</td></tr>
            <tr><td>🇺🇸 New York</td><td>18:30 - 03:30</td></tr>
          </table>
        </div>
        
        <hr style="border: none; border-top: 1px solid #374151; margin: 24px 0;" />
        
        <p style="color: #6B7280; font-size: 12px; text-align: center;">
          Trading Beast | Your Personal Trading Assistant
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Session notification sent to ${user.email} for ${sessionInfo.name}`);
    return true;
  } catch (error) {
    console.error('Failed to send session email:', error);
    return false;
  }
};
