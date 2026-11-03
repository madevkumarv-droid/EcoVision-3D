import React, { useState, useMemo } from 'react';
import { EMISSION_FACTORS } from '../data/environmentalData';
import { FootprintInputs, FootprintResults } from '../types';
import {
  Calculator,
  Zap,
  Car,
  Flame,
  Utensils,
  TreeDeciduous,
  Target,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CarbonCalculatorProps {
  onSendToAdvisor?: (inputs: FootprintInputs, results: FootprintResults) => void;
}

export const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({
  onSendToAdvisor,
}) => {
  // Default realistic baseline inputs
  const [inputs, setInputs] = useState<FootprintInputs>({
    electricityKwh: 400,
    cleanEnergyPercent: 20,
    electricitySource: 'national_average',
    vehicleMileage: 140, // km/week
    vehicleType: 'gasoline',
    transitHours: 2,
    shortFlights: 1,
    longFlights: 0,
    heatingSource: 'natural_gas',
    dietType: 'omnivore',
    wasteHabits: 'average',
  });

  // Dynamic Emission Calculation using standard IPCC / EPA conversion factors
  const results: FootprintResults = useMemo(() => {
    // 1. Electricity (Monthly kWh * 12 * factor * clean discount)
    const baseGridFactor =
      EMISSION_FACTORS.gridElectricity[inputs.electricitySource];
    const annualElectricityKwh = inputs.electricityKwh * 12;
    const cleanDiscount = 1 - (inputs.cleanEnergyPercent / 100) * 0.9;
    const electricityEmissions =
      (annualElectricityKwh * baseGridFactor * cleanDiscount) / 1000;

    // 2. Transport (Car km/yr * factor + transit + flights)
    const annualCarKm = inputs.vehicleMileage * 52;
    const carFactor = EMISSION_FACTORS.vehiclePerKm[inputs.vehicleType];
    const transitEmissions =
      (inputs.transitHours * 52 * EMISSION_FACTORS.transitPerHour) / 1000;
    const flightEmissions =
      (inputs.shortFlights * EMISSION_FACTORS.flightShortHaul +
        inputs.longFlights * EMISSION_FACTORS.flightLongHaul) /
      1000;
    const transportEmissions =
      (annualCarKm * carFactor) / 1000 + transitEmissions + flightEmissions;

    // 3. Heating (Monthly factor * 12)
    const heatingEmissions =
      (EMISSION_FACTORS.heatingMonthly[inputs.heatingSource] * 12) / 1000;

    // 4. Diet
    const dietEmissions = EMISSION_FACTORS.dietAnnualTons[inputs.dietType];

    // 5. Waste
    const wasteEmissions = EMISSION_FACTORS.wasteAnnualTons[inputs.wasteHabits];

    const totalEmissions =
      electricityEmissions +
      transportEmissions +
      heatingEmissions +
      dietEmissions +
      wasteEmissions;

    const globalAverage = 4.7; // t CO2e
    const globalComparisonPercent = (totalEmissions / globalAverage) * 100;
    const parisTargetGap = totalEmissions - 2.0;

    // 1 mature tree absorbs ~22 kg CO2 / year = ~45.5 trees per ton of CO2
    const treesNeededToOffset = Math.round(totalEmissions * 45.5);
    const kmDrivenEquivalent = Math.round((totalEmissions * 1000) / 0.192);

    return {
      electricityEmissions,
      transportEmissions,
      heatingEmissions,
      dietEmissions,
      wasteEmissions,
      totalEmissions,
      globalComparisonPercent,
      parisTargetGap,
      treesNeededToOffset,
      kmDrivenEquivalent,
    };
  }, [inputs]);

  // Reset to typical national average profile
  const handleReset = () => {
    setInputs({
      electricityKwh: 400,
      cleanEnergyPercent: 20,
      electricitySource: 'national_average',
      vehicleMileage: 140,
      vehicleType: 'gasoline',
      transitHours: 2,
      shortFlights: 1,
      longFlights: 0,
      heatingSource: 'natural_gas',
      dietType: 'omnivore',
      wasteHabits: 'average',
    });
  };

  return (
    <section id="calculator" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>IPCC-CALIBRATED CARBON FOOTPRINT ENGINE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Household Carbon Footprint Calculator
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Quantify your annualized greenhouse gas inventory across energy,
              mobility, heating, and diet with documented conversion factors.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-400 border border-emerald-800/60 rounded-lg hover:bg-emerald-950/60 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Household Electricity */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                1. Electricity Consumption & Grid Mix
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {inputs.electricityKwh} kWh / month
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1 mb-4">
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={inputs.electricityKwh}
                onChange={(e) =>
                  setInputs({ ...inputs, electricityKwh: Number(e.target.value) })
                }
                className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50 kWh (Studio)</span>
                <span>400 kWh (Avg Apt)</span>
                <span>900 kWh (US Single-Family)</span>
                <span>1500 kWh (Large Villa)</span>
              </div>
            </div>

            {/* Grid Source Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Grid Carbon Intensity:
                </label>
                <select
                  value={inputs.electricitySource}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      electricitySource: e.target.value as any,
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="fossil_heavy">Coal-Dominant (0.68 kg/kWh)</option>
                  <option value="national_average">
                    National Blended (0.39 kg/kWh)
                  </option>
                  <option value="clean_mix">Hydro/Nuclear Mix (0.18 kg/kWh)</option>
                  <option value="100_green">100% Certified Green (0.02 kg/kWh)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Onsite Clean Solar / Tariff Share: {inputs.cleanEnergyPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={inputs.cleanEnergyPercent}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      cleanEnergyPercent: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Transportation & Aviation */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                2. Transportation & Travel Mobility
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {inputs.vehicleMileage} km / week
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Primary Commute Vehicle:
                </label>
                <select
                  value={inputs.vehicleType}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      vehicleType: e.target.value as any,
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="gasoline">Gasoline / Petrol Car (192 g/km)</option>
                  <option value="diesel">Diesel Car (171 g/km)</option>
                  <option value="hybrid">Standard Hybrid (108 g/km)</option>
                  <option value="ev">Battery Electric EV (45 g/km)</option>
                  <option value="none">No Private Car (Bicycle / Walking)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Public Transit (Bus / Metro / Train): {inputs.transitHours} hrs/wk
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={inputs.transitHours}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      transitHours: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                />
              </div>
            </div>

            {/* Weekly Mileage Slider */}
            {inputs.vehicleType !== 'none' && (
              <div className="space-y-1 mb-4">
                <label className="text-[11px] text-slate-300 block">
                  Car Driving Distance: {inputs.vehicleMileage} km / week (~
                  {Math.round(inputs.vehicleMileage * 52)} km/year)
                </label>
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="20"
                  value={inputs.vehicleMileage}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      vehicleMileage: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            )}

            {/* Flights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-950/70 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Short Flights (&lt;3h) / yr:
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={inputs.shortFlights}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      shortFlights: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-white rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Long Flights (&gt;3h) / yr:
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={inputs.longFlights}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      longFlights: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-white rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Space Heating, Diet, & Waste */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <span className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              3. Thermal Energy, Nutrition & Waste
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Home Space & Water Heating:
                </label>
                <select
                  value={inputs.heatingSource}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      heatingSource: e.target.value as any,
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="natural_gas">Natural Gas Furnace (185 kg/mo)</option>
                  <option value="fuel_oil">Heating Oil / Diesel (275 kg/mo)</option>
                  <option value="heat_pump">Heat Pump (Inverter COP 3.5)</option>
                  <option value="electric_resistance">Baseboard Electric</option>
                  <option value="biomass">Modern Pellet / Biomass</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Dietary Pattern:
                </label>
                <select
                  value={inputs.dietType}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      dietType: e.target.value as any,
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="meat_heavy">Daily Red Meat (3.3 t/yr)</option>
                  <option value="omnivore">Average Omnivore (2.5 t/yr)</option>
                  <option value="pescatarian">Pescatarian (1.9 t/yr)</option>
                  <option value="vegetarian">Vegetarian (1.7 t/yr)</option>
                  <option value="vegan">100% Plant-Based (1.4 t/yr)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Recycling & Waste Habits:
                </label>
                <select
                  value={inputs.wasteHabits}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      wasteHabits: e.target.value as any,
                    })
                  }
                  className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="average">Standard Municipal Landfill</option>
                  <option value="recycler">Active Recycler & Composter</option>
                  <option value="zero_waste">Zero-Waste Practice</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Visual Analytics Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/80 border border-emerald-600/40 rounded-xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Top Score Banner */}
            <div className="text-center pb-5 border-b border-emerald-950">
              <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                ANNUAL CARBON FOOTPRINT
              </span>
              <div className="flex items-baseline justify-center gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                  {results.totalEmissions.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-emerald-300">
                  metric tons CO₂e / yr
                </span>
              </div>

              {/* Status Comparison */}
              <div className="flex items-center justify-center gap-2 mt-3 text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    results.totalEmissions <= 2.5
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : results.totalEmissions <= 5.0
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                      : 'bg-red-900/60 text-red-300 border border-red-700'
                  }`}
                >
                  {results.totalEmissions <= 2.0
                    ? 'Paris 2030 Aligned'
                    : results.totalEmissions <= 4.7
                    ? 'Below Global Average'
                    : `${(results.globalComparisonPercent - 100).toFixed(0)}% Above Global Avg`}
                </span>
                <span className="text-slate-400">
                  Global Avg: 4.7 t · Paris Target: 2.0 t
                </span>
              </div>
            </div>

            {/* Category Breakdown Bars */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                EMISSIONS BREAKDOWN BY ACTIVITY
              </div>

              {[
                {
                  label: 'Transportation & Flights',
                  val: results.transportEmissions,
                  color: '#06b6d4',
                },
                {
                  label: 'Heating & Thermal Energy',
                  val: results.heatingEmissions,
                  color: '#f97316',
                },
                {
                  label: 'Dietary Nutrition',
                  val: results.dietEmissions,
                  color: '#eab308',
                },
                {
                  label: 'Electricity & Grid Draw',
                  val: results.electricityEmissions,
                  color: '#10b981',
                },
                {
                  label: 'Solid Waste & Recycling',
                  val: results.wasteEmissions,
                  color: '#8b5cf6',
                },
              ].map((item) => {
                const pct =
                  results.totalEmissions > 0
                    ? Math.round((item.val / results.totalEmissions) * 100)
                    : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>{item.label}</span>
                      <span className="font-mono text-white font-medium">
                        {item.val.toFixed(2)} t ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Physical Equivalencies */}
            <div className="pt-4 border-t border-emerald-950 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                  <TreeDeciduous className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase">Trees to Neutralize</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {results.treesNeededToOffset}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    mature trees / yr
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/30">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                  <Car className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase">Petrol Driving Equiv</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {results.kmDrivenEquivalent.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">km driven</span>
                </div>
              </div>
            </div>

            {/* Action CTA: Hand off to AI Advisor */}
            <button
              onClick={() => {
                if (onSendToAdvisor) {
                  onSendToAdvisor(inputs, results);
                }
                const advisorEl = document.getElementById('ai-advisor');
                if (advisorEl) {
                  advisorEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Personalized AI Decarbonization Plan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
