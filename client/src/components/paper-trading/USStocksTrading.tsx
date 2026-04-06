import { useState, useEffect, useCallback } from "react";
import OrderForm from "./OrderForm";
import OrderHistory from "./OrderHistory";

// Types
export interface IBKRAccount {
  accountId: string;
  accountType: string;
  currency: string;
  availableFunds: number;
  buyingPower: number;
  netLiquidation: number;
}

export interface IBKRPosition {
  conid: number;
  symbol: string;
  description: string;
  position: number;
  marketPrice: number;
  marketValue: number;
  avgCost: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface IBKROrder {
  orderId: number;
  conid: number;
  symbol: string;
  side: "BUY" | "SELL";
  orderType: string;
  price: number;
  quantity: number;
  filledQty: number;
  status: string;
  lastExecutionTime: string;
}

const US_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "JPM", name: "JPMorgan Chase" },
];

export default function USStocksTrading() {
  const [account, setAccount] = useState<IBKRAccount | null>(null);
  const [positions, setPositions] = useState<IBKRPosition[]>([]);
  const [orders, setOrders] = useState<IBKROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [isConnected, setIsConnected] = useState(false);

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/paper-trading/ibkr/account");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch account");
      }
      
      const data = await response.json();
      setAccount(data.account);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch positions
  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch("/api/paper-trading/ibkr/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/paper-trading/ibkr/orders");
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
      const response = await fetch("/api/paper-trading/ibkr/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Refresh data after order
      await Promise.all([fetchAccountData(), fetchPositions(), fetchOrders()]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/paper-trading/ibkr/order/${orderId}`,
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
    fetchPositions();
    fetchOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAccountData();
      fetchPositions();
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAccountData, fetchPositions, fetchOrders]);

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
            {isConnected
              ? "Connected to Interactive Brokers (Paper)"
              : "Not Connected - Ensure TWS/Gateway is running"}
          </span>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAccountData();
            fetchPositions();
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
                {US_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <OrderForm
              symbol={selectedSymbol}
              onSubmit={placeOrder}
              market="us-stocks"
            />
          </div>
        </div>

        {/* Account & Positions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Summary */}
          {account && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Net Liquidation</div>
                  <div className="text-lg font-mono mt-1 text-green-400">
                    ${account.netLiquidation.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Available Funds</div>
                  <div className="text-lg font-mono mt-1">
                    ${account.availableFunds.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Buying Power</div>
                  <div className="text-lg font-mono mt-1">
                    ${account.buyingPower.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Account Type</div>
                  <div className="text-lg font-mono mt-1">{account.accountType}</div>
                </div>
              </div>
            </div>
          )}

          {/* Positions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Positions</h3>
            {positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Avg Cost</th>
                      <th className="pb-2">Mkt Price</th>
                      <th className="pb-2">Mkt Value</th>
                      <th className="pb-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.conid} className="border-b border-gray-700/50">
                        <td className="py-2 font-medium">{pos.symbol}</td>
                        <td className="py-2">{pos.position}</td>
                        <td className="py-2">${pos.avgCost.toFixed(2)}</td>
                        <td className="py-2">${pos.marketPrice.toFixed(2)}</td>
                        <td className="py-2">${pos.marketValue.toLocaleString()}</td>
                        <td
                          className={`py-2 ${
                            pos.unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          ${pos.unrealizedPnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No positions</p>
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
                type: o.orderType as "LIMIT" | "MARKET",
                price: o.price,
                quantity: o.quantity,
                filled: o.filledQty,
                status: o.status,
                time: new Date(o.lastExecutionTime).getTime(),
              }))}
              onCancel={(id) => cancelOrder(id)}
              market="us-stocks"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
