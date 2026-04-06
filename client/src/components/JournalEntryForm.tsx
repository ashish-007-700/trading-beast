import { useState, useEffect } from "react";
import { JournalEntry, JournalFormData } from "../types/journal";

interface JournalEntryFormProps {
  entry?: JournalEntry | null;
  onSave: (data: Partial<JournalFormData>) => void;
  onCancel: () => void;
}

export default function JournalEntryForm({ entry, onSave, onCancel }: JournalEntryFormProps) {
  const [formData, setFormData] = useState<Partial<JournalFormData>>({
    tradeName: "",
    playbookName: "",
    pair: "",
    direction: "LONG",
    exchange: "",
    entryPrice: 0,
    stopPrice: undefined,
    targetPrice: undefined,
    positionSize: 0,
    riskPercentage: undefined,
    status: "OPEN",
    pnl: 0,
    pnlPercentage: 0,
    entryRules: "",
    exitRules: "",
    notes: "",
    entryTime: new Date().toISOString(),
  });

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof JournalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E222D] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1E222D] border-b border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            {entry ? "Edit Journal Entry" : "New Journal Entry"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Trade Name *
              </label>
              <input
                type="text"
                required
                value={formData.tradeName}
                onChange={(e) => handleChange("tradeName", e.target.value)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="My Breakout Trade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Playbook Name
              </label>
              <input
                type="text"
                value={formData.playbookName || ""}
                onChange={(e) => handleChange("playbookName", e.target.value)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="Breakout Strategy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pair *
              </label>
              <input
                type="text"
                required
                value={formData.pair}
                onChange={(e) => handleChange("pair", e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="BTCUSDT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Direction *
              </label>
              <select
                value={formData.direction}
                onChange={(e) => handleChange("direction", e.target.value as "LONG" | "SHORT")}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Exchange *
              </label>
              <input
                type="text"
                required
                value={formData.exchange}
                onChange={(e) => handleChange("exchange", e.target.value)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="Binance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as "OPEN" | "CLOSED" | "CANCELLED")}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Entry Price *
              </label>
              <input
                type="number"
                step="0.00000001"
                required
                value={formData.entryPrice}
                onChange={(e) => handleChange("entryPrice", parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stop Price
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.stopPrice || ""}
                onChange={(e) => handleChange("stopPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Target Price
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.targetPrice || ""}
                onChange={(e) => handleChange("targetPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Position & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Position Size *
              </label>
              <input
                type="number"
                step="0.00000001"
                required
                value={formData.positionSize}
                onChange={(e) => handleChange("positionSize", parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Risk Percentage
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.riskPercentage || ""}
                onChange={(e) => handleChange("riskPercentage", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="2.0"
              />
            </div>
          </div>

          {/* PnL (for closed trades) */}
          {formData.status === "CLOSED" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  PnL ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pnl || 0}
                  onChange={(e) => handleChange("pnl", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  PnL (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pnlPercentage || 0}
                  onChange={(e) => handleChange("pnlPercentage", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Rules & Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Entry Rules
              </label>
              <textarea
                value={formData.entryRules || ""}
                onChange={(e) => handleChange("entryRules", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="What were your entry criteria?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Exit Rules
              </label>
              <textarea
                value={formData.exitRules || ""}
                onChange={(e) => handleChange("exitRules", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="What are your exit criteria?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#131722] border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="Additional notes about this trade..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {entry ? "Update Entry" : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
