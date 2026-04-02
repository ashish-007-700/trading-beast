# ✅ Binance API Integration - Complete Setup

## What Was Changed

This integration switches cryptocurrency symbols (like BTC-USD, ETH-USD) from Yahoo Finance to Binance API for better performance and real-time data accuracy.

---

## Files Created

### 1. **src/lib/symbolClassifier.ts**
- Utility to detect symbol types (crypto, US stocks, other assets)
- Routes crypto symbols → Binance
- Routes US stocks → Finnhub (for future)
- Routes everything else → Yahoo Finance

### 2. **src/app/api/binance/candles/route.ts**
- Next.js API route for fetching historical candle data from Binance
- Converts Yahoo-style parameters (interval/range) to Binance format
- Supports BTC-USD format → converts to BTCUSDT for Binance API
- Includes error handling and logging

### 3. **.env.local**
- Environment file for API keys
- Added BINANCE_API_KEY placeholder

---

## Files Modified

### 1. **src/components/TradingViewChart.tsx**
**What changed:**
- Added import: `import { getDataSourceInfo } from "../lib/symbolClassifier"`
- Updated `fetchData` function to route based on symbol type:
  ```typescript
  // Before:
  const url = `/api/yahoo/candles?symbol=${symbol}...`;
  
  // After:
  const sourceInfo = getDataSourceInfo(symbol);
  if (sourceInfo.source === "binance") {
    url = `/api/binance/candles?symbol=${symbol}...`;  // Crypto → Binance
  } else {
    url = `/api/yahoo/candles?symbol=${symbol}...`;    // Others → Yahoo
  }
  ```

---

## How It Works

### Symbol Detection Flow:
```
User searches "BTC-USD"
  ↓
symbolClassifier.ts detects: "This is crypto!" (ends with -USD)
  ↓
TradingViewChart.tsx calls: /api/binance/candles
  ↓
route.ts converts: BTC-USD → BTCUSDT (Binance format)
  ↓
Fetches from: https://api.binance.com/api/v3/klines
  ↓
Returns OHLCV candle data
  ↓
Chart displays
```

### Symbol Type Examples:

| Symbol | Type | API Used |
|--------|------|----------|
| BTC-USD | Crypto | **Binance** |
| ETH-USD | Crypto | **Binance** |
| SOL-USD | Crypto | **Binance** |
| AAPL | US Stock | Yahoo Finance* |
| MSFT | US Stock | Yahoo Finance* |
| RELIANCE.NS | Indian Stock | Yahoo Finance |
| ^NSEI | Index | Yahoo Finance |
| EURUSD=X | Forex | Yahoo Finance |

*Note: US stocks currently use Yahoo, but can be switched to Finnhub if needed

---

## Setup Instructions

### 1. **Add Binance API Key (Optional but Recommended)**

Edit `.env.local`:
```bash
BINANCE_API_KEY=your_api_key_here
```

**To get a Binance API key:**
1. Go to: https://www.binance.com/en/my/settings/api-management
2. Create API key with **READ-ONLY** permissions
3. No trading permissions needed
4. Copy the API key to `.env.local`

**Without API key:** The app will still work, but with lower rate limits.

### 2. **Restart the Development Server**

```bash
npm run dev
```

### 3. **Test Crypto Symbols**

Try these in the search bar:
- `BTC-USD` (Bitcoin)
- `ETH-USD` (Ethereum)
- `SOL-USD` (Solana)
- `DOGE-USD` (Dogecoin)

---

## Technical Details

### API Parameter Mapping

**Yahoo Format → Binance Format:**

| Yahoo Interval | Binance Interval |
|----------------|------------------|
| 1m | 1m |
| 5m | 5m |
| 15m | 15m |
| 60m | 1h |
| 1d | 1d |

| Yahoo Range | Days Converted |
|-------------|----------------|
| 1d | 1 day |
| 5d | 5 days |
| 1mo | 30 days |
| 3mo | 90 days |
| 6mo | 180 days |
| 1y | 365 days |
| 5y | 1825 days |

### Symbol Format Conversion

```javascript
// Yahoo format → Binance format
"BTC-USD"  → "BTCUSDT"
"ETH-USD"  → "ETHUSDT"
"SOL-USD"  → "SOLUSDT"

// Also supports Finnhub format
"BINANCE:BTCUSDT" → "BTCUSDT"
```

---

## Benefits

✅ **Faster Response Times** - Binance API is optimized for crypto data  
✅ **More Accurate Pricing** - Direct from the exchange  
✅ **Better Data Quality** - No Yahoo Finance intermediary  
✅ **Real-time Compatibility** - Matches WebSocket data source  
✅ **Higher Reliability** - Binance has better uptime for crypto  

---

## Troubleshooting

### If Charts Don't Load:

1. **Check Browser Console** (F12 → Console)
   - Look for API errors
   - Check network tab for failed requests

2. **Check Terminal/Server Logs**
   - Look for Binance API errors
   - Check if API key is valid (if using one)

3. **Verify Symbol Format**
   - Use: `BTC-USD` ✅
   - Not: `BTCUSD` ❌
   - Not: `BTC` ❌

4. **Check API Rate Limits**
   - Without API key: Lower limits
   - With API key: Higher limits
   - If rate limited, wait 1 minute and try again

---

## Future Enhancements

- [ ] Add Finnhub integration for US stocks (replace Yahoo for stocks)
- [ ] Add WebSocket real-time updates from Binance (already exists in server/)
- [ ] Add support for more crypto pairs (not just -USD pairs)
- [ ] Add caching layer to reduce API calls
- [ ] Add error retry logic with exponential backoff

---

## API Documentation

- **Binance API Docs**: https://binance-docs.github.io/apidocs/spot/en/
- **Klines Endpoint**: https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
- **Rate Limits**: https://binance-docs.github.io/apidocs/spot/en/#limits

---

## Summary

🎉 **Your app now uses Binance API for all cryptocurrency symbols!**

The integration is complete and ready to use. Crypto charts will automatically fetch data from Binance, while stocks and other assets continue using Yahoo Finance.
