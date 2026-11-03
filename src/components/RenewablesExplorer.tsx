import React, { useState, useMemo } from 'react';
import { RENEWABLE_PROJECTS } from '../data/projectsData';
import { RenewableProject, TechnologyType } from '../types';
import {
  Sun,
  Wind,
  Droplets,
  Flame,
  Battery,
  Atom,
  Search,
  Globe2,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface RenewablesExplorerProps {
  onFocusProjectOnGlobe: (project: RenewableProject) => void;
}

const TECH_META: Record<
  TechnologyType,
  { label: string; icon: any; color: string }
> = {
  solar: { label: 'Solar PV & CSP', icon: Sun, color: '#f59e0b' },
  wind: { label: 'Wind Power', icon: Wind, color: '#06b6d4' },
  hydro: { label: 'Hydroelectric', icon: Droplets, color: '#3b82f6' },
  geothermal: { label: 'Geothermal', icon: Flame, color: '#f97316' },
  storage: { label: 'Grid Battery', icon: Battery, color: '#10b981' },
  tidal: { label: 'Tidal Energy', icon: Droplets, color: '#14b8a6' },
  advanced: { label: 'Fusion & DAC', icon: Atom, color: '#a855f7' },
};

export const RenewablesExplorer: React.FC<RenewablesExplorerProps> = ({
  onFocusProjectOnGlobe,
}) => {
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'capacity' | 'co2' | 'year'>('capacity');

  const filteredProjects = useMemo(() => {
    return RENEWABLE_PROJECTS.filter((proj) => {
      const matchesTech =
        selectedTech === 'all' || proj.technology === selectedTech;
      const matchesQuery =
        searchQuery === '' ||
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.techLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTech && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'capacity') return b.capacityMw - a.capacityMw;
      if (sortBy === 'co2') return b.annualCo2OffsetTons - a.annualCo2OffsetTons;
      if (sortBy === 'year') return b.commissionYear - a.commissionYear;
      return 0;
    });
  }, [selectedTech, searchQuery, sortBy]);

  return (
    <section id="renewables" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>GLOBAL CLEAN ENERGY INFRASTRUCTURE CATALOG</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Renewable Energy Projects Explorer
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Investigate the engineering marvels decarbonizing continents — from the
              world’s largest desert solar parks and ultra-deep offshore wind to tidal barrages and fusion testbeds.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-emerald-950/40 border border-emerald-900/40 px-3 py-1.5 rounded-lg shrink-0">
            <span>Showing {filteredProjects.length} Verified Facilities</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-4 mb-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, country, or technology..."
              className="w-full bg-emerald-950/40 border border-emerald-800/40 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Technology Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Technologies' },
              { id: 'solar', label: 'Solar PV' },
              { id: 'wind', label: 'Wind Power' },
              { id: 'hydro', label: 'Hydro' },
              { id: 'geothermal', label: 'Geothermal' },
              { id: 'storage', label: 'Storage' },
              { id: 'advanced', label: 'Fusion & DAC' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTech(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedTech === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-950/30 text-emerald-300/80 hover:bg-emerald-900/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Sort projects"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-emerald-950/40 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="capacity">Sort by Peak Capacity (MW)</option>
              <option value="co2">Sort by CO₂ Offset (tons)</option>
              <option value="year">Sort by Commission Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => {
          const meta = TECH_META[proj.technology];
          const Icon = meta.icon;

          return (
            <div
              key={proj.id}
              className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between group hover:border-emerald-600/50 transition-all duration-200"
            >
              <div>
                {/* Header Kicker */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    <span style={{ color: meta.color }}>{proj.techLabel}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Est. {proj.commissionYear}
                  </span>
                </div>

                {/* Facility Name & Location */}
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-emerald-400/80 mt-0.5 mb-3">
                  {proj.region}, {proj.country}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {proj.description}
                </p>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-900/30 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Capacity
                    </span>
                    <span className="font-mono font-semibold text-white">
                      {proj.capacityMw.toLocaleString()} MW
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      CO₂ Avoided
                    </span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {(proj.annualCo2OffsetTons / 1000000).toFixed(2)}M t/yr
                    </span>
                  </div>
                </div>

                {/* Innovation highlight */}
                <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5 mb-4">
                  <span className="text-emerald-400 font-medium">Core Tech: </span>
                  {proj.keyInnovation}
                </div>
              </div>

              {/* Action Button: Target on 3D Earth */}
              <button
                onClick={() => {
                  onFocusProjectOnGlobe(proj);
                  const globeElem = document.getElementById('earth-explorer');
                  if (globeElem) {
                    globeElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/40 text-emerald-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Locate on 3D Earth Globe</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
