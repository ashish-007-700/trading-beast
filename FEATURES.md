# Trading Beast - Feature Documentation

This document summarizes the features implemented in this session.

---

## 1. Dashboard Revamp - Bubble Charts

**Replaced** individual candlestick charts with **4 interactive bubble charts** for asset classes.

### Files Created/Modified:
- `client/src/components/BubbleChart.tsx` - D3.js bubble chart component
- `client/src/components/AssetBubbleSection.tsx` - Asset class wrapper with data fetching
- `client/src/pages/Dashboard.tsx` - Updated to use bubble charts
- `server/src/routes/yahoo.ts` - Added `/api/yahoo/quotes` endpoint

### Asset Coverage:
| Category | Assets |
|----------|--------|
| 🇮🇳 Indian | HDFCBANK, ICICIBANK, SBI, KOTAKBANK, AXISBANK, RELIANCE, TCS, INFY, HINDUNILVR, ITC, BHARTIARTL, LT |
| 🇺🇸 US | AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, BRK-B, JPM, V, JNJ, WMT, XOM, UNH, MA |
| 🪙 Commodities | Gold, Silver, Platinum, Palladium, Crude Oil (WTI/Brent), Natural Gas, Gasoline, Heating Oil, Copper, Aluminum, Corn, Wheat, Soybeans, Coffee, Sugar, Cotton |
| 💰 Crypto | BTC, ETH, SOL, ADA, AVAX, DOT, MATIC, ATOM, BNB, XRP, LINK, UNI, DOGE, LTC, SHIB |

### Bubble Chart Data:
- **X-axis**: Current Price
- **Y-axis**: Daily % Change
- **Bubble Size**: Trading Volume

---

## 2. Authentication System

**JWT-based authentication** with login, registration, and protected routes.

### Backend Files:
| File | Description |
|------|-------------|
| `server/src/models/User.ts` | User schema (email, passwordHash, name, preferences) |
| `server/src/middleware/auth.ts` | JWT verification, token generation |
| `server/src/routes/auth.ts` | Auth endpoints |

### API Endpoints:
```
POST /api/auth/register   - Create new user
POST /api/auth/login      - Login, returns JWT tokens
POST /api/auth/refresh    - Refresh access token
GET  /api/auth/me         - Get current user (protected)
PUT  /api/auth/preferences - Update user preferences (protected)
```

### Frontend Files:
| File | Description |
|------|-------------|
| `client/src/store/authStore.ts` | Zustand store with localStorage persistence |
| `client/src/pages/Login.tsx` | Login form |
| `client/src/pages/Register.tsx` | Registration form |
| `client/src/components/ProtectedRoute.tsx` | Auth guard wrapper |
| `client/src/components/Sidebar.tsx` | Updated with user info & logout |
| `client/src/App.tsx` | Protected routes configuration |

### Protected Routes:
- `/dashboard`
- `/trade`
- `/paper-trading`
- `/backtesting`
- `/journal`
- `/alerts`
- `/settings`

---

## 3. Alert System

**Price alert engine** with background monitoring and email notifications.

### Backend Files:
| File | Description |
|------|-------------|
| `server/src/models/Alert.ts` | Alert schema (symbol, price, condition, status, history) |
| `server/src/routes/alerts.ts` | Alert CRUD endpoints |
| `server/src/services/alertService.ts` | Background price monitoring (30s interval) |
| `server/src/services/emailService.ts` | Gmail SMTP integration |

### Alert API Endpoints:
```
GET    /api/alerts         - Get all alerts (with filters)
GET    /api/alerts/active  - Get active alerts only
GET    /api/alerts/history - Get triggered/expired/cancelled alerts
GET    /api/alerts/:id     - Get specific alert
POST   /api/alerts         - Create new alert
PUT    /api/alerts/:id     - Update alert
DELETE /api/alerts/:id     - Delete alert
POST   /api/alerts/:id/cancel - Cancel active alert
GET    /api/alerts/user/stats - Get alert statistics
```

### Alert Conditions:
- `above` - Trigger when price ≥ target
- `below` - Trigger when price ≤ target
- `crosses` - Trigger when price crosses target from either direction

### Frontend Files:
| File | Description |
|------|-------------|
| `client/src/pages/Settings.tsx` | Full settings with Profile, Alerts, Sessions tabs |
| `client/src/components/ChartAlertOverlay.tsx` | Hover-based alert creation on charts |

---

## 4. Trading Session Notifications

**Email notifications** for major trading session open/close times.

### Session Times (IST):
| Session | Open | Close |
|---------|------|-------|
| 🇯🇵 Tokyo | 05:30 | 14:30 |
| 🇦🇺 Sydney | 03:30 | 12:30 |
| 🇬🇧 London | 13:30 | 22:30 |
| 🇺🇸 New York | 18:30 | 03:30 |

Users can enable/disable notifications for each session in Settings → Sessions.

---

## Environment Variables

Add to `.env.local`:

```bash
# MongoDB (required for auth & alerts)
MONGODB_URI=mongodb://localhost:27017/trading-beast

# JWT Secret (required)
JWT_SECRET=your-super-secret-key-change-in-production

# Gmail SMTP (optional - for email notifications)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Getting Gmail App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password as `GMAIL_APP_PASSWORD`

---

## Dependencies Added

### Server:
```bash
npm install bcrypt jsonwebtoken nodemailer
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

