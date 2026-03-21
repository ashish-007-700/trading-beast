"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TradingViewWidgetTheme = "light" | "dark";
type TradingViewWidgetThemeSetting = TradingViewWidgetTheme | "auto";

export type TradingViewWidgetProps = {
  symbol?: string;
  interval?: string;
  theme?: TradingViewWidgetThemeSetting;
  locale?: string;
  height?: number;
};

export function TradingViewWidget({
  symbol = "NASDAQ:AAPL",
  interval = "D",
  theme = "auto",
  locale = "en",
  height = 600,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoTheme, setAutoTheme] = useState<TradingViewWidgetTheme>("light");

  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setAutoTheme(mediaQuery.matches ? "dark" : "light");

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    // Safari < 14
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [theme]);

  const resolvedTheme = theme === "auto" ? autoTheme : theme;

  const config = useMemo(
    () =>
      ({
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme: resolvedTheme,
        style: "1",
        locale,
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
      }) as const,
    [interval, locale, resolvedTheme, symbol]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.innerHTML = JSON.stringify(config);

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [config]);

  return (
    <div
      className="w-full"
      ref={containerRef}
      aria-label="TradingView advanced chart"
      style={{ height }}
    />
  );
}
