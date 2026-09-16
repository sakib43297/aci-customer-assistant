import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BusinessProfile } from '../types';
import { MapPin, BarChart3, TrendingUp, Phone, MapPin as MapPinIcon } from 'lucide-react';

interface ActivityMapChartProps {
  profiles: BusinessProfile[];
}

const extractRegion = (loc: string): string => {
  if (!loc) return 'Other';
  const l = loc.toLowerCase();
  if (l.includes('dhaka')) return 'Dhaka';
  if (l.includes('rajshahi')) return 'Rajshahi';
  if (l.includes('chittagong')) return 'Chittagong';
  if (l.includes('sylhet')) return 'Sylhet';
  return loc.split(' ')[0] || 'Other';
};

export const ActivityMapChart: React.FC<ActivityMapChartProps> = ({ profiles }) => {
  const [metric, setMetric] = useState<'volume' | 'frequency'>('volume');
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Process geographical distribution data across all profiles
  const chartData = useMemo(() => {
    const dataMap: Record<string, { region: string; orderCount: number; totalVolume: number }> = {
      'Dhaka': { region: 'Dhaka', orderCount: 0, totalVolume: 0 },
      'Rajshahi': { region: 'Rajshahi', orderCount: 0, totalVolume: 0 },
      'Chittagong': { region: 'Chittagong', orderCount: 0, totalVolume: 0 },
      'Sylhet': { region: 'Sylhet', orderCount: 0, totalVolume: 0 },
    };

    profiles.forEach(p => {
      const reg = extractRegion(p.location);
      if (!dataMap[reg]) {
        dataMap[reg] = { region: reg, orderCount: 0, totalVolume: 0 };
      }
      const history = p.purchaseHistory || [];
      history.forEach(ord => {
        dataMap[reg].orderCount += 1;
        dataMap[reg].totalVolume += ord.totalPrice;
      });
    });

    return Object.values(dataMap);
  }, [profiles]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.orderCount, 0);
  }, [chartData]);

  const totalSpend = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.totalVolume, 0);
  }, [chartData]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous drawing
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Sizing suitable for a narrow sidebar
    const width = 216;
    const height = 180;
    const margin = { top: 10, right: 35, bottom: 25, left: 65 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const mainGroup = svgElement
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Extract values based on selected metric
    const xValue = (d: { region: string; orderCount: number; totalVolume: number }): number => 
      metric === 'volume' ? d.totalVolume : d.orderCount;

    // Scales
    const yScale = d3.scaleBand()
      .domain(chartData.map(d => d.region))
      .range([0, chartHeight])
      .padding(0.3);

    const vals = chartData.map(d => metric === 'volume' ? d.totalVolume : d.orderCount);
    const maxVal = Number(d3.max(vals) || 1);
    const xScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([0, chartWidth]);

    // X axis (minimal Grid lines)
    const xAxis = d3.axisBottom(xScale)
      .ticks(3)
      .tickSize(-chartHeight)
      .tickFormat(d => {
        const val = Number(d);
        if (metric === 'volume') {
          return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`;
        }
        return `${val}`;
      });

    const xAxisGroup = mainGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    // Style axis gridlines
    xAxisGroup.selectAll('.tick line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '2,2');
    xAxisGroup.select('.domain').attr('stroke', '#E2E8F0');
    xAxisGroup.selectAll('.tick text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, ui-monospace');

    // Y Axis (Regions)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    const yAxisGroup = mainGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#475569')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'Inter, sans-serif')
      .attr('dx', '-5px');

    // Create dynamic tooltip container
    const tooltipId = 'd3-map-tooltip';
    let tooltip = d3.select(`#${tooltipId}`);
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('id', tooltipId)
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', '#0F172A')
        .style('color', '#FFF')
        .style('padding', '8px 12px')
        .style('border-radius', '8px')
        .style('font-size', '11px')
        .style('font-family', 'Inter, sans-serif')
        .style('z-index', '9999')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
    }

    // Draw Bars with a color theme matching the selected metric
    const bars = mainGroup.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale((d as any).region) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', () => {
        return metric === 'volume' ? '#EF4444' : '#10B981';
      })
      .attr('opacity', 0.85);

    // D3 transition for horizontal bar growth
    bars.transition()
      .duration(800)
      .attr('width', d => xScale(xValue(d as any)));

    // Interactive tooltip and hover effect
    bars.on('mouseover', function (event, d: any) {
        d3.select(this)
          .attr('opacity', 1.0)
          .attr('stroke', '#0F172A')
          .attr('stroke-width', '1');
        
        const content = `
          <div style="font-weight: 800; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 4px;">${d.region} Region</div>
          <div>Purchase Vol: <span style="font-family: monospace; font-weight: bold; color: #FCA5A5;">৳${d.totalVolume.toLocaleString()}</span></div>
          <div>Order Freq: <span style="font-family: monospace; font-weight: bold; color: #34D399;">${d.orderCount} orders</span></div>
        `;
        
        tooltip.html(content)
          .style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', (event.pageY - 60) + 'px')
          .style('left', (event.pageX + 12) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke', 'none');
        tooltip.style('visibility', 'hidden');
      });

    // Add labels next to bars
    const labels = mainGroup.selectAll('.bar-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', d => (yScale((d as any).region) || 0) + yScale.bandwidth() / 2 + 3)
      .attr('fill', '#334155')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, ui-monospace')
      .attr('opacity', 0);

    labels.transition()
      .delay(400)
      .duration(400)
      .attr('opacity', 1)
      .attr('x', d => xScale(xValue(d as any)) + 4)
      .text(d => {
        const val = xValue(d as any);
        if (val === 0) return '0';
        if (metric === 'volume') {
          return val >= 1000 ? `৳${(val / 1000).toFixed(0)}k` : `৳${val}`;
        }
        return `${val}`;
      });

    return () => {
      d3.select(`#${tooltipId}`).remove();
    };
  }, [chartData, metric]);

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col space-y-3 relative overflow-hidden">
      {/* Metric Selector Controls */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-red-500" />
          D3 Activity Map
        </span>
        
        <div className="flex bg-slate-200/70 p-0.5 rounded-md gap-0.5">
          <button
            type="button"
            onClick={() => setMetric('volume')}
            title="Purchase Volume in Taka (৳)"
            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-all ${
              metric === 'volume'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Volume (৳)
          </button>
          <button
            type="button"
            onClick={() => setMetric('frequency')}
            title="Order Frequency Count"
            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-all ${
              metric === 'frequency'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Count (#)
          </button>
        </div>
      </div>

      {totalOrders === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center px-2 bg-white rounded-lg border border-slate-100">
          <MapPin className="w-8 h-8 text-slate-300 stroke-[1.5] animate-pulse mb-2" />
          <p className="text-[10px] font-bold text-slate-500 leading-normal">
            No Orders Placed Yet
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5 max-w-[160px]">
            Check out products & place an order to see the geographical distribution chart!
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-2.5">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-1.5 bg-white border border-slate-100 p-2 rounded-lg shadow-2xs">
            <div className="text-center">
              <span className="text-[8px] font-semibold text-slate-400 block uppercase tracking-wider">Total Volume</span>
              <span className="text-xs font-mono font-extrabold text-red-600">৳{totalSpend.toLocaleString()}</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-[8px] font-semibold text-slate-400 block uppercase tracking-wider">Total Orders</span>
              <span className="text-xs font-mono font-extrabold text-emerald-600">{totalOrders}</span>
            </div>
          </div>

          {/* D3 SVG chart wrapper */}
          <div className="relative flex justify-center pt-1 overflow-visible">
            <svg ref={svgRef} className="overflow-visible select-none"></svg>
          </div>
          
          <div className="text-[8px] text-slate-400 leading-normal flex items-start gap-1 justify-center mt-1">
            <TrendingUp className="w-2.5 h-2.5 text-red-400 shrink-0 mt-0.5" />
            <span>Hover on bars for detailed volumetric stats.</span>
          </div>
        </div>
      )}
    </div>
  );
};
