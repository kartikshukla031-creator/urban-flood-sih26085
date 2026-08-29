'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  const layerList: { key: keyof MapLayerState; label: string }[] = [
    { key: 'showRoads', label: 'Road Inundation' },
    { key: 'showDrainagePipes', label: 'Drain Pipes' },
    { key: 'showDrainageNodes', label: 'Manhole Inlets' },
    { key: 'showFacilities', label: 'Critical Facilities' },
    { key: 'showDEMContours', label: 'DEM Elevation' },
    { key: 'showSafeRoute', label: 'Routing Paths' },
  ];

  return (
    <div className="bg-[#0b1329]/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 shadow-xl text-xs text-slate-300 flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold uppercase text-slate-500 font-mono px-1">Layers:</span>
      {layerList.map((layer) => {
        const isActive = layers[layer.key];
        return (
          <button
            key={layer.key}
            onClick={() => onToggleLayer(layer.key)}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition ${
              isActive
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                : 'bg-slate-900/80 text-slate-500 border border-slate-800 hover:text-slate-300'
            }`}
          >
            {isActive ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
