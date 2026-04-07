import { TradeAction } from "../types/holdings";

interface TradeActionsTableProps {
  actions: TradeAction[];
}

export default function TradeActionsTable({ actions }: TradeActionsTableProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  const sortedActions = [...actions].sort((a, b) => a.step - b.step);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-[#131722]">
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Step</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Action Type</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Asset</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Strategy</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Direction</th>
            <th className="px-3 py-2 text-right text-gray-400 font-medium">Price</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Time</th>
            <th className="px-3 py-2 text-left text-gray-400 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sortedActions.map((action) => (
            <tr key={action.step} className="border-b border-gray-800">
              <td className="px-3 py-2 text-white">{action.step}</td>
              <td className="px-3 py-2 text-white">{action.actionType}</td>
              <td className="px-3 py-2 text-white font-mono">{action.asset}</td>
              <td className="px-3 py-2 text-gray-300">{action.strategy || '—'}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  action.direction === 'Buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {action.direction}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-white font-mono">${action.price.toFixed(2)}</td>
              <td className="px-3 py-2 text-gray-300 text-xs">{formatTime(action.time)}</td>
              <td className="px-3 py-2 text-gray-400 text-xs">{action.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
