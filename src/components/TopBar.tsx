'use client';

import React from 'react';
import {
  CloudRain,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Activity,
  AlertTriangle,
  Radio,
  Sliders,
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
  const timeSteps = [0, 30, 60, 90, 120, 180];

  return (
    <header className="bg-[#0b1329] border-b border-[#1e293b] text-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-md shadow-cyan-900/30 flex items-center justify-center">
          <CloudRain className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-wide text-white">URBAN FLOOD INTELLIGENCE</h1>
            <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              SIH26085
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span>MoES / NCMRWF</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              NOWCAST ACTIVE (0–3h)
            </span>
            <span>•</span>
            <span className="text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded text-[9px] border border-amber-800/40">
              SIMULATION PROTOTYPE
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded-lg border border-[#1e293b]">
        <span className="text-[11px] font-semibold uppercase text-slate-400 px-2 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Scenario:
        </span>
        <select
          value={currentScenario.id}
          onChange={(e) => {
            const found = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
            if (found) onSelectScenario(found);
          }}
          className="bg-[#1e293b] text-xs text-slate-200 rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium"
        >
          {PRESET_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={onOpenWhatIf}
          className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition"
          title="Open What-If Simulator"
        >
          <Sliders className="w-3.5 h-3.5" />
          What-If
        </button>
      </div>

      {/* Live Rain & Alerts Badge */}
      <div className="flex items-center gap-4">
        {/* Rainfall Widget */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-3">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Current Rain</div>
            <div className="text-sm font-bold text-cyan-300 font-mono flex items-center justify-center gap-1">
              {rainfallIntensity} <span className="text-[10px] font-normal text-slate-400">mm/h</span>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Accumulated</div>
            <div className="text-sm font-bold text-indigo-300 font-mono">
              {cumulativeRainfall} <span className="text-[10px] font-normal text-slate-400">mm</span>
            </div>
          </div>
        </div>

        {/* Alerts Pill */}
        {activeAlertsCount > 0 && (
          <div className="bg-rose-950/80 border border-rose-700/60 text-rose-300 px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{activeAlertsCount} ACTIVE ALERTS</span>
          </div>
        )}
      </div>

      {/* 0-3h Timeline Scrubber Controls */}
      <div className="flex items-center gap-2 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-[#1e293b]">
        <button
          onClick={onTogglePlay}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 p-1.5 rounded font-bold shadow transition"
          title={isPlaying ? 'Pause Nowcast Animation' : 'Play 0-3h Nowcast Animation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        <button
          onClick={() => onTimeChange(0)}
          className="text-slate-400 hover:text-slate-200 p-1 transition"
          title="Reset to T+0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-cyan-300 w-16 text-center">
            {timeOffsetMin === 0 ? 'NOW (T+0)' : `T+${timeOffsetMin} min`}
          </span>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1">
          {timeSteps.map((t) => (
            <button
              key={t}
              onClick={() => onTimeChange(t)}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded transition ${
                timeOffsetMin === t
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-[#1e293b] text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {t === 0 ? 'NOW' : `+${t}m`}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
