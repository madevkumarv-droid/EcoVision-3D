import React, { useState, useEffect } from 'react';
import { FootprintInputs, FootprintResults } from '../types';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  CheckCircle,
  Lightbulb,
  Zap,
  TrendingDown,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface AIAdvisorProps {
  initialFootprintInputs?: FootprintInputs | null;
  initialFootprintResults?: FootprintResults | null;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  initialFootprintInputs,
  initialFootprintResults,
}) => {
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Suggested quick prompts
  const quickPrompts = [
    'How do I size a heat pump to replace a natural gas furnace?',
    'What is the payback period for a 6 kW rooftop solar + 10 kWh battery system?',
    'How much CO₂ can I avoid by shifting to an electric vehicle for 150 km/wk?',
    'What are the most cost-effective home insulation retrofits?',
  ];

  // Request recommendation from server endpoint
  const requestRecommendation = async (queryText?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const footprintPayload = initialFootprintInputs
      ? {
          electricityKwh: initialFootprintInputs.electricityKwh,
          cleanEnergyPercent: initialFootprintInputs.cleanEnergyPercent,
          vehicleMileage: initialFootprintInputs.vehicleMileage,
          vehicleType: initialFootprintInputs.vehicleType,
          transitHours: initialFootprintInputs.transitHours,
          shortFlights: initialFootprintInputs.shortFlights,
          longFlights: initialFootprintInputs.longFlights,
          heatingSource: initialFootprintInputs.heatingSource,
          dietType: initialFootprintInputs.dietType,
          totalEmissions: initialFootprintResults?.totalEmissions || 5.4,
        }
      : null;

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footprintData: footprintPayload,
          customQuery: queryText || customQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        setIsFallbackNotice(!!data.isFallback);
      } else {
        throw new Error(data.error || 'Failed to parse AI advisor response.');
      }
    } catch (err: any) {
      console.error('Advisor request error:', err);
      setErrorMessage(
        'Unable to complete live AI request. Generating offline building science decarbonization guidelines.'
      );
      // Generate fallback local text
      setRecommendation(
        `### Building Science Decarbonization Audit

1. **Electrify Heating via Heat Pumps**: Variable refrigerant flow inverter heat pumps reduce primary thermal emissions by 60–70% compared to fossil fuel burners.
2. **Attic & Air Infiltration Sealing**: Air sealing with expanding foam and blowing R-49 cellulose insulation reduces HVAC conditioning load by 15–22%.
3. **Smart Load Shifting**: Program high-draw appliances (EV charger, laundry, heat pump water heater) to align with midday solar surplus or low-tariff off-peak periods.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If new footprint data was passed down, generate advice automatically
  useEffect(() => {
    if (initialFootprintResults) {
      requestRecommendation();
    }
  }, [initialFootprintResults]);

  const handleCopy = () => {
    if (recommendation) {
      navigator.clipboard.writeText(recommendation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="ai-advisor" className="py-12 scroll-mt-20">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>SERVER-SIDE GEMINI API ENERGY CONSULTANT</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              AI Sustainability & Energy Advisor
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Harness building science intelligence and Gemini 3.8 Flash to synthesize
              custom decarbonization roadmaps, financial payback estimates, and tactical efficiency wins.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-3 py-1.5 rounded-lg shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Query Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Footprint Context Banner */}
          {initialFootprintResults && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Synchronized with Your Footprint Profile</span>
              </div>
              <p className="text-slate-300">
                Auditing for ~
                <strong className="text-white">
                  {initialFootprintResults.totalEmissions.toFixed(2)} t CO₂e/yr
                </strong>{' '}
                household emission profile across electricity, mobility, and heating.
              </p>
            </div>
          )}

          {/* Custom Question Card */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <label className="text-xs font-semibold text-white block mb-2">
              Ask Specific Clean Energy & Decarbonization Questions:
            </label>

            <div className="relative">
              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g., How can I prioritize heat pumps vs rooftop solar with a $15,000 budget?"
                rows={3}
                className="w-full bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-500">
                {customQuery.length}/500 chars
              </span>
              <button
                disabled={isLoading}
                onClick={() => requestRecommendation()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-md transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Run AI Energy Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompt Starters */}
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <span className="text-xs font-mono text-emerald-400/90 uppercase tracking-wider block mb-3">
              CURATED TECHNICAL INQUIRIES:
            </span>
            <div className="space-y-2">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomQuery(q);
                    requestRecommendation(q);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-950 text-xs text-slate-300 hover:text-white transition-colors flex items-start gap-2 group"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advisor Output & Roadmap Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-950/80 border border-emerald-800/40 rounded-xl p-6 shadow-2xl backdrop-blur-md min-h-[460px] flex flex-col justify-between">
            <div>
              {/* Output Header */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-950 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Decarbonization Roadmap & Engineering Audit
                    </h3>
                    <p className="text-[11px] text-emerald-400/80">
                      Tailored recommendation generated for your building envelope
                    </p>
                  </div>
                </div>

                {recommendation && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      title="Copy Advice"
                      className="p-1.5 rounded-md bg-emerald-950/50 hover:bg-emerald-900/60 text-slate-300 hover:text-white border border-emerald-900/40 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => requestRecommendation()}
                      title="Regenerate Advice"
                      className="p-1.5 rounded-md bg-emerald-950/50 hover:bg-emerald-900/60 text-slate-300 hover:text-white border border-emerald-900/40 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status / Fallback Notice */}
              {isFallbackNotice && (
                <div className="mb-4 p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Displaying precomputed energy auditing models while the live server connection resolves.
                  </span>
                </div>
              )}

              {/* Body Content */}
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-white">
                    Synthesizing Decarbonization Audit...
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Evaluating heat pump sizing, solar insolation, transport conversion,
                    and financial payback intervals.
                  </p>
                </div>
              ) : recommendation ? (
                <div className="prose prose-invert prose-emerald max-w-none text-xs text-slate-300 leading-relaxed space-y-3">
                  {recommendation.split('\n\n').map((block, i) => {
                    if (block.startsWith('### ') || block.startsWith('**') && block.endsWith('**')) {
                      return (
                        <h4
                          key={i}
                          className="text-sm font-bold text-emerald-300 pt-2 border-t border-emerald-950 first:pt-0 first:border-0"
                        >
                          {block.replace(/^###\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '')}
                        </h4>
                      );
                    }
                    return (
                      <p key={i} className="whitespace-pre-line text-slate-300">
                        {block}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Bot className="w-10 h-10 text-emerald-600/60 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">
                    Ready to Generate Your Carbon Strategy
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                    Fill out the Carbon Footprint Calculator above or type a clean energy
                    question to receive tailored recommendations from the AI Advisor.
                  </p>
                  <button
                    onClick={() => requestRecommendation()}
                    className="px-4 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Run Sample Household Decarbonization Audit
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="pt-4 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Secure Server-Side Execution · Never exposes API keys</span>
              <span className="font-mono text-emerald-400">
                ASHRAE & EPA Decarbonization Standards
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
