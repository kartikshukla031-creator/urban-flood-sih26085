'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  Area,
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
    const runoffM3s = Math.round(((rain * 0.82 * 1100000) / 3600000) * 100) / 100;
    const nominalDrainCapM3s = 16.5;

    data.push({
      time: t === 0 ? 'Current' : `+${t}m`,
      timeMin: t,
      rainfallMmHr: Math.round(rain),
      runoffM3s,
      nominalDrainCapM3s,
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>3-Hour Rainfall & Runoff Forecast</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Selected: <strong className="text-blue-700 font-semibold">{currentTimeOffset === 0 ? 'Current (T+0)' : `+${currentTimeOffset} min`}</strong>
        </div>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} unit=" mm/h" />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} unit=" m³/s" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#0f172a',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }}
              iconSize={8}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="rainfallMmHr"
              name="Rainfall (mm/h)"
              fill="#bfdbfe"
              fillOpacity={0.6}
              stroke="#2563eb"
              strokeWidth={1.5}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="runoffM3s"
              name="Runoff (m³/s)"
              stroke="#4338ca"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="nominalDrainCapM3s"
              name="Drainage Capacity"
              stroke="#dc2626"
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

