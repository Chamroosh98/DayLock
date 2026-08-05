import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { BarChart2, Clock, RefreshCw, Info } from 'lucide-react';
import { getPasteExpiryMetrics, ExpiryMetrics, getStoredPastes } from '../utils/pasteStorage';
import { PurgeExpiredButton } from './PurgeExpiredButton';
import { Language } from '../types';

export interface PasteExpiryChartProps {
  isDarkMode: boolean;
  language: Language;
  setStatus?: (status: { type: 'ok' | 'err' | 'warn'; msg: string } | null) => void;
  className?: string;
}

export const PasteExpiryChart: React.FC<PasteExpiryChartProps> = ({
  isDarkMode,
  language,
  setStatus,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState<ExpiryMetrics>({
    next24h: 0,
    next7d: 0,
    next30d: 0,
    totalActive: 0,
  });
  const [hoveredData, setHoveredData] = useState<{ label: string; count: number; desc: string } | null>(null);

  const refreshMetrics = () => {
    const data = getPasteExpiryMetrics();
    setMetrics(data);
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 10000); // refresh metrics every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartData = [
      {
        key: '24h',
        label: language === 'fa' ? '۲۴ ساعت آینده' : 'Next 24 Hours',
        count: metrics.next24h,
        desc: language === 'fa' ? 'پاست‌های منقضی‌شونده تا ۲۴ ساعت' : 'Pastes expiring within 24 hours',
        gradientStart: '#ef4444',
        gradientEnd: '#f97316',
      },
      {
        key: '7d',
        label: language === 'fa' ? '۷ روز آینده' : 'Next 7 Days',
        count: metrics.next7d,
        desc: language === 'fa' ? 'پاست‌های منقضی‌شونده تا ۷ روز' : 'Pastes expiring within 7 days',
        gradientStart: '#06b6d4',
        gradientEnd: '#3b82f6',
      },
      {
        key: '30d',
        label: language === 'fa' ? '۳۰ روز آینده' : 'Next 30 Days',
        count: metrics.next30d,
        desc: language === 'fa' ? 'پاست‌های منقضی‌شونده تا ۳۰ روز' : 'Pastes expiring within 30 days',
        gradientStart: '#8b5cf6',
        gradientEnd: '#ec4899',
      },
    ];

    const margin = { top: 30, right: 20, bottom: 40, left: 35 };
    const width = 360 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 360 200`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define linear gradients for bars
    const defs = svg.append('defs');
    chartData.forEach((d) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `bar-gradient-${d.key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.gradientStart);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.gradientEnd);
    });

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, width])
      .padding(0.35);

    const maxVal = Math.max(5, d3.max(chartData, (d) => d.count) || 0);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal])
      .nice()
      .range([height, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(4)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)')
      .attr('stroke-dasharray', '3,3');

    // Remove domain line from grid
    g.select('.grid-lines .domain').remove();

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    xAxis.select('.domain').attr('stroke', isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
    xAxis
      .selectAll('text')
      .attr('fill', isDarkMode ? '#a1a1aa' : '#52525b')
      .attr('font-size', '10px')
      .attr('font-weight', '600');

    // Y Axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(4));
    yAxis.select('.domain').attr('stroke', isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
    yAxis
      .selectAll('text')
      .attr('fill', isDarkMode ? '#a1a1aa' : '#52525b')
      .attr('font-size', '10px');

    // Render Bars with D3 Transitions
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (d) => `url(#bar-gradient-${d.key})`)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredData({ label: d.label, count: d.count, desc: d.desc });
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('opacity', 0.85)
          .attr('transform', 'scale(1.03)');
      })
      .on('mouseleave', (event) => {
        setHoveredData(null);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
      })
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.count))
      .attr('height', (d) => height - yScale(d.count));

    // Value Labels on top of bars
    g.selectAll('.bar-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#f4f4f5' : '#18181b')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text((d) => d.count)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => Math.max(12, yScale(d.count) - 6));
  }, [metrics, isDarkMode, language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-3xl border transition-all duration-300 ${
        isDarkMode
          ? 'bg-zinc-900/90 border-white/10 shadow-xl text-zinc-100'
          : 'bg-white border-zinc-200 shadow-lg text-zinc-900'
      } ${className}`}
      ref={containerRef}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              {language === 'fa' ? 'داشبورد زمان انقضای پاست‌ها' : 'Paste Expiration Metrics'}
            </h4>
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {language === 'fa'
                ? `کل پاست‌های فعال: ${metrics.totalActive}`
                : `Active Pastes: ${metrics.totalActive}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PurgeExpiredButton
            isDarkMode={isDarkMode}
            language={language}
            setStatus={setStatus}
            onPurgeComplete={() => refreshMetrics()}
          />
          <button
            type="button"
            onClick={refreshMetrics}
            title={language === 'fa' ? 'به‌روزرسانی آمار' : 'Refresh Metrics'}
            className={`p-2 rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-300'
                : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div className="w-full relative flex justify-center items-center my-1">
        <svg ref={svgRef} className="w-full max-w-[380px] h-[200px]" />
      </div>

      {/* Hover Info / Footer details */}
      <div
        className={`p-2.5 rounded-2xl text-[10px] border flex items-center gap-2 transition-all ${
          isDarkMode ? 'bg-zinc-950/60 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}
      >
        <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
        <span>
          {hoveredData ? (
            <>
              <strong>{hoveredData.label}:</strong> {hoveredData.count} {language === 'fa' ? 'پاست' : 'paste(s)'} ({hoveredData.desc})
            </>
          ) : language === 'fa' ? (
            'برای دیدن جزییات دقیق روی ستون‌ها ماوس را نگه دارید.'
          ) : (
            'Hover over bars to inspect detailed paste breakdown.'
          )}
        </span>
      </div>
    </motion.div>
  );
};
