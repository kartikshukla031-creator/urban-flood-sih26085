'use client';

import React from 'react';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  CloudRain,
  Wrench,
  Cpu,
  Trees,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { WhatIfParameters, SimulationResult } from '../../types/flood';

interface WhatIfSimulatorProps {
  parameters: WhatIfParameters;
  onUpdateParameters: (params: WhatIfParameters) => void;
  baselineSimulation: SimulationResult;
  simulatedResult: SimulationResult;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  parameters,
  onUpdateParameters,
  baselineSimulation,
  simulatedResult,
}) => {
  const handleReset = () => {
    onUpdateParameters({
      rainfallMultiplier: 1.0,
      additionalBlockagePct: 0,
      auxiliaryPumpsLps: 0,
      greenInfrastructureRetentionPct: 0,
    });
  };

  // Compute Deltas
  const floodedRoadsDelta = simulatedResult.totalFloodedRoadsCount - baselineSimulation.totalFloodedRoadsCount;
  const maxDepthDelta = Math.round((simulatedResult.maxWaterDepthCm - baselineSimulation.maxWaterDepthCm) * 10) / 10;
  const criticalDrainsDelta = simulatedResult.criticalDrainageNodesCount - baselineSimulation.criticalDrainageNodesCount;

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">What-If Scenario Digital Twin</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Simulate hydrodynamic impacts of rainfall cloudbursts, pipe siltation, auxiliary pumps, and green sponge retention.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 transition"
          title="Reset Parameters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3.5">
        {/* 1. Rainfall Intensity Multiplier */}
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Rainfall Scale Multiplier
            </span>
            <span className="font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {parameters.rainfallMultiplier.toFixed(1)}x ({Math.round(simulatedResult.rainfallIntensityMmHr)} mm/h)
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={parameters.rainfallMultiplier}
            onChange={(e) =>
              onUpdateParameters({
                ...parameters,
                rainfallMultiplier: parseFloat(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0.5x (Light)</span>
            <span>1.0x (Baseline)</span>
            <span>2.5x (Extreme Cloudburst)</span>
          </div>
        </div>

        {/* 2. Additional Drainage Blockage */}
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Network Silt & Debris Blockage
            </span>
            <span className="font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              +{parameters.additionalBlockagePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={parameters.additionalBlockagePct}
            onChange={(e) =>
              onUpdateParameters({
                ...parameters,
                additionalBlockagePct: parseInt(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0% (Clean Pipes)</span>
            <span>+30% (Severe Silt)</span>
            <span>+60% (Choked Drains)</span>
          </div>
        </div>

        {/* 3. Auxiliary Dewatering Pumps Capacity */}
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Emergency Dewatering Pump (Sump M10)
            </span>
            <span className="font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              {parameters.auxiliaryPumpsLps} L/s
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="50"
            value={parameters.auxiliaryPumpsLps}
            onChange={(e) =>
              onUpdateParameters({
                ...parameters,
                auxiliaryPumpsLps: parseInt(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0 L/s</span>
            <span>250 L/s (2 Units)</span>
            <span>500 L/s (High-Flow Rig)</span>
          </div>
        </div>

        {/* 4. Green Infrastructure Retention */}
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              Green Sponge Retention (SUDS)
            </span>
            <span className="font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {parameters.greenInfrastructureRetentionPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={parameters.greenInfrastructureRetentionPct}
            onChange={(e) =>
              onUpdateParameters({
                ...parameters,
                greenInfrastructureRetentionPct: parseInt(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0% (Current Concrete)</span>
            <span>20% (Bio-swales)</span>
            <span>40% (Full Sponge City)</span>
          </div>
        </div>
      </div>

      {/* Comparative Before vs After Impact Matrix */}
      <div className="bg-[#09101f] p-3 rounded-lg border border-slate-800 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-200 uppercase font-mono flex items-center justify-between">
          <span>Comparative Simulation Delta</span>
          <span className="text-[9px] text-purple-400 font-semibold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
            BEFORE vs AFTER
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#0f172a] p-2 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Flooded Roads</div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              {baselineSimulation.totalFloodedRoadsCount} ➔ {simulatedResult.totalFloodedRoadsCount}
            </div>
            <div
              className={`text-[10px] font-mono font-semibold flex items-center justify-center gap-0.5 mt-0.5 ${
                floodedRoadsDelta > 0 ? 'text-rose-400' : floodedRoadsDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {floodedRoadsDelta > 0 ? <TrendingUp className="w-3 h-3" /> : floodedRoadsDelta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
              {floodedRoadsDelta > 0 ? `+${floodedRoadsDelta}` : `${floodedRoadsDelta}`} roads
            </div>
          </div>

          <div className="bg-[#0f172a] p-2 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Max Depth</div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              {baselineSimulation.maxWaterDepthCm} ➔ {simulatedResult.maxWaterDepthCm} cm
            </div>
            <div
              className={`text-[10px] font-mono font-semibold flex items-center justify-center gap-0.5 mt-0.5 ${
                maxDepthDelta > 0 ? 'text-rose-400' : maxDepthDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {maxDepthDelta > 0 ? `+${maxDepthDelta}` : `${maxDepthDelta}`} cm
            </div>
          </div>

          <div className="bg-[#0f172a] p-2 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Drain Overloads</div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              {baselineSimulation.criticalDrainageNodesCount} ➔ {simulatedResult.criticalDrainageNodesCount}
            </div>
            <div
              className={`text-[10px] font-mono font-semibold flex items-center justify-center gap-0.5 mt-0.5 ${
                criticalDrainsDelta > 0 ? 'text-rose-400' : criticalDrainsDelta < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {criticalDrainsDelta > 0 ? `+${criticalDrainsDelta}` : `${criticalDrainsDelta}`} nodes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
