interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioProps {
  positions: Position[];
  market: "crypto" | "us-stocks";
}

export default function Portfolio({ positions, market }: PortfolioProps) {
  const totalValue = positions.reduce(
    (sum, p) => sum + p.quantity * p.currentPrice,
    0
  );
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  if (positions.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-8 text-center">
        No open positions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Total Value</div>
          <div className="text-lg font-mono mt-1">
            {market === "crypto" ? "" : "$"}
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {market === "crypto" && " USDT"}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Total P&L</div>
          <div
            className={`text-lg font-mono mt-1 ${
              totalPnl >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}
            {market === "crypto" ? "" : "$"}
            {totalPnl.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left border-b border-gray-700">
              <th className="pb-2">Symbol</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Avg Price</th>
              <th className="pb-2 text-right">Current</th>
              <th className="pb-2 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.symbol}
                className="border-b border-gray-700/50 hover:bg-gray-700/30"
              >
                <td className="py-2 font-medium">{pos.symbol}</td>
                <td className="py-2 text-right font-mono">
                  {pos.quantity.toLocaleString(undefined, {
                    minimumFractionDigits: market === "crypto" ? 6 : 0,
                    maximumFractionDigits: market === "crypto" ? 6 : 0,
                  })}
                </td>
                <td className="py-2 text-right font-mono">
                  {market === "us-stocks" && "$"}
                  {pos.avgPrice.toFixed(2)}
                </td>
                <td className="py-2 text-right font-mono">
                  {market === "us-stocks" && "$"}
                  {pos.currentPrice.toFixed(2)}
                </td>
                <td
                  className={`py-2 text-right font-mono ${
                    pos.pnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pos.pnl >= 0 ? "+" : ""}
                  {market === "us-stocks" && "$"}
                  {pos.pnl.toFixed(2)}
                  <span className="text-xs ml-1">
                    ({pos.pnlPercent >= 0 ? "+" : ""}
                    {pos.pnlPercent.toFixed(2)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
