'use client';

import React from 'react';
import { Layers } from 'lucide-react';

export interface MapLayerState {
  showRoads: boolean;
  showDrainagePipes: boolean;
  showDrainageNodes: boolean;
  showFacilities: boolean;
  showDEMContours: boolean;
  showSafeRoute: boolean;
}

interface LayerControlsProps {
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, onToggleLayer }) => {
  const isDrainageActive = layers.showDrainagePipes || layers.showDrainageNodes;

  const handleToggleDrainage = () => {
    const nextState = !isDrainageActive;
    if (layers.showDrainagePipes !== nextState) onToggleLayer('showDrainagePipes');
    if (layers.showDrainageNodes !== nextState) onToggleLayer('showDrainageNodes');
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md p-1 shadow-sm text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
      <span className="text-[11px] font-semibold uppercase text-slate-500 px-1.5 flex items-center gap-1">
        <Layers className="w-3.5 h-3.5 text-slate-500" />
        Layers:
      </span>

      {/* Road Flooding */}
      <button
        onClick={() => onToggleLayer('showRoads')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
          layers.showRoads
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Road Flooding
      </button>

      {/* Drainage */}
      <button
        onClick={handleToggleDrainage}
        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
          isDrainageActive
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Drainage
      </button>

      {/* Facilities */}
      <button
        onClick={() => onToggleLayer('showFacilities')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
          layers.showFacilities
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Facilities
      </button>

      {/* Elevation */}
      <button
        onClick={() => onToggleLayer('showDEMContours')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
          layers.showDEMContours
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Elevation
      </button>

      {/* Safe Route */}
      <button
        onClick={() => onToggleLayer('showSafeRoute')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
          layers.showSafeRoute
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Safe Route
      </button>
    </div>
  );
};

