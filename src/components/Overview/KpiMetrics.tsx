'use client';

import React from 'react';
import {
  CloudRain,
  Droplets,
  AlertTriangle,
  Waves,
} from 'lucide-react';
import { SimulationResult } from '../../types/flood';

interface KpiMetricsProps {
  simulation: SimulationResult;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ simulation }) => {
  const kpis = [
    {
      title: 'Current Rainfall',
      value: `${simulation.rainfallIntensityMmHr}`,
      unit: 'mm/h',
      subtext: `Accumulated: ${simulation.cumulativeRainfallMm} mm`,
      icon: CloudRain,
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Surface Runoff',
      value: `${simulation.totalRunoffM3PerSec}`,
      unit: 'm³/s',
      subtext: 'Catchment inflow rate',
      icon: Droplets,
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Flooded Roads',
      value: `${simulation.totalFloodedRoadsCount} / ${simulation.roads.length}`,
      unit: '',
      subtext: `${simulation.highRiskRoadsCount} High/Severe Risk`,
      icon: AlertTriangle,
      iconColor: simulation.totalFloodedRoadsCount > 0 ? 'text-amber-600' : 'text-emerald-600',
      badgeColor: simulation.totalFloodedRoadsCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Maximum Water Depth',
      value: `${simulation.maxWaterDepthCm}`,
      unit: 'cm',
      subtext:
        simulation.maxWaterDepthCm >= 35
          ? 'Severe Inundation'
          : simulation.maxWaterDepthCm >= 15
          ? 'Moderate Water Pooling'
          : 'Safe / Low Ponding',
      icon: Waves,
      iconColor: simulation.maxWaterDepthCm >= 35 ? 'text-red-600' : simulation.maxWaterDepthCm >= 15 ? 'text-amber-600' : 'text-emerald-600',
      badgeColor: simulation.maxWaterDepthCm >= 35 ? 'bg-red-50 text-red-700' : simulation.maxWaterDepthCm >= 15 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-1">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {kpi.title}
              </span>
              <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 my-0.5">
              {kpi.value}
              {kpi.unit && <span className="text-xs font-normal text-slate-500 ml-1">{kpi.unit}</span>}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
              <span>{kpi.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

