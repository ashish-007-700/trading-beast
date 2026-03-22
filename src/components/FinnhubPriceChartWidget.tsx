"use client";

import { useEffect, useMemo, useState } from "react";

type CandlePoint = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

type CandlesResponse =
  | {
      symbol: string;
      resolution: string;
      from: number;
      to: number;
      points: CandlePoint[];
    }
  | {
      error: string;
      details?: string;
    };

type QuoteResponse =
  | {
      symbol: string;
      quote: {
        c: number;
        o: number;
        h: number;
        l: number;
        pc?: number;
        t: number;
      };
    }
  | {
      error: string;
      details?: string;
    };

export type FinnhubPriceChartWidgetProps = {
  symbol: string;
  days?: number;
  resolution?: string;
  height?: number;
};

// TradingView Standard Colors
const COLORS = {
  BULL: "#26a69a",
  BEAR: "#ef5350",
  GRID: "#1e222d",
  AXIS_TEXT: "#787b86",
  BG: "#000000",
};

function formatNumber(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(value);
}

function getBucket(t: number, resolution: string) {
  const SECONDS: Record<string, number> = {
    "1": 60, "5": 300, "15": 900, "30": 1800, "60": 3600, "D": 86400, "W": 604800,
  };
  const step = SECONDS[resolution] || 60;
  return Math.floor(t / step) * step;
}

function formatTime(t: number, resolution: string) {
  if (!Number.isFinite(t) || t <= 0) return "—";
  try {
    const date = new Date(t * 1000);
    if (Number.isNaN(date.getTime())) return "—";
    if (resolution === "D" || resolution === "W") {
      return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
    }
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  } catch {
    return "—";
  }
}

