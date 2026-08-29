'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { FloodScenario } from '../../types/flood';
import { RainfallModel } from '../../engine/rainfallModel';

interface HydrographChartProps {
  scenario: FloodScenario;
  currentTimeOffset: number;
  rainfallMultiplier?: number;
}

export const HydrographChart: React.FC<HydrographChartProps> = ({
  scenario,
  currentTimeOffset,
  rainfallMultiplier = 1.0,
}) => {
  // Generate 0-180 min time series points every 15 min
  const data = [];
  for (let t = 0; t <= 180; t += 15) {
    const rain = RainfallModel.getIntensityAtTime(scenario, t, rainfallMultiplier);
    const cumul = RainfallModel.getCumulativeRainfall(scenario, t, rainfallMultiplier);
    // Estimated runoff in m3/s across whole zone
    const runoffM3s = Math.round(((rain * 0.82 * 1100000) / 3600000) * 100) / 100;
    // Zone safe drainage capacity threshold (~18 m3/s total across all outfalls)
    const nominalDrainCapM3s = 16.5;

    data.push({
      time: t === 0 ? 'T+0' : `+${t}m`,
      timeMin: t,
      rainfallMmHr: Math.round(rain),
      cumulativeMm: cumul,
      runoffM3s,
      nominalDrainCapM3s,
    });
  }

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Catchment Hydrograph & Drainage Overload Profile (0–3h)</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Current: <span className="text-cyan-300 font-bold">T+{currentTimeOffset} min</span>
        </div>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
            <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} unit=" mm/h" />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} unit=" m³/s" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090f1d',
                borderColor: '#1e293b',
                borderRadius: '6px',
                fontSize: '11px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
              iconSize={8}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="rainfallMmHr"
              name="Rainfall (mm/h)"
              fill="#0284c7"
              fillOpacity={0.25}
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="runoffM3s"
              name="Surface Runoff (m³/s)"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="nominalDrainCapM3s"
              name="Drainage Capacity (m³/s)"
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
