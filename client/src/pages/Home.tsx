import { useState, useEffect, useRef } from 'react';
import { TradingViewChart } from '../components/TradingViewChart';

// Popular symbols for suggestions
const POPULAR_SYMBOLS = [
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'Crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', category: 'Crypto' },
  { symbol: 'XRP-USD', name: 'Ripple', category: 'Crypto' },
  // US Stocks
  { symbol: 'AAPL', name: 'Apple', category: 'US Stock' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'US Stock' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'US Stock' },
  { symbol: 'AMZN', name: 'Amazon', category: 'US Stock' },
  { symbol: 'TSLA', name: 'Tesla', category: 'US Stock' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'US Stock' },
  { symbol: 'META', name: 'Meta', category: 'US Stock' },
  // Indian Stocks
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', category: 'Indian Stock' },
  { symbol: 'TCS.NS', name: 'TCS', category: 'Indian Stock' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', category: 'Indian Stock' },
  { symbol: 'INFY.NS', name: 'Infosys', category: 'Indian Stock' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', category: 'Indian Stock' },
  // Commodities
  { symbol: 'GC=F', name: 'Gold', category: 'Commodity' },
  { symbol: 'SI=F', name: 'Silver', category: 'Commodity' },
  { symbol: 'CL=F', name: 'Crude Oil', category: 'Commodity' },
  { symbol: 'NG=F', name: 'Natural Gas', category: 'Commodity' },
  // Indices
  { symbol: '^GSPC', name: 'S&P 500', category: 'Index' },
  { symbol: '^DJI', name: 'Dow Jones', category: 'Index' },
  { symbol: '^NSEI', name: 'Nifty 50', category: 'Index' },
  { symbol: '^NSEBANK', name: 'Bank Nifty', category: 'Index' },
  // Forex
  { symbol: 'EURUSD=X', name: 'EUR/USD', category: 'Forex' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', category: 'Forex' },
  { symbol: 'USDINR=X', name: 'USD/INR', category: 'Forex' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSymbol, setActiveSymbol] = useState('BTC-USD');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.trim()
    ? POPULAR_SYMBOLS.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : POPULAR_SYMBOLS.slice(0, 8);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowSuggestions(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSelectSymbol(filteredSuggestions[selectedIndex].symbol);
        } else if (searchQuery.trim()) {
          // Allow custom symbol entry
          handleSelectSymbol(searchQuery.trim().toUpperCase());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSymbol = (symbol: string) => {
    setActiveSymbol(symbol);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Crypto':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'US Stock':
        return 'bg-blue-500/20 text-blue-400';
      case 'Indian Stock':
        return 'bg-orange-500/20 text-orange-400';
      case 'Commodity':
        return 'bg-amber-500/20 text-amber-400';
      case 'Index':
        return 'bg-purple-500/20 text-purple-400';
      case 'Forex':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#131722]">
      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-6" ref={searchRef}>
        <div className="relative">
          <div className="flex items-center bg-[#1E222D] rounded-lg border border-[#2A2E39] focus-within:border-[#2962FF] transition-colors">
            {/* Search Icon */}
            <div className="pl-4 pr-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for symbols (e.g., BTC-USD, AAPL, RELIANCE.NS, GC=F)"
              className="flex-1 bg-transparent py-3 text-white placeholder-gray-500 outline-none text-sm"
            />

            {/* Active Symbol Badge */}
            <div className="px-3">
              <span className="px-2 py-1 bg-[#2962FF]/20 text-[#2962FF] text-xs font-medium rounded">
                {activeSymbol}
              </span>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-2 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-xl max-h-80 overflow-y-auto">
              {filteredSuggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-[#2A2E39]">
                    {searchQuery ? 'Search Results' : 'Popular Symbols'}
                  </div>
                  {filteredSuggestions.map((item, index) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelectSymbol(item.symbol)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-[#2962FF]/20'
                          : 'hover:bg-[#2A2E39]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium text-sm">
                          {item.symbol}
                        </span>
                        <span className="text-gray-400 text-xs">{item.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </button>
                  ))}
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSelectSymbol(searchQuery.trim().toUpperCase())}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left border-t border-[#2A2E39] transition-colors ${
                        selectedIndex === filteredSuggestions.length
                          ? 'bg-[#2962FF]/20'
                          : 'hover:bg-[#2A2E39]'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      <span className="text-gray-300 text-sm">
                        Search for "{searchQuery.trim().toUpperCase()}"
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  No symbols found. Press Enter to search for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick access chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['BTC-USD', 'ETH-USD', 'AAPL', 'RELIANCE.NS', 'GC=F', '^NSEI'].map(
            (symbol) => (
              <button
                key={symbol}
                onClick={() => handleSelectSymbol(symbol)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  activeSymbol === symbol
                    ? 'bg-[#2962FF] text-white'
                    : 'bg-[#2A2E39] text-gray-400 hover:bg-[#363A45] hover:text-white'
                }`}
              >
                {symbol}
              </button>
            )
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-2xl font-bold mb-4 flex items-center gap-3"
          style={{ color: 'var(--foreground)' }}
        >
          <span>{activeSymbol}</span>
          <span className="text-sm font-normal text-gray-500">Live Chart</span>
        </h1>
        <TradingViewChart key={activeSymbol} symbol={activeSymbol} height={600} />
      </div>
    </div>
  );
}
