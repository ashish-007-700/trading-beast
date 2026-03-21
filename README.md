Trading Beast is a Next.js (App Router) + TypeScript project with a TradingView chart embedded on the home page.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key files:

- `src/app/page.tsx` (home page)
- `src/components/TradingViewWidget.tsx` (TradingView embed widget)

Notes:

- The TradingView integration uses the public embed widget script (no Charting Library).

## Build

```bash
npm run build
npm run start
```
