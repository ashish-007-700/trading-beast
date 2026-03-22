"use client";

import { useEffect, useMemo, useState } from "react";

type FinnhubQuote = {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

type QuoteResponse = {
  symbol: string;
  quote: FinnhubQuote;
  error?: string;
  details?: string;
};

export type FinnhubQuoteWidgetProps = {
  symbol: string;
};

function formatNumber(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(value);
}

export function FinnhubQuoteWidget({ symbol }: FinnhubQuoteWidgetProps) {
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/finnhub/quote?symbol=${encodeURIComponent(symbol)}`,
          { cache: "no-store" }
        );

        const json = (await response.json().catch(() => null)) as QuoteResponse | null;

        if (!response.ok) {
          const message = json?.error || `Request failed (${response.status})`;
          throw new Error(message);
        }

        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const quote = data?.quote;

  const changeLabel = useMemo(() => {
    if (!quote) return null;
    const sign = quote.d > 0 ? "+" : "";
    return `${sign}${formatNumber(quote.d)} (${sign}${formatNumber(quote.dp)}%)`;
  }, [quote]);

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {symbol}
        </div>
        {changeLabel ? (
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {changeLabel}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading quote…
        </div>
      ) : error ? (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {error}
        </div>
      ) : quote ? (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Price</div>
            <div className="font-semibold">{formatNumber(quote.c)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Prev close</div>
            <div className="font-semibold">{formatNumber(quote.pc)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">High</div>
            <div className="font-semibold">{formatNumber(quote.h)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Low</div>
            <div className="font-semibold">{formatNumber(quote.l)}</div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          No data.
        </div>
      )}
    </div>
  );
}
