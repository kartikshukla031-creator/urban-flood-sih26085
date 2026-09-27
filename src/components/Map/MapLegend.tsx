'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md p-2.5 shadow-sm text-xs text-slate-800 w-48 select-none">
      <div
        className="flex items-center justify-between font-semibold text-slate-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Flood Depth</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </div>

      {isExpanded && (
        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" />
            <span className="text-slate-700">Safe (&lt; 8 cm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-amber-400 shrink-0" />
            <span className="text-slate-700">Moderate (8–20 cm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-orange-500 shrink-0" />
            <span className="text-slate-700">High Risk (20–35 cm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-red-600 shrink-0" />
            <span className="text-slate-700 font-medium">Severe (&gt; 35 cm)</span>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-blue-600 rounded shrink-0" />
              <span>Drainage Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-600 rounded shrink-0" />
              <span>Safe Evacuation Route</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

