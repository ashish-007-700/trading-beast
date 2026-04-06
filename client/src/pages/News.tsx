import { useEffect, useState, useCallback } from "react";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category: string;
  related: string;
}

type NewsCategory = "general" | "forex" | "crypto" | "merger";
type NewsMode = "market" | "company";

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "merger", label: "M&A" },
];

const POPULAR_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"];

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<NewsMode>("market");
  const [category, setCategory] = useState<NewsCategory>("general");
  const [symbol, setSymbol] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("AAPL");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url: string;
      if (mode === "market") {
        url = `/api/finnhub/market-news?category=${category}`;
      } else {
        url = `/api/finnhub/news?symbol=${encodeURIComponent(symbol)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [mode, category, symbol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleSymbolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim().toUpperCase();
    if (trimmed) {
      setSymbol(trimmed);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Market News
        </h1>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "rgba(41,98,255,0.15)",
            color: "#2962FF",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("market")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "market" ? "bg-blue-600 text-white" : ""
          }`}
          style={mode !== "market" ? { background: "var(--card)", color: "var(--foreground)" } : {}}
        >
          Market News
        </button>
        <button
          onClick={() => setMode("company")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "company" ? "bg-blue-600 text-white" : ""
          }`}
          style={mode !== "company" ? { background: "var(--card)", color: "var(--foreground)" } : {}}
        >
          Company News
        </button>
      </div>

      {/* Filters */}
      {mode === "market" ? (
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                category === cat.value
                  ? "bg-blue-600 text-white"
                  : ""
              }`}
              style={
                category !== cat.value
                  ? { background: "var(--card)", color: "#787B86" }
                  : {}
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <form onSubmit={handleSymbolSearch} className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="Enter symbol (e.g., AAPL)"
              className="flex-1 max-w-xs px-4 py-2 rounded-lg text-sm"
              style={{
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSymbol(sym);
                  setSearchInput(sym);
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  symbol === sym ? "bg-blue-600 text-white" : ""
                }`}
                style={
                  symbol !== sym
                    ? { background: "var(--card)", color: "#787B86" }
                    : {}
                }
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{ background: "rgba(239,83,80,0.1)", color: "#EF5350" }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && news.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p style={{ color: "#787B86" }}>Loading news...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && news.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <p style={{ color: "#787B86" }}>No news found</p>
        </div>
      )}

      {/* News Grid */}
      {news.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
              style={{ background: "var(--card)" }}
            >
              {item.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3
                  className="font-semibold text-sm mb-2 line-clamp-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.headline}
                </h3>
                <p
                  className="text-xs mb-3 line-clamp-2"
                  style={{ color: "#787B86" }}
                >
                  {item.summary}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: "#787B86" }}>
                  <span>{item.source}</span>
                  <span>{formatTimeAgo(item.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
