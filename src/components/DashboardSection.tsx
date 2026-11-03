import React, { useState, useEffect } from 'react';
import {
  HISTORICAL_TEMPERATURE_SERIES,
  GLOBAL_SECTOR_EMISSIONS,
  RENEWABLE_GENERATION_SERIES,
} from '../data/environmentalData';
import { EnvironmentalIndicator } from '../types';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Globe2,
  Zap,
  Leaf,
  BarChart3,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';

export const DashboardSection: React.FC = () => {
  // Live Indicators State with BCA Unit II Fetch & Error handling
  const [indicators, setIndicators] = useState<EnvironmentalIndicator[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState<boolean>(true);
  const [indicatorError, setIndicatorError] = useState<string | null>(null);

  // Chart Interactive States
  const [tempRange, setTempRange] = useState<'all' | 'modern' | 'recent'>('all');
  const [hoveredTempPoint, setHoveredTempPoint] = useState<{
    year: number;
    anomaly: number;
    co2Ppm: number;
    x: number;
    y: number;
  } | null>(null);

  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [sectorMetric, setSectorMetric] = useState<'percent' | 'gigatons'>('percent');

  // Renewable Chart Active Technologies
  const [activeTechs, setActiveTechs] = useState<{
    solar: boolean;
    wind: boolean;
    hydro: boolean;
    other: boolean;
  }>({
    solar: true,
    wind: true,
    hydro: true,
    other: true,
  });

  // Fetch Environmental Indicators from server route (with graceful fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadIndicators() {
      try {
        setLoadingIndicators(true);
        const res = await fetch('/api/environmental-indicators');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (isMounted && data.indicators) {
          setIndicators(data.indicators);
          setIndicatorError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setIndicatorError('Using verified offline climate monitoring dataset.');
          // Default fallback indicator snapshot
          setIndicators([
            {
              id: 'co2',
              name: 'Atmospheric Carbon Dioxide',
              currentValue: 426.8,
              unit: 'ppm',
              preIndustrial: 280.0,
              yoyChange: '+2.4 ppm/yr',
              source: 'NOAA Mauna Loa Global Monitoring Laboratory',
              status: 'critical',
            },
            {
              id: 'temp',
              name: 'Global Surface Temperature Anomaly',
              currentValue: 1.28,
              unit: '°C above pre-industrial',
              preIndustrial: 0.0,
              yoyChange: '+0.11°C / decade',
              source: 'NASA GISS Surface Temperature Analysis',
              status: 'alert',
            },
            {
              id: 'ice',
              name: 'Arctic Sea Ice Minimum Extent',
              currentValue: 4.28,
              unit: 'million km²',
              historicalAverage: 6.85,
              yoyChange: '-12.2% / decade',
              source: 'National Snow and Ice Data Center (NSIDC)',
              status: 'declining',
            },
            {
              id: 'renewables',
              name: 'Global Clean Power Share',
              currentValue: 31.8,
              unit: '% of total electricity generation',
              historicalAverage: 20.4,
              yoyChange: '+3.1% YoY increase',
              source: 'International Energy Agency (IEA 2025/2026)',
              status: 'improving',
            },
          ]);
        }
      } finally {
        if (isMounted) setLoadingIndicators(false);
      }
    }

    loadIndicators();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Temperature data by selected range
  const filteredTempData = React.useMemo(() => {
    if (tempRange === 'modern') {
      return HISTORICAL_TEMPERATURE_SERIES.filter((d) => d.year >= 1970);
    }
    if (tempRange === 'recent') {
      return HISTORICAL_TEMPERATURE_SERIES.filter((d) => d.year >= 2000);
    }
    return HISTORICAL_TEMPERATURE_SERIES;
  }, [tempRange]);

  // Compute SVG coordinates for Temperature Chart
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const minYear = filteredTempData[0].year;
  const maxYear = filteredTempData[filteredTempData.length - 1].year;
  const minAnomaly = -0.4;
  const maxAnomaly = 1.6;

  const getX = (year: number) =>
    padding.left + ((year - minYear) / (maxYear - minYear)) * graphWidth;
  const getY = (val: number) =>
    padding.top +
    graphHeight -
    ((val - minAnomaly) / (maxAnomaly - minAnomaly)) * graphHeight;

  // Zero-line and Paris 1.5C line Y-coords
  const zeroY = getY(0);
  const parisY = getY(1.5);

  // Build SVG Path
  const linePoints = filteredTempData
    .map((d) => `${getX(d.year)},${getY(d.anomaly)}`)
    .join(' ');
  const areaPoints = `${linePoints} ${getX(maxYear)},${zeroY} ${getX(minYear)},${zeroY}`;

  return (
    <section id="dashboard" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>GLOBAL ENVIRONMENTAL METRICS & CLIMATE ANALYTICS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Planetary Indicators & Decarbonization Pulse
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Rigorous, empirical tracking of atmospheric greenhouse concentrations,
              temperature anomalies, and renewable generation trends.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-emerald-950/40 border border-emerald-900/40 px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Data Sources: NASA GISS · NOAA · IEA · IPCC AR6</span>
          </div>
        </div>
      </div>

      {/* Live Indicator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loadingIndicators ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-900/40 rounded-xl border border-emerald-950 animate-pulse"
            />
          ))
        ) : (
          indicators.map((ind) => (
            <div
              key={ind.id}
              className="bg-slate-950/60 border border-emerald-900/30 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group hover:border-emerald-600/40 transition-colors"
            >
              <div className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider mb-1">
                {ind.name}
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {ind.currentValue}
                </span>
                <span className="text-xs text-slate-400">{ind.unit}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-emerald-950/60">
                <span className="text-emerald-400 font-medium">
                  {ind.yoyChange}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={ind.source}>
                  {ind.source.split('(')[0]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Charts Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Temperature Anomaly Interactive Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Global Temperature Anomaly (1880–2026)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Observed deviation relative to 1951–1980 baseline (°C)
              </p>
            </div>

            {/* Time Filter Segmented Control */}
            <div className="flex rounded-lg bg-emerald-950/50 p-1 border border-emerald-900/40 text-xs">
              {[
                { id: 'all', label: '1880–2026' },
                { id: 'modern', label: 'From 1970' },
                { id: 'recent', label: 'From 2000' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTempRange(btn.id as any)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    tempRange === btn.id
                      ? 'bg-emerald-600 text-white font-medium shadow-sm'
                      : 'text-emerald-300/70 hover:text-emerald-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Responsive Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ minWidth: '480px' }}
            >
              {/* Grid Lines */}
              {[-0.2, 0.0, 0.5, 1.0, 1.5].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke={val === 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.08)'}
                      strokeDasharray={val === 0 ? undefined : '3 3'}
                      strokeWidth={val === 0 ? 1.5 : 1}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      className="font-mono"
                    >
                      {val > 0 ? `+${val.toFixed(1)}°` : `${val.toFixed(1)}°`}
                    </text>
                  </g>
                );
              })}

              {/* Paris Agreement 1.5°C Target Reference Line */}
              <line
                x1={padding.left}
                y1={parisY}
                x2={svgWidth - padding.right}
                y2={parisY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padding.right}
                y={parisY - 6}
                fill="#f87171"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                Paris 1.5°C Threshold
              </text>

              {/* Shaded Area */}
              <polygon
                points={areaPoints}
                fill="url(#tempGradient)"
                opacity="0.35"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePoints}
              />

              {/* Interactive Points */}
              {filteredTempData.map((d) => {
                const cx = getX(d.year);
                const cy = getY(d.anomaly);
                const isHovered = hoveredTempPoint?.year === d.year;
                return (
                  <g key={d.year}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 3.5}
                      fill={d.anomaly >= 1.0 ? '#ef4444' : d.anomaly >= 0.5 ? '#f59e0b' : '#10b981'}
                      stroke="#040d09"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() =>
                        setHoveredTempPoint({
                          year: d.year,
                          anomaly: d.anomaly,
                          co2Ppm: d.co2Ppm,
                          x: cx,
                          y: cy,
                        })
                      }
                      onMouseLeave={() => setHoveredTempPoint(null)}
                    />
                  </g>
                );
              })}

              {/* Year X Axis */}
              {filteredTempData
                .filter((_, idx, arr) => idx % Math.ceil(arr.length / 7) === 0 || idx === arr.length - 1)
                .map((d) => (
                  <text
                    key={d.year}
                    x={getX(d.year)}
                    y={svgHeight - padding.bottom + 18}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {d.year}
                  </text>
                ))}

              {/* Gradient Defs */}
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredTempPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-16 bg-slate-950/95 border border-emerald-500/50 rounded-lg p-2.5 shadow-2xl text-xs backdrop-blur-md"
                style={{
                  left: `${(hoveredTempPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredTempPoint.y / svgHeight) * 100}%`,
                }}
              >
                <div className="font-bold text-white font-mono">
                  Year {hoveredTempPoint.year}
                </div>
                <div className="text-amber-400 font-mono">
                  Anomaly: +{hoveredTempPoint.anomaly.toFixed(2)}°C
                </div>
                <div className="text-emerald-400 font-mono text-[11px]">
                  Atmospheric CO₂: {hoveredTempPoint.co2Ppm} ppm
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-emerald-950/80">
            <span>Hover individual points for year & CO₂ values</span>
            <span className="font-mono text-emerald-400">
              Current Anomaly: +1.28°C (2026)
            </span>
          </div>
        </div>

        {/* Right Column: Global Emissions by Sector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Global Greenhouse Gas Emissions by Sector
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown of ~49.5 Gt CO₂e annual world emissions
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex rounded-lg bg-emerald-950/50 p-1 border border-emerald-900/40 text-xs shrink-0">
                <button
                  onClick={() => setSectorMetric('percent')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sectorMetric === 'percent'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-emerald-300/70'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setSectorMetric('gigatons')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sectorMetric === 'gigatons'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-emerald-300/70'
                  }`}
                >
                  Gt
                </button>
              </div>
            </div>

            {/* Horizontal Bar Breakdown */}
            <div className="space-y-3 mt-4">
              {GLOBAL_SECTOR_EMISSIONS.map((sec) => {
                const isSelected = activeSector === sec.sector;
                return (
                  <div
                    key={sec.sector}
                    onMouseEnter={() => setActiveSector(sec.sector)}
                    onMouseLeave={() => setActiveSector(null)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/50'
                        : 'bg-emerald-950/20 border-emerald-950/40 hover:bg-emerald-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-200">
                        {sec.sector}
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {sectorMetric === 'percent'
                          ? `${sec.percentage}%`
                          : `${sec.annualGtCo2e} Gt CO₂e`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(sec.percentage / 35) * 100}%`,
                          backgroundColor: sec.color,
                        }}
                      />
                    </div>

                    {/* Subsectors detail */}
                    <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                      {sec.subsectors}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between">
            <span>Primary Decarbonization Driver: Clean Electrification</span>
            <span className="font-mono text-emerald-400">Total: ~49.5 Gt/yr</span>
          </div>
        </div>
      </div>

      {/* Bottom Chart: Clean Energy Generation Surge (IEA Growth Trends) */}
      <div className="mt-6 bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Global Renewable Power Generation (2012–2026)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Annual electricity produced by source in Terawatt-hours (TWh)
            </p>
          </div>

          {/* Technology Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { key: 'solar', label: 'Solar PV', color: '#f59e0b' },
              { key: 'wind', label: 'Wind Power', color: '#06b6d4' },
              { key: 'hydro', label: 'Hydroelectric', color: '#3b82f6' },
              { key: 'other', label: 'Bio & Geo', color: '#10b981' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  setActiveTechs((prev) => ({
                    ...prev,
                    [t.key]: !prev[t.key as keyof typeof activeTechs],
                  }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                  activeTechs[t.key as keyof typeof activeTechs]
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-white'
                    : 'bg-black/30 border-slate-800 text-slate-500 line-through'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Bar Chart Visual */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
          {RENEWABLE_GENERATION_SERIES.map((item) => {
            const solarH = activeTechs.solar ? (item.solarTWh / 3500) * 120 : 0;
            const windH = activeTechs.wind ? (item.windTWh / 3500) * 120 : 0;
            const hydroH = activeTechs.hydro ? (item.hydroTWh / 5000) * 120 : 0;
            const otherH = activeTechs.other ? (item.otherRenewablesTWh / 3500) * 120 : 0;

            const total =
              (activeTechs.solar ? item.solarTWh : 0) +
              (activeTechs.wind ? item.windTWh : 0) +
              (activeTechs.hydro ? item.hydroTWh : 0) +
              (activeTechs.other ? item.otherRenewablesTWh : 0);

            return (
              <div
                key={item.year}
                className="bg-emerald-950/20 border border-emerald-950/40 rounded-lg p-3 flex flex-col justify-end items-center text-center group hover:border-emerald-600/40 transition-colors"
              >
                {/* Visual stacked / adjacent mini bars */}
                <div className="h-32 w-full flex items-end justify-center gap-1 mb-2">
                  {activeTechs.solar && (
                    <div
                      style={{ height: `${Math.max(4, solarH)}px` }}
                      className="w-2 rounded-t bg-amber-500 transition-all duration-300"
                      title={`Solar: ${item.solarTWh} TWh`}
                    />
                  )}
                  {activeTechs.wind && (
                    <div
                      style={{ height: `${Math.max(4, windH)}px` }}
                      className="w-2 rounded-t bg-cyan-500 transition-all duration-300"
                      title={`Wind: ${item.windTWh} TWh`}
                    />
                  )}
                  {activeTechs.hydro && (
                    <div
                      style={{ height: `${Math.max(4, hydroH)}px` }}
                      className="w-2 rounded-t bg-blue-500 transition-all duration-300"
                      title={`Hydro: ${item.hydroTWh} TWh`}
                    />
                  )}
                  {activeTechs.other && (
                    <div
                      style={{ height: `${Math.max(4, otherH)}px` }}
                      className="w-2 rounded-t bg-emerald-500 transition-all duration-300"
                      title={`Other: ${item.otherRenewablesTWh} TWh`}
                    />
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-white">
                  {item.year}
                </div>
                <div className="font-mono text-[11px] text-emerald-400">
                  {total.toLocaleString()} TWh
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
