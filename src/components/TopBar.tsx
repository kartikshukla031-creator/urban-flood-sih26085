'use client';

import React from 'react';
import {
  CloudRain,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { FloodScenario } from '../types/flood';
import { PRESET_SCENARIOS } from '../data/scenarios';

interface TopBarProps {
  currentScenario: FloodScenario;
  onSelectScenario: (scenario: FloodScenario) => void;
  timeOffsetMin: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  rainfallIntensity: number;
  cumulativeRainfall: number;
  activeAlertsCount: number;
  onOpenWhatIf: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScenario,
  onSelectScenario,
  timeOffsetMin,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  rainfallIntensity,
  cumulativeRainfall,
  activeAlertsCount,
  onOpenWhatIf,
}) => {
  const timeSteps = [
    { value: 0, label: 'Current' },
    { value: 30, label: '30 min' },
    { value: 60, label: '60 min' },
    { value: 90, label: '90 min' },
    { value: 120, label: '120 min' },
    { value: 180, label: '180 min' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs z-20">
      {/* 1. Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-md shadow-xs flex items-center justify-center">
          <CloudRain className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Urban Flood Intelligence
            </h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
              SIH26085
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span>Urban Flood Nowcasting & Decision Support</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Monitoring Active
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded text-[10px]">
              Demo / Simulation
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scenario Selector & Timeline */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Scenario Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          <span className="text-xs font-medium text-slate-600">Scenario:</span>
          <select
            value={currentScenario.id}
            onChange={(e) => {
              const found = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
              if (found) onSelectScenario(found);
            }}
            className="bg-white text-xs text-slate-800 rounded px-2 py-1 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer shadow-xs"
          >
            {PRESET_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenWhatIf}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition shadow-xs"
            title="Open What-If Simulation"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>What-If Simulation</span>
          </button>
        </div>

        {/* Timeline Horizon */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
          <button
            onClick={onTogglePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition shadow-xs"
            title={isPlaying ? 'Pause Forecast Animation' : 'Play 0–3h Forecast'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => onTimeChange(0)}
            className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-200 rounded transition"
            title="Reset to Current (T+0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {timeSteps.map((step) => {
            const isSelected = timeOffsetMin === step.value;
            return (
              <button
                key={step.value}
                onClick={() => onTimeChange(step.value)}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. System Status & Current Rainfall */}
      <div className="flex items-center gap-3 text-xs">
        {/* Rainfall Indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase leading-tight">Current Rain</div>
            <div className="font-bold text-slate-900 leading-tight">
              {rainfallIntensity} <span className="font-normal text-slate-500 text-[10px]">mm/h</span>
            </div>
          </div>
        </div>

        {/* Last Updated & Status */}
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: Just now</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-emerald-700 font-medium text-[11px] mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>System Operational</span>
          </div>
        </div>

        {/* Active Alerts Count */}
        {activeAlertsCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-semibold text-xs shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{activeAlertsCount} Active Alerts</span>
          </div>
        )}
      </div>
    </header>
  );
};

