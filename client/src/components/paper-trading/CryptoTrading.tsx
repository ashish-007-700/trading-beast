import { useState, useEffect, useCallback } from "react";
import OrderForm from "./OrderForm";
// import Portfolio from "./Portfolio";
import OrderHistory from "./OrderHistory";

// Types
export interface CryptoBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface CryptoOrder {
  orderId: number;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  price: string;
  origQty: string;
  executedQty: string;
  status: string;
  time: number;
}

export interface CryptoPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const CRYPTO_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "MATICUSDT",
];

export default function CryptoTrading() {
  const [balances, setBalances] = useState<CryptoBalance[]>([]);
  const [orders, setOrders] = useState<CryptoOrder[]>([]);
  // const [positions, setPositions] = useState<CryptoPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [isConnected, setIsConnected] = useState(false);

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/paper-trading/binance/account");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch account");
      }
      
      const data = await response.json();
      setBalances(data.balances || []);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch open orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/paper-trading/binance/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  // Place order
  const placeOrder = async (orderData: {
    symbol: string;
    side: "BUY" | "SELL";
    type: "LIMIT" | "MARKET";
    quantity: number;
    price?: number;
  }) => {
    try {
      setError(null);
      const response = await fetch("/api/paper-trading/binance/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Refresh data after order
      await Promise.all([fetchAccountData(), fetchOrders()]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cancel order
  const cancelOrder = async (symbol: string, orderId: number) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/paper-trading/binance/order?symbol=${symbol}&orderId=${orderId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel order");
      }

      await fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAccountData();
    fetchOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAccountData();
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAccountData, fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {isConnected ? "Connected to Binance Testnet" : "Not Connected"}
          </span>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAccountData();
            fetchOrders();
          }}
          className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
        >
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Place Order</h3>
            
            {/* Symbol Selector */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {CRYPTO_SYMBOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <OrderForm
              symbol={selectedSymbol}
              onSubmit={placeOrder}
              market="crypto"
            />
          </div>
        </div>

        {/* Portfolio & Balances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balances */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Wallet Balances</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {balances
                .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
                .slice(0, 8)
                .map((balance) => (
                  <div
                    key={balance.asset}
                    className="bg-gray-700/50 rounded-lg p-3"
                  >
                    <div className="text-xs text-gray-400">{balance.asset}</div>
                    <div className="text-lg font-mono mt-1">
                      {parseFloat(balance.free).toFixed(
                        balance.asset === "USDT" ? 2 : 6
                      )}
                    </div>
                    {parseFloat(balance.locked) > 0 && (
                      <div className="text-xs text-yellow-500 mt-1">
                        Locked: {parseFloat(balance.locked).toFixed(6)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            {balances.filter(
              (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
            ).length === 0 && (
              <p className="text-gray-500 text-sm">No balances found</p>
            )}
          </div>

          {/* Open Orders */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
            <OrderHistory
              orders={orders.map((o) => ({
                id: String(o.orderId),
                symbol: o.symbol,
                side: o.side,
                type: o.type,
                price: parseFloat(o.price),
                quantity: parseFloat(o.origQty),
                filled: parseFloat(o.executedQty),
                status: o.status,
                time: o.time,
              }))}
              onCancel={(id, symbol) => cancelOrder(symbol, parseInt(id))}
              market="crypto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
