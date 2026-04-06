interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  price: number;
  quantity: number;
  filled: number;
  status: string;
  time: number;
}

interface OrderHistoryProps {
  orders: Order[];
  onCancel?: (orderId: string, symbol: string) => void;
  market: "crypto" | "us-stocks";
}

export default function OrderHistory({
  orders,
  onCancel,
  market,
}: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">
        No open orders
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "NEW":
      case "OPEN":
      case "PENDING":
        return "text-yellow-400";
      case "FILLED":
      case "EXECUTED":
        return "text-green-400";
      case "PARTIALLY_FILLED":
        return "text-blue-400";
      case "CANCELED":
      case "CANCELLED":
      case "REJECTED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const canCancel = (status: string) => {
    const cancelable = ["NEW", "OPEN", "PENDING", "PARTIALLY_FILLED"];
    return cancelable.includes(status.toUpperCase());
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-700">
            <th className="pb-2">Time</th>
            <th className="pb-2">Symbol</th>
            <th className="pb-2">Side</th>
            <th className="pb-2">Type</th>
            <th className="pb-2 text-right">Price</th>
            <th className="pb-2 text-right">Qty</th>
            <th className="pb-2 text-right">Filled</th>
            <th className="pb-2">Status</th>
            {onCancel && <th className="pb-2"></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-gray-700/50 hover:bg-gray-700/30"
            >
              <td className="py-2 text-xs text-gray-400">
                {formatTime(order.time)}
              </td>
              <td className="py-2 font-medium">{order.symbol}</td>
              <td
                className={`py-2 font-medium ${
                  order.side === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {order.side}
              </td>
              <td className="py-2 text-gray-400">{order.type}</td>
              <td className="py-2 text-right font-mono">
                {order.type === "MARKET" ? (
                  <span className="text-gray-500">MKT</span>
                ) : (
                  <>
                    {market === "us-stocks" && "$"}
                    {order.price.toFixed(2)}
                  </>
                )}
              </td>
              <td className="py-2 text-right font-mono">
                {order.quantity.toLocaleString(undefined, {
                  minimumFractionDigits: market === "crypto" ? 6 : 0,
                  maximumFractionDigits: market === "crypto" ? 6 : 0,
                })}
              </td>
              <td className="py-2 text-right font-mono">
                {order.filled.toLocaleString(undefined, {
                  minimumFractionDigits: market === "crypto" ? 6 : 0,
                  maximumFractionDigits: market === "crypto" ? 6 : 0,
                })}
              </td>
              <td className={`py-2 ${getStatusColor(order.status)}`}>
                {order.status}
              </td>
              {onCancel && (
                <td className="py-2">
                  {canCancel(order.status) && (
                    <button
                      onClick={() => onCancel(order.id, order.symbol)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