### Client:
```bash
npm install zustand d3 @types/d3
```

---

## Running the Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start server
cd server
npm run dev

# Terminal 3: Start client
cd client
npm run dev
```

---

## File Structure Summary

```
trading-beast/
├── client/
│   └── src/
│       ├── components/
│       │   ├── BubbleChart.tsx          # D3 bubble chart
│       │   ├── AssetBubbleSection.tsx   # Asset class wrapper
│       │   ├── ChartAlertOverlay.tsx    # Hover alert creation
│       │   ├── ProtectedRoute.tsx       # Auth guard
│       │   └── Sidebar.tsx              # Updated with auth
│       ├── pages/
│       │   ├── Dashboard.tsx            # Bubble charts dashboard
│       │   ├── Login.tsx                # Login page
│       │   ├── Register.tsx             # Registration page
│       │   └── Settings.tsx             # Full settings UI
│       ├── store/
│       │   └── authStore.ts             # Zustand auth store
│       └── App.tsx                       # Protected routes
│
└── server/
    └── src/
        ├── models/
        │   ├── User.ts                   # User schema
        │   └── Alert.ts                  # Alert schema
        ├── middleware/
        │   └── auth.ts                   # JWT middleware
        ├── routes/
        │   ├── auth.ts                   # Auth endpoints
        │   ├── alerts.ts                 # Alert endpoints
        │   └── yahoo.ts                  # Added /quotes endpoint
        ├── services/
        │   ├── emailService.ts           # Gmail SMTP
        │   └── alertService.ts           # Background monitoring
        └── index.ts                       # Updated with new routes
```

---

*Generated on 2026-04-07*

---

## 5. Asset Search Bar (Landing Page)

**Interactive search bar** on the Home page to search and view charts for any asset.

### Features:
- **Search suggestions** - Popular symbols across crypto, US stocks, Indian stocks, commodities, indices, and forex
- **Keyboard navigation** - Arrow keys to navigate, Enter to select, Escape to close
- **Custom symbol entry** - Type any symbol and press Enter to view its chart
- **Quick access chips** - One-click access to popular symbols
- **Category badges** - Color-coded asset type indicators

### Files Modified:
| File | Description |
|------|-------------|
| `client/src/pages/Home.tsx` | Added search bar, symbol suggestions, dynamic chart switching |

### Supported Symbol Formats:
| Type | Example |
|------|---------|
| Crypto | `BTC-USD`, `ETH-USD`, `SOL-USD` |
| US Stock | `AAPL`, `MSFT`, `GOOGL` |
| Indian Stock | `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS` |
| Commodity | `GC=F` (Gold), `CL=F` (Oil), `SI=F` (Silver) |
| Index | `^GSPC` (S&P 500), `^NSEI` (Nifty) |
| Forex | `EURUSD=X`, `USDINR=X` |

---

## 6. Chart Alert Overlay (Hover-Based Alerts)

**Professional hover-based alert creation** directly on charts.

### Features:
- **Horizontal price line** - Dashed line follows cursor vertically
- **Price label** - Shows exact price at cursor position
- **Alert button** - One-click alert creation at hover price
- **Auto-detect direction** - Automatically determines "above" or "below" based on current price
- **Success notification** - Visual confirmation when alert is created

### How to Use:
1. Login to enable alerts (authentication required)
2. Hover over the chart area
3. A dashed blue line appears at your cursor's price level
4. Click the alert button to create an alert at that price
5. The alert will be saved and monitored in the background

### Files Modified:
| File | Description |
|------|-------------|
| `client/src/components/TradingViewChart.tsx` | Integrated hover-based alert overlay directly into the chart component |

### Props Added to TradingViewChart:
```typescript
interface TradingViewChartProps {
  symbol: string;
  height?: number;
  showToolbar?: boolean;
  enableAlerts?: boolean;  // NEW: Enable/disable alert overlay (default: true)
}
```

---

## 7. Chart Alert Overlay UI Improvements

**Optimized alert overlay** with minimal UI footprint and smoother performance.

### Changes Made:
- **Clock icon** - Replaced large bell button with a small clock icon (16x16px)
- **Positioned at line end** - Icon sits at the right edge of price line, beside Y-axis
- **Performance optimizations**:
  - Combined hover state into single object (fewer re-renders)
  - Added `useCallback` for memoized mouse handlers
  - Added `willChange: 'transform'` CSS hint for GPU acceleration
  - Removed hover effects that caused style recalculations

### Visual Design:
```
Chart Area                                    Y-Axis
┌─────────────────────────────────────────┬──────────┐
│                                         │  95,000  │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ [⏰]│  94,500  │  ← Hover line with clock
│                                         │  94,000  │
│                                         │  93,500  │
└─────────────────────────────────────────┴──────────┘
```

### Files Modified:
| File | Description |
|------|-------------|
| `client/src/components/TradingViewChart.tsx` | Updated alert overlay with clock icon, optimized state management |

---

*Last updated: 2026-04-07*
