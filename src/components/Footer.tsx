import React from 'react';
import { Globe, ArrowUp, Code2, Database, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-emerald-950/80 bg-[#020705] text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>EcoVision 3D — Interactive Sustainability Explorer</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              A full-stack environmental simulation and climate intelligence
              platform fusing Three.js 3D WebGL planetary rendering, real-time IPCC
              carbon calculations, diurnal micro-grid solar simulation, and
              server-side Gemini 3.8 Flash energy auditing.
            </p>
            <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-emerald-400">
              <span>NASA GISS</span>
              <span className="text-emerald-800">/</span>
              <span>NOAA MAUNA LOA</span>
              <span className="text-emerald-800">/</span>
              <span>IPCC AR6 WG-III</span>
              <span className="text-emerald-800">/</span>
              <span>IEA 2026</span>
            </div>
          </div>

          {/* BCA Syllabus Integration Col */}
          <div>
            <div className="text-white font-semibold mb-3 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>BCA Curriculum Integration</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <strong className="text-emerald-300">Unit I:</strong> Semantic
                HTML5, CSS Grid, Flexbox, Tailwind CSS
              </li>
              <li>
                <strong className="text-emerald-300">Unit II:</strong> JS DOM
                events, form validation, Fetch API, JSON processing
              </li>
              <li>
                <strong className="text-emerald-300">Unit III:</strong> React
                hooks, components, Three.js 3D WebGL rendering
              </li>
            </ul>
          </div>

          {/* Quick Links & Return to top */}
          <div>
            <div className="text-white font-semibold mb-3">Platform Navigation</div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <a href="#earth-explorer" className="hover:text-emerald-300 transition-colors">
                  3D Planetary Globe
                </a>
              </li>
              <li>
                <a href="#dashboard" className="hover:text-emerald-300 transition-colors">
                  Climate Pulse Dashboard
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-emerald-300 transition-colors">
                  Carbon Footprint Calculator
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-emerald-300 transition-colors">
                  Micro-Grid Solar Simulator
                </a>
              </li>
              <li>
                <a href="#ai-advisor" className="hover:text-emerald-300 transition-colors">
                  Gemini Decarbonization Advisor
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            EcoVision 3D © {new Date().getFullYear()} · Open Climate Engineering Platform · All calculations calibrated to standard IPCC/EPA emission factors.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
