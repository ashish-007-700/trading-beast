import { useState } from "react";

interface OrderFormProps {
  symbol: string;
  onSubmit: (order: {
    symbol: string;
    side: "BUY" | "SELL";
    type: "LIMIT" | "MARKET";
    quantity: number;
    price?: number;
  }) => Promise<any>;
  market: "crypto" | "us-stocks";
}

export default function OrderForm({ symbol, onSubmit, market }: OrderFormProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Invalid quantity");
      return;
    }

    if (orderType === "LIMIT") {
      const px = parseFloat(price);
      if (isNaN(px) || px <= 0) {
        setError("Invalid price for limit order");
        return;
      }
    }

    setSubmitting(true);

    try {
      await onSubmit({
        symbol,
        side,
        type: orderType,
        quantity: qty,
        price: orderType === "LIMIT" ? parseFloat(price) : undefined,
      });
      
      setSuccess(`${side} order placed successfully`);
      setQuantity("");
      setPrice("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("BUY")}
          className={`py-2 rounded font-medium transition ${
            side === "BUY"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("SELL")}
          className={`py-2 rounded font-medium transition ${
            side === "SELL"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Order Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderType("LIMIT")}
            className={`py-1.5 text-sm rounded transition ${
              orderType === "LIMIT"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            Limit
          </button>
          <button
            type="button"
            onClick={() => setOrderType("MARKET")}
            className={`py-1.5 text-sm rounded transition ${
              orderType === "MARKET"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            Market
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Quantity {market === "crypto" ? "(Amount)" : "(Shares)"}
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={market === "crypto" ? "0.001" : "10"}
          step={market === "crypto" ? "0.001" : "1"}
          min="0"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Price (for limit orders) */}
      {orderType === "LIMIT" && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-green-400 bg-green-900/20 rounded p-2">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-2.5 rounded font-medium transition ${
          side === "BUY"
            ? "bg-green-600 hover:bg-green-700 disabled:bg-green-800"
            : "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Placing Order...
          </span>
        ) : (
          `${side} ${symbol}`
        )}
      </button>
    </form>
  );
}
