import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export interface BubbleData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  currency?: string;
}

interface BubbleChartProps {
  data: BubbleData[];
  title: string;
  icon: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
}

export default function BubbleChart({ data, title, icon, description, loading, error }: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: BubbleData } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: 350 });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0 || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(data, (d) => d.price) as [number, number];
    const yExtent = d3.extent(data, (d) => d.changePercent) as [number, number];
    const volumeExtent = d3.extent(data, (d) => d.volume) as [number, number];

    // Add padding to extents
    const xPadding = (xExtent[1] - xExtent[0]) * 0.15 || xExtent[0] * 0.15;
    const yPadding = Math.max(Math.abs(yExtent[1] - yExtent[0]) * 0.2, 1);

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0]);

    const radiusScale = d3
      .scaleSqrt()
      .domain(volumeExtent)
      .range([12, Math.min(35, 300 / Math.sqrt(data.length))]); // Dynamic sizing based on data count

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(55, 65, 81, 0.3)");

    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(55, 65, 81, 0.3)");

    // Zero line for y-axis
    if (yExtent[0] < 0 && yExtent[1] > 0) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "rgba(156, 163, 175, 0.5)")
        .attr("stroke-dasharray", "4,4");
    }

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((d) => formatPrice(d as number)))
      .selectAll("text")
      .attr("fill", "#9CA3AF")
      .attr("font-size", "11px");

    g.selectAll(".domain").attr("stroke", "#374151");
    g.selectAll(".tick line").attr("stroke", "#374151");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll("text")
      .attr("fill", "#9CA3AF")
      .attr("font-size", "11px");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#6B7280")
      .attr("font-size", "12px")
      .text("Price");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("fill", "#6B7280")
      .attr("font-size", "12px")
      .text("Change %");

    // Bubbles
    const bubbles = g
      .selectAll(".bubble")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .attr("transform", (d) => `translate(${xScale(d.price)},${yScale(d.changePercent)})`);

    bubbles
      .append("circle")
      .attr("r", (d) => radiusScale(d.volume))
      .attr("fill", (d) => (d.changePercent >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"))
      .attr("stroke", (d) => (d.changePercent >= 0 ? "#22C55E" : "#EF4444"))
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d.changePercent >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)");
        
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            data: d,
          });
        }
      })
      .on("mouseleave", function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d.changePercent >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)");
        setTooltip(null);
      });

    // Labels - only show for larger bubbles or fewer data points
    const showLabels = data.length <= 10;
    if (showLabels) {
      bubbles
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#FFFFFF")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("pointer-events", "none")
        .text((d) => d.symbol.replace(".NS", "").replace("-USD", "").replace("=F", "").slice(0, 6));
    }
  }, [data, dimensions, loading]);

  const formatPrice = (price: number): string => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  return (
    <div className="bg-[#1E222D] rounded-lg p-4 relative">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-500">{data.length} assets</span>
      </div>
      {description && (
        <p className="text-xs text-gray-400 mb-3 ml-8">{description}</p>
      )}

      <div ref={containerRef} className="relative" style={{ height: 350 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1E222D]/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1E222D]/80 z-10">
            <div className="text-red-400 text-center">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-sm">No data available</p>
          </div>
        )}

        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 bg-[#131722] border border-gray-700 rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y - 10,
              transform: tooltip.x > dimensions.width - 150 ? "translateX(-100%)" : undefined,
            }}
          >
            <div className="text-white font-semibold text-sm">{tooltip.data.name}</div>
            <div className="text-gray-400 text-xs mt-1">
              Price: <span className="text-white">${formatPrice(tooltip.data.price)}</span>
            </div>
            <div className="text-gray-400 text-xs">
              Change:{" "}
              <span className={tooltip.data.changePercent >= 0 ? "text-green-400" : "text-red-400"}>
                {tooltip.data.changePercent >= 0 ? "+" : ""}
                {tooltip.data.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="text-gray-400 text-xs">
              Volume: <span className="text-white">{formatVolume(tooltip.data.volume)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500/60 border border-green-500"></div>
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500/60 border border-red-500"></div>
          <span>Negative</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Bubble size = Volume</span>
        </div>
      </div>
    </div>
  );
}
