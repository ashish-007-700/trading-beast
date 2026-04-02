"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  CandlestickData,
  HistogramData,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
} from "lightweight-charts";
import { getDataSourceInfo } from "../lib/symbolClassifier";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface TradingViewChartProps {
  symbol: string;
  /** Chart container height in pixels */
  height?: number;
  /** Show timeframe selector buttons */
  showToolbar?: boolean;
}

interface OhlcInfo {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
  change: number;
  changePercent: number;
}

/* ------------------------------------------------------------------ */
/*  Timeframe configurations                                           */
/* ------------------------------------------------------------------ */
const TIMEFRAMES = [
  { label: "1m", interval: "1m", range: "5d" },
  { label: "5m", interval: "5m", range: "1mo" },
  { label: "15m", interval: "15m", range: "1mo" },
  { label: "1H", interval: "60m", range: "6mo" },
  { label: "D", interval: "1d", range: "5y" },
] as const;

type TimeframeKey = (typeof TIMEFRAMES)[number]["label"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatPrice(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return v.toFixed(2);
  return v.toPrecision(4);
}

function formatVolume(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(0);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  height = 500,
  showToolbar = true,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeKey>("D");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ohlc, setOhlc] = useState<OhlcInfo | null>(null);
  const [dataCount, setDataCount] = useState(0);

  /* ---- Chart initialization ---- */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#787B86",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: "#2962FF",
        },
        horzLine: {
          labelBackgroundColor: "#2962FF",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        minBarSpacing: 2,
      },
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26A69A",
      downColor: "#EF5350",
      borderVisible: false,
      wickUpColor: "#26A69A",
      wickDownColor: "#EF5350",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Crosshair move -> update OHLC header
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        return;
      }
      const candle = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      const vol = param.seriesData.get(volumeSeries) as HistogramData | undefined;
      if (candle) {
        const change = candle.close - candle.open;
        const changePercent = candle.open !== 0 ? (change / candle.open) * 100 : 0;
        setOhlc({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: (vol as any)?.value ?? 0,
          time: candle.time as number,
          change,
          changePercent,
        });
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  /* ---- Data fetching ---- */
  const fetchData = useCallback(async () => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    setLoading(true);
    setError(null);

    const tf = TIMEFRAMES.find((t) => t.label === activeTimeframe) ?? TIMEFRAMES[4];

    try {
      // Route to correct API based on symbol type
      const sourceInfo = getDataSourceInfo(symbol);
      let url: string;
      
      if (sourceInfo.source === "binance") {
        // Crypto symbols use Binance API
        url = `/api/binance/candles?symbol=${encodeURIComponent(symbol)}&interval=${tf.interval}&range=${tf.range}`;
      } else {
        // Stocks and everything else use Yahoo API
        url = `/api/yahoo/candles?symbol=${encodeURIComponent(symbol)}&interval=${tf.interval}&range=${tf.range}`;
      }
      
      const resp = await fetch(url, { cache: "no-store" });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${resp.status}`);
      }

      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      if (!json.points || json.points.length === 0) throw new Error("No data returned");

      const candles: CandlestickData[] = [];
      const volumes: HistogramData[] = [];

      for (const p of json.points) {
        const time = p.t as UTCTimestamp;
        candles.push({ time, open: p.o, high: p.h, low: p.l, close: p.c });
        const color = p.c >= p.o ? "rgba(38,166,154,0.4)" : "rgba(239,83,80,0.4)";
        volumes.push({ time, value: p.v ?? 0, color });
      }

      // Sort ascending by time
      candles.sort((a, b) => (a.time as number) - (b.time as number));
      volumes.sort((a, b) => (a.time as number) - (b.time as number));

      candleSeriesRef.current.setData(candles);
      volumeSeriesRef.current.setData(volumes);
      chartRef.current?.timeScale().fitContent();
      setDataCount(candles.length);

      // Set initial OHLC to the last candle
      if (candles.length > 0) {
        const last = candles[candles.length - 1];
        const change = last.close - last.open;
        const changePercent = last.open !== 0 ? (change / last.open) * 100 : 0;
        setOhlc({
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          volume: (volumes[volumes.length - 1] as any)?.value ?? 0,
          time: last.time as number,
          change,
          changePercent,
        });
      }
    } catch (err: any) {
      console.error("Chart fetch error:", err);
      setError(err.message || "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [symbol, activeTimeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  const isPositive = ohlc ? ohlc.close >= ohlc.open : true;

  return (
    <div className="flex flex-col w-full select-none" style={{ fontFamily: "'Inter', 'Trebuchet MS', sans-serif" }}>
      {/* ---- Top bar: Symbol + OHLC overlay ---- */}
      <div
        className="flex items-center gap-4 px-3 py-2 rounded-t-lg"
        style={{ background: "#1E222D" }}
      >
        <span className="text-sm font-bold tracking-wide" style={{ color: "#D1D4DC" }}>
          {symbol}
        </span>
        {ohlc && (
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span style={{ color: "#787B86" }}>
              O{" "}
              <span style={{ color: isPositive ? "#26A69A" : "#EF5350" }}>
                {formatPrice(ohlc.open)}
              </span>
            </span>
            <span style={{ color: "#787B86" }}>
              H{" "}
              <span style={{ color: isPositive ? "#26A69A" : "#EF5350" }}>
                {formatPrice(ohlc.high)}
              </span>
            </span>
            <span style={{ color: "#787B86" }}>
              L{" "}
              <span style={{ color: isPositive ? "#26A69A" : "#EF5350" }}>
                {formatPrice(ohlc.low)}
              </span>
            </span>
            <span style={{ color: "#787B86" }}>
              C{" "}
              <span style={{ color: isPositive ? "#26A69A" : "#EF5350" }}>
                {formatPrice(ohlc.close)}
              </span>
            </span>
            {ohlc.volume > 0 && (
              <span style={{ color: "#787B86" }}>
                Vol{" "}
                <span style={{ color: "#D1D4DC" }}>{formatVolume(ohlc.volume)}</span>
              </span>
            )}
            <span
              className="font-semibold"
              style={{ color: isPositive ? "#26A69A" : "#EF5350" }}
            >
              {isPositive ? "+" : ""}
              {formatPrice(ohlc.change)} ({isPositive ? "+" : ""}
              {ohlc.changePercent.toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Data count badge */}
        {dataCount > 0 && !loading && (
          <span
            className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ background: "#2A2E39", color: "#787B86" }}
          >
            {dataCount} candles
          </span>
        )}

        {loading && (
          <span
            className="ml-auto text-[10px] animate-pulse"
            style={{ color: "#787B86" }}
          >
            Loading…
          </span>
        )}
      </div>

      {/* ---- Timeframe toolbar ---- */}
      {showToolbar && (
        <div
          className="flex items-center gap-1 px-3 py-1.5 border-b"
          style={{
            background: "#1E222D",
            borderColor: "rgba(42,46,57,0.5)",
          }}
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setActiveTimeframe(tf.label)}
              className="px-2.5 py-1 text-[11px] font-bold rounded transition-all"
              style={{
                background: activeTimeframe === tf.label ? "#2962FF" : "transparent",
                color: activeTimeframe === tf.label ? "#FFFFFF" : "#787B86",
              }}
              onMouseEnter={(e) => {
                if (activeTimeframe !== tf.label) {
                  e.currentTarget.style.background = "#2A2E39";
                  e.currentTarget.style.color = "#D1D4DC";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTimeframe !== tf.label) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#787B86";
                }
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      )}

      {/* ---- Chart container ---- */}
      <div className="relative" style={{ height, background: "#131722" }}>
        {/* Error overlay */}
        {error && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(19,23,34,0.95)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#EF5350" }}>
              {error}
            </p>
            <button
              onClick={fetchData}
              className="px-4 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                background: "#2962FF",
                color: "#FFFFFF",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading overlay */}
        {loading && !error && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: "rgba(19,23,34,0.8)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "rgba(41,98,255,0.3)",
                  borderTopColor: "#2962FF",
                }}
              />
              <span className="text-xs" style={{ color: "#787B86" }}>
                Loading {symbol}…
              </span>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
