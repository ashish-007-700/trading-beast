Trading Beast is a Next.js (App Router) + TypeScript project with a Finnhub-backed price chart widget.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Finnhub API key

- Create `.env.local` and set `FINNHUB_API_KEY`.
- You can start from `.env.example`.

Key files:

- `src/app/page.tsx` (home page)
- `src/app/api/finnhub/quote/route.ts` (server-side Finnhub proxy for quotes)
- `src/app/api/finnhub/candles/route.ts` (server-side Finnhub proxy for candles)
- `src/components/FinnhubPriceChartWidget.tsx` (client-side price chart; falls back to live quote polling)

Notes:

- The Finnhub API key is kept server-side via the API routes; it is not exposed to the browser.

## Build

```bash
npm run build
npm run start
```
