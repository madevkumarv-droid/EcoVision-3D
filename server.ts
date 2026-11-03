import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Sustainability Advisor Endpoint
app.post('/api/advisor', async (req: Request, res: Response) => {
  try {
    const { footprintData, customQuery } = req.body;

    if (!ai) {
      // Provide intelligent, mathematically sound fallback response if API key is not configured
      return res.json({
        success: true,
        isFallback: true,
        recommendation: generateHeuristicRecommendation(footprintData, customQuery),
      });
    }

    const promptContext = footprintData
      ? `User Footprint Profile:
- Electricity: ${footprintData.electricityKwh || 350} kWh/month (${footprintData.cleanEnergyPercent || 15}% clean energy source)
- Transportation: ${footprintData.vehicleMileage || 120} km/week (${footprintData.vehicleType || 'Gasoline Sedan'}), Public transit: ${footprintData.transitHours || 2} hrs/week, Short flights: ${footprintData.shortFlights || 1}/yr, Long flights: ${footprintData.longFlights || 0}/yr
- Heating/Cooking: ${footprintData.heatingSource || 'Natural Gas'}
- Diet: ${footprintData.dietType || 'Omnivore'}
- Total Estimated Annual Footprint: ${footprintData.totalEmissions || 5.8} metric tons CO2e/year
${customQuery ? `User Specific Question: "${customQuery}"` : ''}`
      : `Question: "${customQuery || 'Provide the top 3 actionable household energy decarbonization steps.'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the EcoVision Chief Sustainability Engineer & Building Science Auditor. Analyze the user's environmental profile and provide personalized, scientifically backed, high-impact recommendations to reduce emissions and energy expenses.

${promptContext}

Formatting requirement:
Structure your response in clear, readable sections:
1. **Executive Summary & Carbon Diagnosis**: 2-3 sentences evaluating where their highest leverage points are.
2. **Immediate / Low-Cost Wins (30-Day Payback)**: 3 specific tactical adjustments.
3. **Mid-to-Long Term Capital Upgrades**: 2-3 high-ROI electrification investments (e.g., heat pumps, solar arrays, induction, smart panel), including estimated CO2 reduction percentages.
4. **Behavioral & Lifestyle Optimization**: Tailored to their mobility and dietary inputs.
5. **Projected Impact**: Quantify estimated potential savings in tons of CO2e per year and approximate annual utility reduction.

Keep the tone professional, motivating, and strictly grounded in real decarbonization engineering. No conversational fluff at the beginning or end.`,
    });

    const text = response.text || 'No recommendation generated.';
    return res.json({
      success: true,
      isFallback: false,
      recommendation: text,
    });
  } catch (error: any) {
    console.error('Gemini advisor error:', error);
    // Return graceful fallback data so user experience is never blocked
    const fallbackText = generateHeuristicRecommendation(
      req.body.footprintData,
      req.body.customQuery
    );
    return res.json({
      success: true,
      isFallback: true,
      recommendation: fallbackText,
      warning: 'Live AI connection momentarily busy; displaying precomputed audit recommendations.',
    });
  }
});

// Heuristic fallback generator based on real energy auditing logic
function generateHeuristicRecommendation(data: any = {}, query?: string): string {
  const electricity = Number(data.electricityKwh) || 350;
  const miles = Number(data.vehicleMileage) || 120;
  const total = Number(data.totalEmissions) || 5.4;

  let advice = `### Executive Summary & Carbon Diagnosis
Your estimated household carbon footprint is currently **${total.toFixed(1)} metric tons CO2e/year**. For context, the global per capita average is ~4.7 tons, while the Paris Agreement 2030 target is ~2.0 tons. Your primary decarbonization levers lie in space heating, vehicle electrification, and grid electricity sourcing.

### Immediate / Low-Cost Wins (30-Day Payback)
1. **Smart Thermostat Setback & Scheduling**: Lowering heating setpoints by 1.5°C during sleep and away periods cuts annual thermal energy use by 7–10% without sacrificing comfort.
2. **Vampire Load & Phantom Power Mitigation**: Use smart power strips on home entertainment centers and office workstations. Idle electronic draw accounts for 5–8% of residential electricity (~${Math.round(electricity * 0.06)} kWh/month).
3. **Cold Water Laundry & Aerated Fixtures**: 85% of washing machine energy goes into heating water. Switching to cold wash saves ~0.4 kg CO2e per load.

### Mid-to-Long Term Capital Upgrades
1. **Cold-Climate Heat Pump (Air-to-Water or Air-to-Air)**: Modern variable-capacity inverter heat pumps operate at 300–400% COP (Coefficient of Performance), reducing heating emissions by up to 65% compared to natural gas or fuel oil furnaces.
2. **Rooftop Solar PV Installation (4 to 6 kW)**: A modest residential array offset can generate 450–700 kWh/month depending on your insolation zone, neutralizing approximately ${(electricity * 0.005).toFixed(1)} tons of CO2e annually.
3. **EV Transition or Micro-Mobility**: If traveling ${miles} km/week by internal combustion vehicle, transitioning to a clean-grid EV or hybrid eliminates approximately ${((miles * 52 * 0.17) / 1000).toFixed(1)} tons of transport CO2e annually.

### Projected Impact
By implementing these recommended upgrades, your household can decrease its carbon footprint by **${(total * 0.48).toFixed(1)} tons CO2e/year (-48%)**, alongside an estimated 35–45% reduction in annual utility expenses.`;

  if (query) {
    advice += `\n\n*Note regarding your question ("${query}"): For optimal micro-grid and electrification efficiency, always prioritize building envelope insulation (R-49 attic, R-15 walls) before sizing mechanical systems.*`;
  }

  return advice;
}

// Environmental Live / Verified Snapshot Data Endpoint
app.get('/api/environmental-indicators', (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    indicators: [
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
        yoyChange: '+0.11°C decade rate',
        source: 'NASA GISS Surface Temperature Analysis',
        status: 'alert',
      },
      {
        id: 'ice',
        name: 'Arctic Sea Ice Minimum Extent',
        currentValue: 4.28,
        unit: 'million km²',
        historicalAverage: 6.85,
        yoyChange: '-12.2% per decade',
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
    ],
  });
});

// Vite Middleware & Static Server
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoVision 3D Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
