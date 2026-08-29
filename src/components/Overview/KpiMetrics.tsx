'use client';

import React from 'react';
import {
  CloudRain,
  AlertOctagon,
  Waves,
  GitPullRequest,
  BellRing,
  Timer,
  Droplets,
  TrendingUp,
} from 'lucide-react';
import { SimulationResult } from '../../types/flood';

interface KpiMetricsProps {
  simulation: SimulationResult;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ simulation }) => {
  const kpis = [
    {
      title: 'Current Rainfall',
      value: `${simulation.rainfallIntensityMmHr} mm/h`,
      subtext: `Cumul: ${simulation.cumulativeRainfallMm} mm`,
      icon: CloudRain,
      color: 'text-cyan-400',
      bg: 'from-cyan-950/40 to-blue-950/20 border-cyan-800/40',
    },
    {
      title: 'Surface Runoff Rate',
      value: `${simulation.totalRunoffM3PerSec} m³/s`,
      subtext: `Catchment Inflow`,
      icon: Droplets,
      color: 'text-blue-400',
      bg: 'from-blue-950/40 to-indigo-950/20 border-blue-800/40',
    },
    {
      title: 'Flooded Roadways',
      value: `${simulation.totalFloodedRoadsCount} / ${simulation.roads.length}`,
      subtext: `${simulation.highRiskRoadsCount} High/Severe Risk`,
      icon: AlertOctagon,
      color: simulation.totalFloodedRoadsCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bg: simulation.totalFloodedRoadsCount > 0 ? 'from-amber-950/40 to-orange-950/20 border-amber-800/40' : 'from-emerald-950/40 to-teal-950/20 border-emerald-800/40',
    },
    {
      title: 'Max Ponding Depth',
      value: `${simulation.maxWaterDepthCm} cm`,
      subtext: simulation.maxWaterDepthCm > 35 ? 'Severe Inundation' : simulation.maxWaterDepthCm > 15 ? 'Moderate Pooling' : 'Passable',
      icon: Waves,
      color: simulation.maxWaterDepthCm > 35 ? 'text-rose-400' : simulation.maxWaterDepthCm > 15 ? 'text-amber-400' : 'text-emerald-400',
      bg: simulation.maxWaterDepthCm > 35 ? 'from-rose-950/40 to-red-950/20 border-rose-800/40' : 'from-slate-900 to-slate-950 border-slate-800',
    },
    {
      title: 'Drainage Overload',
      value: `${simulation.criticalDrainageNodesCount} Nodes`,
      subtext: `Avg Load: ${simulation.averageDrainageLoadPct}%`,
      icon: GitPullRequest,
      color: simulation.criticalDrainageNodesCount > 0 ? 'text-purple-400' : 'text-emerald-400',
      bg: 'from-purple-950/40 to-slate-950 border-purple-800/40',
    },
    {
      title: 'Active Alerts',
      value: `${simulation.activeAlertsCount}`,
      subtext: 'Auto-dispatched',
      icon: BellRing,
      color: simulation.activeAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: 'from-slate-900 to-slate-950 border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${kpi.bg} border rounded-lg p-2.5 shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">{kpi.title}</span>
              <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <div className={`text-base font-bold font-mono tracking-tight ${kpi.color}`}>
              {kpi.value}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{kpi.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
