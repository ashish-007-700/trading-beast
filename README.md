# Trading Beast

A MERN stack trading platform with real-time charts, featuring data from Binance, Yahoo Finance, and Finnhub.

## Architecture

```
trading-beast/
├── client/          # React + Vite + TypeScript frontend
├── server/          # Express + TypeScript backend
└── package.json     # Workspace scripts
```

## Getting Started

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
FINNHUB_API_KEY=your_finnhub_key
BINANCE_API_KEY=your_binance_key    # Optional, increases rate limits
MONGODB_URI=mongodb://localhost:27017/trading-beast  # Optional
```

### 3. Run development servers

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:5000 (Express API server)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development |
| `npm run dev:client` | Start only the React frontend |
| `npm run dev:server` | Start only the Express backend |
| `npm run build` | Build both client and server for production |
| `npm run install:all` | Install dependencies for root, client, and server |

## Features

- **Real-time charts** with WebSocket updates (Binance crypto)
- **Multi-asset support**: US stocks, crypto, indices, commodities
- **5 timeframes**: 1m, 5m, 15m, 1H, Daily
- **Dashboard**: View multiple symbols at once
- **Dark theme**: Professional trading UI

## Data Sources

| Source | Coverage | Real-time |
|--------|----------|-----------|
| Binance | Crypto (BTC-USD, ETH-USD, etc.) | ✅ WebSocket |
| Yahoo Finance | Stocks, indices, commodities, forex | ❌ 15-30s delay |
| Finnhub | US stocks (AAPL, MSFT, etc.) | ✅ API |

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- React Router v7
- Tailwind CSS v4
- lightweight-charts

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/yahoo/candles` | Yahoo Finance chart data |
| `GET /api/binance/candles` | Binance crypto candles |
| `GET /api/finnhub/quote` | Finnhub stock quote |
| `GET /api/finnhub/candles` | Finnhub historical candles |
| `GET /api/health` | Health check |

