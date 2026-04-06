import { useState } from "react";
import { JournalEntry } from "../types/journal";

interface JournalTableProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function JournalTable({ entries, onEdit, onDelete }: JournalTableProps) {
  const [sortKey, setSortKey] = useState<keyof JournalEntry>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: keyof JournalEntry) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const formatPrice = (price: number | undefined) => {
    if (price == null) return "—";
    return price.toFixed(2);
  };

  const formatPnL = (pnl: number | undefined) => {
    if (pnl == null) return "—";
    const sign = pnl >= 0 ? "+" : "";
    return `${sign}$${pnl.toFixed(2)}`;
  };

  return (
    <div className="overflow-x-auto bg-[#1E222D] rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("tradeName")}>
              Trade Name
            </th>
            <th className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("playbookName")}>
              Playbook Name
            </th>
            <th className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("pair")}>
              Pair
            </th>
            <th className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("direction")}>
              Direction
            </th>
            <th className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("exchange")}>
              Exchange
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("entryPrice")}>
              Entry Price
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("stopPrice")}>
              Stop Price
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("targetPrice")}>
              Target
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("positionSize")}>
              Position
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("riskPercentage")}>
              Risk %
            </th>
            <th className="px-4 py-3 text-center text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("status")}>
              Status
            </th>
            <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                onClick={() => handleSort("pnl")}>
              PnL
            </th>
            <th className="px-4 py-3 text-center text-gray-400 font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                No journal entries yet. Add your first trade!
              </td>
            </tr>
          ) : (
            sortedEntries.map((entry) => (
              <tr
                key={entry._id}
                className="border-b border-gray-800 hover:bg-[#2A2E39] transition-colors"
              >
                <td className="px-4 py-3 text-white font-medium">{entry.tradeName}</td>
                <td className="px-4 py-3 text-gray-300">{entry.playbookName || "—"}</td>
                <td className="px-4 py-3 text-white font-mono">{entry.pair}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      entry.direction === "LONG"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {entry.direction}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{entry.exchange}</td>
                <td className="px-4 py-3 text-right text-white font-mono">
                  ${formatPrice(entry.entryPrice)}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono">
                  {entry.stopPrice ? `$${formatPrice(entry.stopPrice)}` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-300 font-mono">
                  {entry.targetPrice ? `$${formatPrice(entry.targetPrice)}` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-white font-mono">
                  {entry.positionSize}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {entry.riskPercentage ? `${entry.riskPercentage}%` : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      entry.status === "OPEN"
                        ? "bg-blue-500/20 text-blue-400"
                        : entry.status === "CLOSED"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold font-mono ${
                    (entry.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPnL(entry.pnl)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onEdit(entry)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${entry.tradeName}"?`)) {
                        onDelete(entry._id);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
