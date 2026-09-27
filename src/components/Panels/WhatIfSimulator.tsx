'use client';

import React from 'react';
import {
  Sliders,
  RotateCcw,
  CloudRain,
  Wrench,
  Cpu,
  Trees,
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

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              What-If Simulation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust scenario variables to evaluate mitigation impact.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded flex items-center gap-1 font-medium transition shadow-xs"
          title="Reset to Baseline"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          Reset
        </button>
      </div>

      {/* 4 Parameter Controls */}
      <div className="space-y-3">
        {/* 1. Rainfall */}
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              Rainfall
            </span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
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
            className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0.5x (Light)</span>
            <span>1.0x (Normal)</span>
            <span>2.5x (Extreme)</span>
          </div>
        </div>

        {/* 2. Drainage Blockage */}
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              Drainage Blockage
            </span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
              {parameters.additionalBlockagePct}%
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
            className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (Clean)</span>
            <span>30% (Moderate)</span>
            <span>60% (Choked)</span>
          </div>
        </div>

        {/* 3. Emergency Pump */}
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Emergency Pump
            </span>
            <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
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
            className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0 L/s</span>
            <span>250 L/s</span>
            <span>500 L/s</span>
          </div>
        </div>

        {/* 4. Green Retention */}
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              Green Retention
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
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
            className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>20% (Bio-swales)</span>
            <span>40% (Sponge City)</span>
          </div>
        </div>
      </div>

      {/* Simulated Impact Section */}
      <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Simulated Impact
        </div>

        <div className="space-y-2 text-xs">
          {/* Flood Depth */}
          <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Flood Depth:</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-slate-500 font-normal">{baselineSimulation.maxWaterDepthCm} cm</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className={simulatedResult.maxWaterDepthCm < baselineSimulation.maxWaterDepthCm ? 'text-emerald-700' : simulatedResult.maxWaterDepthCm > baselineSimulation.maxWaterDepthCm ? 'text-red-600' : 'text-slate-800'}>
                {simulatedResult.maxWaterDepthCm} cm
              </span>
            </div>
          </div>

          {/* Drainage Load */}
          <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Drainage Load:</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-slate-500 font-normal">{baselineSimulation.averageDrainageLoadPct}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className={simulatedResult.averageDrainageLoadPct < baselineSimulation.averageDrainageLoadPct ? 'text-emerald-700' : simulatedResult.averageDrainageLoadPct > baselineSimulation.averageDrainageLoadPct ? 'text-red-600' : 'text-slate-800'}>
                {simulatedResult.averageDrainageLoadPct}%
              </span>
            </div>
          </div>

          {/* Flooded Roads */}
          <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Flooded Roads:</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-slate-500 font-normal">{baselineSimulation.totalFloodedRoadsCount}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className={simulatedResult.totalFloodedRoadsCount < baselineSimulation.totalFloodedRoadsCount ? 'text-emerald-700' : simulatedResult.totalFloodedRoadsCount > baselineSimulation.totalFloodedRoadsCount ? 'text-red-600' : 'text-slate-800'}>
                {simulatedResult.totalFloodedRoadsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

