import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

interface ChartAlertOverlayProps {
  symbol: string;
  currentPrice: number;
  chartHeight: number;
  priceRange: { min: number; max: number };
  onAlertCreated?: () => void;
}

const API_URL = 'http://localhost:5000/api/alerts';

export default function ChartAlertOverlay({
  symbol,
  currentPrice,
  chartHeight,
  priceRange,
  onAlertCreated,
}: ChartAlertOverlayProps) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const [hoverY, setHoverY] = useState<number | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [creating, setCreating] = useState(false);

  // Convert Y position to price
  const yToPrice = useCallback((y: number): number => {
    const ratio = y / chartHeight;
    return priceRange.max - ratio * (priceRange.max - priceRange.min);
  }, [chartHeight, priceRange]);

  // Convert price to Y position
  const priceToY = useCallback((price: number): number => {
    const ratio = (priceRange.max - price) / (priceRange.max - priceRange.min);
    return ratio * chartHeight;
  }, [chartHeight, priceRange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAuthenticated) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setHoverY(y);
    setShowButton(true);
  }, [isAuthenticated]);

  const handleMouseLeave = useCallback(() => {
    setHoverY(null);
    setShowButton(false);
  }, []);

  const createAlert = async (condition: 'above' | 'below') => {
    if (!hoverY || !accessToken) return;

    const targetPrice = yToPrice(hoverY);
    
    setCreating(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          symbol,
          targetPrice: Number(targetPrice.toFixed(2)),
          condition,
        }),
      });

      if (response.ok) {
        onAlertCreated?.();
        setShowButton(false);
        setHoverY(null);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isAuthenticated) return null;

  const hoverPrice = hoverY !== null ? yToPrice(hoverY) : null;
  const isAboveCurrentPrice = hoverPrice !== null && hoverPrice > currentPrice;

  return (
    <div
      className="absolute inset-0 pointer-events-auto z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'crosshair' }}
    >
      {/* Horizontal price line */}
      {hoverY !== null && showButton && (
        <>
          {/* Dashed line */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: hoverY,
              borderTop: '1px dashed rgba(41, 98, 255, 0.6)',
            }}
          />

          {/* Price label */}
          <div
            className="absolute right-2 px-2 py-1 bg-blue-600 text-white text-xs font-mono rounded pointer-events-none"
            style={{
              top: hoverY - 10,
            }}
          >
            ${hoverPrice?.toFixed(2)}
          </div>

          {/* Alert button */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 flex gap-1"
            style={{
              top: hoverY - 14,
            }}
          >
            <button
              onClick={() => createAlert(isAboveCurrentPrice ? 'above' : 'below')}
              disabled={creating}
              className="px-2 py-1 bg-[#1E222D] hover:bg-blue-600 text-white text-xs font-medium rounded border border-blue-500 transition-colors flex items-center gap-1"
            >
              {creating ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  🔔
                  <span>
                    {isAboveCurrentPrice ? 'Alert Above' : 'Alert Below'}
                  </span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Current price line (for reference) */}
      {priceRange.max > currentPrice && priceRange.min < currentPrice && (
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: priceToY(currentPrice),
            borderTop: '1px solid rgba(34, 197, 94, 0.4)',
          }}
        />
      )}
    </div>
  );
}
