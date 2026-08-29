'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-[#0b1329]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-xl text-[11px] text-slate-300 w-56">
      <div
        className="flex items-center justify-between font-bold text-slate-200 cursor-pointer mb-1.5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Map Legend</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </div>

      {isExpanded && (
        <div className="space-y-2 mt-2 pt-1.5 border-t border-slate-800">
          {/* Road Water Depth */}
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Road Flood Depth</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Safe (&lt; 8 cm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-amber-400" />
                <span>Moderate (8–20 cm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-orange-500" />
                <span>High Risk (20–35 cm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>Severe (&gt; 35 cm - Impassable)</span>
              </div>
            </div>
          </div>

          {/* Drainage Network Status */}
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Stormwater Network</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-cyan-400" />
                <span>Normal Pipe (&lt;75% cap)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-amber-400" />
                <span>Elevated Load (75–95%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-rose-500 border border-rose-300" />
                <span>Surcharging / Backflow</span>
              </div>
            </div>
          </div>

          {/* Routing Routes */}
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Emergency Routing</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-cyan-300 shadow-sm" />
                <span>Flood-Safe Detour (Rec.)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-rose-400 border-b border-dashed border-rose-300" />
                <span>Normal Direct (Flooded)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
