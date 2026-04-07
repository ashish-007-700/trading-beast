import AssetBubbleSection from '../components/AssetBubbleSection';

export default function Dashboard() {
  return (
    <div className="p-6 min-h-screen bg-[#131722]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          Market Dashboard
        </h1>
        <p className="text-gray-400 mb-6">
          Real-time market overview across asset classes
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetBubbleSection assetClass="indian" />
          <AssetBubbleSection assetClass="us" />
          <AssetBubbleSection assetClass="commodities" />
          <AssetBubbleSection assetClass="crypto" />
        </div>

        {/* Legend explanation */}
        <div className="mt-8 bg-[#1E222D] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">How to Read the Charts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <span className="text-blue-400 font-medium">X-Axis (Price):</span> Current market price of the asset
            </div>
            <div>
              <span className="text-blue-400 font-medium">Y-Axis (Change %):</span> Daily percentage change
            </div>
            <div>
              <span className="text-blue-400 font-medium">Bubble Size:</span> Trading volume (larger = more volume)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