export function FinnhubPriceChartWidget({
  symbol,
  days = 30,
  resolution = "D",
  height = 280,
}: FinnhubPriceChartWidgetProps) {
  const [payload, setPayload] = useState<CandlesResponse | null>(null);
  const [series, setSeries] = useState<CandlePoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let quoteInterval: number | null = null;
    const stopQuotePolling = () => { if (quoteInterval) window.clearInterval(quoteInterval); };

    async function fetchQuote() {
      const resp = await fetch(`/api/finnhub/quote?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
      const json = await resp.json().catch(() => null) as QuoteResponse | null;
      if (!resp.ok || !json || "error" in json) {
        if (resp.status === 403) throw new Error("Subscription required for live quotes");
        throw new Error(json && "error" in json ? json.error : "API Error");
      }
      const q = json.quote;
      // Some APIs return 0 for O/H/L if the market is closed or subscription is limited
      const currentPrice = q.c || q.pc || 0;
      if (currentPrice === 0) throw new Error("No value (Market closed?)");

      return {
        t: Number.isFinite(q.t) && q.t > 0 ? q.t : Math.floor(Date.now() / 1000),
        o: q.o || currentPrice, h: q.h || currentPrice, l: q.l || currentPrice, c: currentPrice, pc: q.pc,
      };
    }

    async function startQuotePolling() {
      stopQuotePolling();
      try {
        const initial = await fetchQuote();
        if (!cancelled) {
          const seeded: CandlePoint[] = [];
          if (initial.pc) seeded.push({ t: initial.t - 86400, o: initial.pc, h: Math.max(initial.pc, initial.o), l: Math.min(initial.pc, initial.o), c: initial.o });
          seeded.push({ t: initial.t, o: initial.o, h: initial.h, l: initial.l, c: initial.c });
          setSeries(seeded);
        }
        quoteInterval = window.setInterval(async () => {
          try {
            const next = await fetchQuote();
            if (cancelled) return;
            setSeries((prev) => {
              if (!prev) return prev;
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (getBucket(next.t, resolution) === getBucket(last.t, resolution)) {
                updated[updated.length - 1] = { ...last, h: Math.max(last.h, next.c), l: Math.min(last.l, next.c), c: next.c };
              } else {
                updated.push({ t: next.t, o: next.c, h: next.c, l: next.c, c: next.c });
              }
              return updated.slice(-80);
            });
          } catch { /* ignore */ }
        }, 3000);
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : "Quote load failed"); }
    }

    async function run() {
      setLoading(true); setError(null); setSeries(null);
      try {
        const url = new URL("/api/finnhub/candles", window.location.origin);
        url.searchParams.set("symbol", symbol); url.searchParams.set("resolution", resolution); url.searchParams.set("days", String(days));
        const resp = await fetch(url.toString(), { cache: "no-store" });
        const json = await resp.json().catch(() => null) as CandlesResponse | null;
        if (!resp.ok) {
          if (resp.status === 403) throw new Error("Access denied (403)");
          throw new Error((json as any)?.error || "API Error");
        }
        if (!cancelled && json && !("error" in json)) { setPayload(json); setSeries(json.points); }
      } catch (err) { if (!cancelled) { setPayload(null); await startQuotePolling(); } }
      finally { if (!cancelled) setLoading(false); }
    }

    run();
    return () => { cancelled = true; stopQuotePolling(); };
  }, [days, resolution, symbol]);

  const chart = useMemo(() => {
    let source = series ?? (payload && !("error" in payload) ? payload.points : null);
    if (!source || source.length === 0) return null;
    
    // Filter out invalid points to prevent crashes
    source = source.filter(p => Number.isFinite(p.t) && p.t > 0 && Number.isFinite(p.c));
    if (source.length === 0) return null;

    const allPrices = source.flatMap(p => [p.o, p.h, p.l, p.c]).filter(v => Number.isFinite(v));
    if (allPrices.length === 0) return null;

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const lastPoint = source[source.length - 1];

    const width = 800; const viewHeight = 280;
    const pL = 10; const pR = 60; const pT = 30; const pB = 30;
    const span = max - min || 1;
    const uW = width - pL - pR; const uH = viewHeight - pT - pB;
    const cW = Math.max(2, (uW / source.length) * 0.8);
    
    const candles = source.map((p, i) => {
      const x = pL + (i * uW) / Math.max(1, source.length - 1);
      const yH = pT + ((max - p.h) * uH) / span;
      const yL = pT + ((max - p.l) * uH) / span;
      const yO = pT + ((max - p.o) * uH) / span;
      const yC = pT + ((max - p.c) * uH) / span;
      const isB = p.c >= p.o;
      return { x, yH, yL, bT: Math.min(yO, yC), bH: Math.max(1, Math.abs(yO - yC)), isB, cY: yC, time: p.t };
    });

    const pLvls = [0, 1, 2, 3, 4].map(i => ({ price: max - (i * span) / 4, y: pT + (i * uH) / 4 }));
    const tLbls = candles.filter((_, i) => i % Math.max(1, Math.floor(candles.length / 6)) === 0).map(c => ({ label: formatTime(c.time, resolution), x: c.x }));
    const last = candles[candles.length - 1];

    return { 
      width, viewHeight, last: lastPoint, candles, cW, lastY: last.cY, 
      color: last.isB ? COLORS.BULL : COLORS.BEAR, pLvls, tLbls, pL, pR, pT, pB 
    };
  }, [payload, resolution, series]);

  return (
    <div className="rounded border border-zinc-800 bg-black text-zinc-100 flex flex-col p-3 select-none overflow-hidden hover:border-zinc-700 transition-colors" style={{ height }}>
      {/* TradingView-Style Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{symbol}</span>
          {chart && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="hidden sm:inline">O <span className="text-zinc-400">{formatNumber(chart.last.o)}</span></span>
              <span className="hidden sm:inline">H <span className="text-zinc-400">{formatNumber(chart.last.h)}</span></span>
              <span className="hidden sm:inline">L <span className="text-zinc-400">{formatNumber(chart.last.l)}</span></span>
              <span className="hidden sm:inline">C <span className="text-zinc-400">{formatNumber(chart.last.c)}</span></span>
            </div>
          )}
        </div>
        {chart && (
          <div className="flex items-center gap-2">
             <div className="text-xs font-bold font-mono" style={{ color: chart.color }}>{formatNumber(chart.last.c)}</div>
             <div className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">Live</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-zinc-700 animate-pulse">Initializing market data…</div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[10px] uppercase tracking-widest text-red-900/60 p-4 text-center">
          <div className="mb-1 font-bold">Data Unavailable</div>
          <div className="text-[9px] lowercase normal-case">{error}</div>
        </div>
      ) : !chart ? (
        <div className="flex-1 flex items-center justify-center text-[10px] uppercase tracking-widest text-zinc-800">No segments found</div>
      ) : (
        <div className="flex-1 relative">
          <svg className="w-full h-full overflow-hidden" viewBox={`0 0 ${chart.width} ${chart.viewHeight}`} preserveAspectRatio="none">
            {/* Background Grid */}
            {chart.pLvls.map((v, i) => (
              <line key={`h-${i}`} x1={chart.pL} y1={v.y} x2={chart.width - chart.pR} y2={v.y} stroke={COLORS.GRID} strokeWidth="0.5" />
            ))}
            {chart.tLbls.map((v, i) => (
              <line key={`v-${i}`} x1={v.x} y1={chart.pT} x2={v.x} y2={chart.viewHeight - chart.pB} stroke={COLORS.GRID} strokeWidth="0.5" />
            ))}

            {/* Price Tracker Line */}
            <line x1={chart.pL} y1={chart.lastY} x2={chart.width - chart.pR} y2={chart.lastY} stroke={chart.color} strokeWidth="0.5" strokeDasharray="3 3" className="opacity-60" />

            {/* Candlesticks */}
            {chart.candles.map((c, i) => (
              <g key={i}>
                <line x1={c.x} y1={c.yH} x2={c.x} y2={c.yL} stroke={c.isB ? COLORS.BULL : COLORS.BEAR} strokeWidth="1" />
                <rect x={c.x - chart.cW / 2} y={c.bT} width={chart.cW} height={c.bH} fill={c.isB ? COLORS.BULL : COLORS.BEAR} />
              </g>
            ))}

            {/* Axis Labels */}
            {chart.pLvls.map((v, i) => (
              <text key={`pl-${i}`} x={chart.width - chart.pR + 5} y={v.y + 3} className="text-[9px] font-mono" fill={COLORS.AXIS_TEXT}>{v.price.toFixed(2)}</text>
            ))}
            {chart.tLbls.map((v, i) => (
              <text key={`tl-${i}`} x={v.x} y={chart.viewHeight - 8} textAnchor="middle" className="text-[9px] font-mono" fill={COLORS.AXIS_TEXT}>{v.label}</text>
            ))}

            {/* Right Axis Price Tag */}
            <g transform={`translate(${chart.width - chart.pR}, ${chart.lastY - 7})`}>
              <rect width={chart.pR} height={14} fill={chart.color} rx="1" />
              <text x={chart.pR / 2} y={10} textAnchor="middle" className="text-[9px] font-bold font-mono" fill="white">{formatNumber(chart.last.c)}</text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
