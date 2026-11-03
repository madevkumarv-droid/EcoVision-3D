/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { EarthCanvas } from './components/EarthCanvas';
import { DashboardSection } from './components/DashboardSection';
import { CarbonCalculator } from './components/CarbonCalculator';
import { EnergySimulator } from './components/EnergySimulator';
import { AIAdvisor } from './components/AIAdvisor';
import { RenewablesExplorer } from './components/RenewablesExplorer';
import { SustainabilityTips } from './components/SustainabilityTips';
import { Footer } from './components/Footer';
import { FootprintInputs, FootprintResults, RenewableProject } from './types';
import {
  Globe2,
  Sparkles,
  Zap,
  TrendingDown,
  ArrowRight,
  Compass,
  Layers,
  Leaf,
  ChevronDown,
} from 'lucide-react';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<RenewableProject | null>(null);
  const [footprintInputs, setFootprintInputs] = useState<FootprintInputs | null>(null);
  const [footprintResults, setFootprintResults] = useState<FootprintResults | null>(null);

  const handleFocusProjectOnGlobe = (project: RenewableProject) => {
    setSelectedProject(project);
  };

  const handleSendToAdvisor = (inputs: FootprintInputs, results: FootprintResults) => {
    setFootprintInputs(inputs);
    setFootprintResults(results);
  };

  return (
    <div className="min-h-screen bg-[#040d09] text-[#e2f1e8] selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-16 border-b border-emerald-950/60">
        {/* Subtle radial ambient glow behind hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Minimal Header Spec Kicker (No pills, clean unboxed text) */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 mb-4 tracking-wider">
              <span>PLANETARY DECARBONIZATION</span>
              <span className="text-emerald-700">·</span>
              <span>INTERACTIVE 3D WEBGL</span>
              <span className="text-emerald-700">·</span>
              <span>GEMINI 3.8 FLASH</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.12]">
              Interactive Sustainability <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Explorer & 3D Earth
              </span>
            </h1>

            {/* Subtitle measure 65-75ch */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Explore global clean energy infrastructures on an interactive 3D globe,
              analyze real-world climate anomalies, simulate micro-grid solar storage, and
              engineer personalized household decarbonization plans with AI.
            </p>

            {/* Hero CTAs */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#earth-explorer"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <Globe2 className="w-4 h-4" />
                <span>Launch 3D Earth Explorer</span>
              </a>

              <a
                href="#calculator"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-700/40 text-emerald-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>Calculate Household Carbon</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#simulator"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/60 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Micro-Grid Simulator</span>
              </a>
            </div>

            {/* Key Fact Strip */}
            <div className="mt-10 pt-6 border-t border-emerald-950/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-950/40">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">
                  Global Clean Power
                </div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  31.8%
                </div>
                <div className="text-[11px] text-slate-400">
                  IEA 2026 World Generation
                </div>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-950/40">
                <div className="text-[10px] font-mono text-amber-400 uppercase">
                  Atmospheric CO₂
                </div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  426.8 ppm
                </div>
                <div className="text-[11px] text-slate-400">
                  NOAA Mauna Loa Baseline
                </div>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-950/40">
                <div className="text-[10px] font-mono text-cyan-400 uppercase">
                  Mapped Mega-Projects
                </div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  37.5+ GW
                </div>
                <div className="text-[11px] text-slate-400">
                  Interactive 3D Coordinates
                </div>
              </div>

              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-950/40">
                <div className="text-[10px] font-mono text-teal-400 uppercase">
                  Paris 2030 Target
                </div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  2.0 t / person
                </div>
                <div className="text-[11px] text-slate-400">
                  UNFCCC Carbon Budget
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8">
        {/* Core Feature 1: 3D Earth Explorer */}
        <section id="earth-explorer" className="scroll-mt-20">
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>INTERACTIVE THREE.JS 3D PLANETARY CANVAS</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
                3D Earth Renewable Energy Explorer
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Drag to rotate the globe, scroll to zoom, toggle day/night/heatmap layers,
                and click markers to inspect gigawatt clean energy facilities.
              </p>
            </div>
          </div>

          <EarthCanvas
            selectedProjectId={selectedProject?.id}
            onSelectProject={(p) => setSelectedProject(p)}
          />
        </section>

        {/* Core Feature 2: Environmental Dashboard */}
        <DashboardSection />

        {/* Core Feature 3: Carbon Footprint Calculator */}
        <CarbonCalculator onSendToAdvisor={handleSendToAdvisor} />

        {/* Core Feature 4: Interactive Energy Simulator */}
        <EnergySimulator />

        {/* Core Feature 5: AI Sustainability Advisor */}
        <AIAdvisor
          initialFootprintInputs={footprintInputs}
          initialFootprintResults={footprintResults}
        />

        {/* Core Feature 6: Renewable Energy Explorer Catalog */}
        <RenewablesExplorer onFocusProjectOnGlobe={handleFocusProjectOnGlobe} />

        {/* Core Feature 7: Sustainability Action Playbook */}
        <SustainabilityTips />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
