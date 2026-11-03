import React, { useState, useMemo } from 'react';
import { SimulatorInputs, SimulatorOutputs } from '../types';
import {
  Zap,
  Sun,
  Wind,
  BatteryCharging,
  DollarSign,
  TrendingDown,
  Award,
  Sliders,
  Home,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const EnergySimulator: React.FC = () => {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    monthlyConsumptionKwh: 650,
    solarKw: 6.0,
    solarSunHours: 4.8,
    batteryKwh: 10,
    windContributionPercent: 20,
    gridElectricityCostKwh: 0.22,
    insulationLevel: 'standard',
    heatPumpInstalled: true,
  });

  // Calculate simulated micro-grid metrics
  const outputs: SimulatorOutputs = useMemo(() => {
    // Energy efficiency multiplier based on building envelope
    const insulationEfficiencyMultiplier =
      inputs.insulationLevel === 'poor'
        ? 1.25
        : inputs.insulationLevel === 'high_performance'
        ? 0.78
        : 1.0;

    // Adjusted monthly demand
    const effectiveMonthlyConsumption =
      inputs.monthlyConsumptionKwh * insulationEfficiencyMultiplier;

    // Solar PV monthly generation: kW * daily hours * 30 days * 0.82 system PR (Performance Ratio)
    const monthlySolarGenKwh = Math.round(
      inputs.solarKw * inputs.solarSunHours * 30 * 0.82
    );

    // Wind contribution (clean PPA or micro-wind)
    const monthlyWindGenKwh = Math.round(
      effectiveMonthlyConsumption * (inputs.windContributionPercent / 100)
    );

    const monthlyTotalCleanGenKwh = monthlySolarGenKwh + monthlyWindGenKwh;

    // Battery self-consumption bonus: battery absorbs daytime excess solar
    const batteryCycleKwhMonthly = inputs.batteryKwh * 26 * 0.9; // 90% round-trip efficiency
    const usableDirectSolar = Math.min(
      monthlySolarGenKwh,
      effectiveMonthlyConsumption * 0.55 + batteryCycleKwhMonthly
    );

    const monthlyGridImportKwh = Math.max(
      0,
      Math.round(
        effectiveMonthlyConsumption - usableDirectSolar - monthlyWindGenKwh
      )
    );

    const monthlyGridExportKwh = Math.max(
      0,
      Math.round(monthlySolarGenKwh - usableDirectSolar)
    );

    // Self-sufficiency ratio: Clean energy used onsite / total consumption
    const cleanEnergyConsumedOnsite = Math.min(
      effectiveMonthlyConsumption,
      usableDirectSolar + monthlyWindGenKwh
    );
    const selfSufficiencyPercent = Math.min(
      100,
      Math.round(
        (cleanEnergyConsumedOnsite / effectiveMonthlyConsumption) * 100
      )
    );

    // Baseline bill without clean energy vs with clean energy
    const baselineMonthlyBill =
      effectiveMonthlyConsumption * inputs.gridElectricityCostKwh;
    // Export credited at wholesale rate (50% retail net metering)
    const currentMonthlyBill =
      monthlyGridImportKwh * inputs.gridElectricityCostKwh -
      monthlyGridExportKwh * (inputs.gridElectricityCostKwh * 0.5);
    const monthlyDollarSavings = Math.max(
      0,
      baselineMonthlyBill - currentMonthlyBill
    );

    // CO2 avoided: Clean kWh * 0.39 kg CO2e / kWh blended factor * 12 months
    const annualCo2ReductionKg = Math.round(
      monthlyTotalCleanGenKwh * 0.39 * 12
    );

    // Sustainability Score calculation (0 - 100)
    let score =
      selfSufficiencyPercent * 0.55 +
      (inputs.batteryKwh > 5 ? 15 : inputs.batteryKwh > 0 ? 8 : 0) +
      (inputs.heatPumpInstalled ? 15 : 0) +
      (inputs.insulationLevel === 'high_performance'
        ? 15
        : inputs.insulationLevel === 'standard'
        ? 10
        : 2);
    const sustainabilityScore = Math.min(100, Math.round(score));

    // 24-Hour generation vs load curve profile
    const hourlyProfile = Array.from({ length: 24 }).map((_, hour) => {
      // Household load shape: peaks around 7-9am and 6-10pm
      let loadRatio = 0.025; // baseline overnight
      if (hour >= 6 && hour <= 9) loadRatio = 0.055;
      else if (hour >= 10 && hour <= 16) loadRatio = 0.038;
      else if (hour >= 17 && hour <= 22) loadRatio = 0.07;
      const hourlyLoad =
        (effectiveMonthlyConsumption / 30) * loadRatio;

      // Solar generation bell curve peaking around solar noon (12:00 - 13:00)
      let solarKW = 0;
      if (hour >= 6 && hour <= 18) {
        const peakSolar = inputs.solarKw * (inputs.solarSunHours / 5.0) * 0.85;
        solarKW =
          peakSolar * Math.sin(((hour - 6) / 12) * Math.PI);
      }

      const netGridFlow = hourlyLoad - solarKW;

      return {
        hour,
        solarGeneration: Number(solarKW.toFixed(2)),
        householdLoad: Number(hourlyLoad.toFixed(2)),
        netGridFlow: Number(netGridFlow.toFixed(2)),
      };
    });

    return {
      monthlySolarGenKwh,
      monthlyWindGenKwh,
      monthlyTotalCleanGenKwh,
      monthlyGridImportKwh,
      monthlyGridExportKwh,
      selfSufficiencyPercent,
      annualCo2ReductionKg,
      monthlyDollarSavings,
      sustainabilityScore,
      hourlyProfile,
    };
  }, [inputs]);

  // Hourly Chart Dimensions
  const chartW = 700;
  const chartH = 220;
  const chartPadding = { top: 20, right: 20, bottom: 35, left: 40 };
  const innerW = chartW - chartPadding.left - chartPadding.right;
  const innerH = chartH - chartPadding.top - chartPadding.bottom;

  const maxVal = Math.max(
    ...outputs.hourlyProfile.map((p) => Math.max(p.solarGeneration, p.householdLoad)),
    4.0
  );

  const getChartX = (h: number) =>
    chartPadding.left + (h / 23) * innerW;
  const getChartY = (v: number) =>
    chartPadding.top + innerH - (v / maxVal) * innerH;

  const solarLine = outputs.hourlyProfile
    .map((p) => `${getChartX(p.hour)},${getChartY(p.solarGeneration)}`)
    .join(' ');
  const solarArea = `${solarLine} ${getChartX(23)},${chartPadding.top + innerH} ${getChartX(0)},${chartPadding.top + innerH}`;

  const loadLine = outputs.hourlyProfile
    .map((p) => `${getChartX(p.hour)},${getChartY(p.householdLoad)}`)
    .join(' ');

  return (
    <section id="simulator" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>DYNAMIC CLEAN POWER & MICRO-GRID SIMULATOR</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Interactive Energy & Solar Storage Simulator
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Simulate rooftop solar arrays, battery storage, and building envelope
              efficiency. Watch real-time self-sufficiency, bills, and 24-hour diurnal load flows update live.
            </p>
          </div>

          {/* Quick Score Pill */}
          <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-xl flex items-center gap-3 shrink-0">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono text-emerald-400/80 uppercase">
                Sustainability Score
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {outputs.sustainabilityScore} / 100
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-5">
          <div className="text-xs font-mono text-emerald-400/90 uppercase tracking-wider pb-2 border-b border-emerald-950">
            SYSTEM SIZING & CONSUMPTION PARAMETERS
          </div>

          {/* Slider 1: Monthly Consumption */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Monthly Electricity Baseline:
              </span>
              <span className="font-mono text-white font-bold">
                {inputs.monthlyConsumptionKwh} kWh
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={inputs.monthlyConsumptionKwh}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  monthlyConsumptionKwh: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>200 kWh</span>
              <span>650 kWh (Avg)</span>
              <span>2,000 kWh</span>
            </div>
          </div>

          {/* Slider 2: Rooftop Solar kW */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Solar PV Array Sizing:
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {inputs.solarKw} kWp (~
                {Math.round(inputs.solarKw * 2.5)} panels)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={inputs.solarKw}
              onChange={(e) =>
                setInputs({ ...inputs, solarKw: Number(e.target.value) })
              }
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0 kW (None)</span>
              <span>6 kW (Standard)</span>
              <span>20 kW (Estate)</span>
            </div>
          </div>

          {/* Slider 3: Battery Storage kWh */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                Battery Storage Capacity:
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {inputs.batteryKwh} kWh
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2.5"
              value={inputs.batteryKwh}
              onChange={(e) =>
                setInputs({ ...inputs, batteryKwh: Number(e.target.value) })
              }
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0 kWh</span>
              <span>10 kWh (Powerwall)</span>
              <span>30 kWh</span>
            </div>
          </div>

          {/* Slider 4: Wind Energy Allocation */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Wind / Green PPA Grid Share:
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {inputs.windContributionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.windContributionPercent}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  windContributionPercent: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Multi-toggle Controls: Heat Pump & Building Envelope */}
          <div className="pt-2 border-t border-emerald-950 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                Thermal Envelope Insulation:
              </label>
              <select
                value={inputs.insulationLevel}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    insulationLevel: e.target.value as any,
                  })
                }
                className="w-full bg-emerald-950/50 border border-emerald-800/40 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="poor">Poor (High Heat Loss, +25%)</option>
                <option value="standard">Standard Building Code</option>
                <option value="high_performance">
                  High-Performance (Passivhaus, -22%)
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                Inverter Heat Pump:
              </label>
              <button
                type="button"
                onClick={() =>
                  setInputs({
                    ...inputs,
                    heatPumpInstalled: !inputs.heatPumpInstalled,
                  })
                }
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  inputs.heatPumpInstalled
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-black/30 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle
                  className={`w-3.5 h-3.5 ${
                    inputs.heatPumpInstalled
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`}
                />
                <span>
                  {inputs.heatPumpInstalled
                    ? 'Installed (350% COP)'
                    : 'Standard Gas/Resistance'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Outputs & 24h Diurnal Curve (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Key Output Metric Cards Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-3 shadow-lg">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">
                Self-Sufficiency
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-0.5">
                {outputs.selfSufficiencyPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Onsite Clean Draw
              </div>
            </div>

            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-3 shadow-lg">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">
                Bill Savings
              </div>
              <div className="text-2xl font-bold text-emerald-300 font-mono mt-0.5">
                ${outputs.monthlyDollarSavings.toFixed(0)}
                <span className="text-xs text-slate-400 font-normal">/mo</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ~${(outputs.monthlyDollarSavings * 12).toFixed(0)}/yr
              </div>
            </div>

            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-3 shadow-lg">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">
                CO₂ Avoided
              </div>
              <div className="text-2xl font-bold text-teal-300 font-mono mt-0.5">
                {(outputs.annualCo2ReductionKg / 1000).toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> t/yr</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {outputs.annualCo2ReductionKg.toLocaleString()} kg/yr
              </div>
            </div>
          </div>

          {/* 24-Hour Solar vs Load Profile SVG Chart */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  24-Hour Diurnal Power Profile (kW)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Solar peak generation (Gold) vs. Household load demand (Cyan)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                  Solar PV
                </span>
                <span className="flex items-center gap-1 text-cyan-400 text-[11px]">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
                  Home Load
                </span>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto select-none"
              >
                {/* Horizontal reference grid */}
                {[0, 1, 2, 3, 4].map((v) => {
                  const y = getChartY(v);
                  return (
                    <g key={v}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={chartW - chartPadding.right}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.07)"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={chartPadding.left - 6}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                        className="font-mono"
                      >
                        {v} kW
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Solar Area */}
                <polygon
                  points={solarArea}
                  fill="url(#solarGrad)"
                  opacity="0.35"
                />

                {/* Solar Curve */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={solarLine}
                />

                {/* Load Curve */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={loadLine}
                />

                {/* X-Axis Hours */}
                {[0, 4, 8, 12, 16, 20, 23].map((h) => (
                  <text
                    key={h}
                    x={getChartX(h)}
                    y={chartH - 8}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {h === 0
                      ? '12am'
                      : h === 12
                      ? '12pm'
                      : h > 12
                      ? `${h - 12}pm`
                      : `${h}am`}
                  </text>
                ))}

                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Monthly Energy Balance Table */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-950/70 text-xs">
              <div className="bg-emerald-950/30 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">
                  Solar Generated
                </span>
                <span className="font-mono text-white font-medium">
                  {outputs.monthlySolarGenKwh} kWh / mo
                </span>
              </div>
              <div className="bg-emerald-950/30 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">
                  Grid Import
                </span>
                <span className="font-mono text-white font-medium">
                  {outputs.monthlyGridImportKwh} kWh / mo
                </span>
              </div>
              <div className="bg-emerald-950/30 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">
                  Export to Grid
                </span>
                <span className="font-mono text-white font-medium">
                  {outputs.monthlyGridExportKwh} kWh / mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
