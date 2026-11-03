import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Zap,
  Home,
  Car,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TipItem {
  id: string;
  category: 'energy' | 'home' | 'mobility' | 'lifestyle';
  title: string;
  impactKgCo2: number;
  savingsDollars: number;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  payback: string;
  description: string;
}

const TIPS_DATA: TipItem[] = [
  {
    id: 'tip-1',
    category: 'energy',
    title: 'Install Heat Pump Water Heater (Hybrid HPWH)',
    impactKgCo2: 1800,
    savingsDollars: 350,
    difficulty: 'Moderate',
    payback: '2–3 years (with tax credits)',
    description:
      'Standard electric resistance water heaters draw 4,000+ kWh/year. Modern air-source hybrid heat pump water heaters use 70% less electricity by moving heat from ambient air.',
  },
  {
    id: 'tip-2',
    category: 'home',
    title: 'Comprehensive Attic Air Sealing & R-49 Insulation',
    impactKgCo2: 1200,
    savingsDollars: 280,
    difficulty: 'Moderate',
    payback: '1–2 years',
    description:
      'Preventing convective chimney effects through unsealed top plates, wire penetrations, and recessed lighting retains thermal conditioned air far more efficiently than heating upgrades alone.',
  },
  {
    id: 'tip-3',
    category: 'energy',
    title: 'Smart Thermostat Dynamic Setback Schedules',
    impactKgCo2: 450,
    savingsDollars: 120,
    difficulty: 'Easy',
    payback: 'Immediate (6 months)',
    description:
      'Lowering room temperature by 1.5°C to 2.0°C during nighttime sleep hours and work away intervals reduces annual boiler and heat pump runtime by 8–12%.',
  },
  {
    id: 'tip-4',
    category: 'mobility',
    title: 'Micro-Mobility Substitution for Trips Under 5 km',
    impactKgCo2: 650,
    savingsDollars: 420,
    difficulty: 'Easy',
    payback: 'Immediate',
    description:
      'Over 50% of urban car trips are under 5 kilometers — exactly where internal combustion engines operate at lowest thermal efficiency before catalytic converters heat up.',
  },
  {
    id: 'tip-5',
    category: 'lifestyle',
    title: 'Cold-Water Laundry Wash Cycles',
    impactKgCo2: 240,
    savingsDollars: 65,
    difficulty: 'Easy',
    payback: 'Zero Cost (Immediate)',
    description:
      'Up to 85% of washing machine energy is consumed heating tap water. Modern bio-detergents clean equally effectively in cold 20°C water while preserving clothing fibers.',
  },
  {
    id: 'tip-6',
    category: 'lifestyle',
    title: 'Two Plant-Rich Days per Week',
    impactKgCo2: 520,
    savingsDollars: 200,
    difficulty: 'Easy',
    payback: 'Immediate',
    description:
      'Replacing ruminant meat (beef, lamb) with legumes, lentils, and grains just two days per week eliminates substantial enteric methane and fertilizer runoff emissions.',
  },
];

export const SustainabilityTips: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTips =
    activeCategory === 'all'
      ? TIPS_DATA
      : TIPS_DATA.filter((t) => t.category === activeCategory);

  return (
    <section id="tips" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>ACTIONABLE HIGH-ROI DECARBONIZATION GUIDES</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Sustainability Action Playbook
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Empirical building science interventions categorized by upfront effort,
              financial payback, and verified greenhouse gas reduction.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex rounded-lg bg-slate-950/70 p-1 border border-emerald-900/40 text-xs shrink-0">
            {[
              { id: 'all', label: 'All Playbook' },
              { id: 'energy', label: 'Energy' },
              { id: 'home', label: 'Building Envelope' },
              { id: 'mobility', label: 'Mobility' },
              { id: 'lifestyle', label: 'Food & Habits' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeCategory === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300/80 hover:text-emerald-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between hover:border-emerald-600/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  {tip.category}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    tip.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {tip.difficulty}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                {tip.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {tip.description}
              </p>
            </div>

            <div className="pt-3 border-t border-emerald-950/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">
                  CO₂ Saved:
                </span>
                <span className="font-mono font-semibold text-emerald-300">
                  {tip.impactKgCo2} kg/yr
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">
                  Annual Savings:
                </span>
                <span className="font-mono font-semibold text-white">
                  ${tip.savingsDollars}/yr
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
