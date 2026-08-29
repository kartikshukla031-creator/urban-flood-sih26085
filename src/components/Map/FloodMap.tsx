'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  DEMCell,
  RouteOption,
} from '../../types/flood';
import { MapLayerState, LayerControls } from './LayerControls';
import { MapLegend } from './MapLegend';

// Dynamically import Leaflet inner component to prevent Next.js SSR window errors
const DynamicFloodMapInner = dynamic(
  () => import('./FloodMapInner').then((mod) => mod.FloodMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#080d1a] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Municipal GIS Spatial Engine...</span>
        </div>
      </div>
    ),
  }
);

interface FloodMapProps {
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  drainageEdges: DrainageEdge[];
  facilities: CriticalFacility[];
  demCells: DEMCell[];
  selectedRoad: RoadSegment | null;
  selectedDrainageNode: DrainageNode | null;
  selectedFacility: CriticalFacility | null;
  onSelectRoad: (road: RoadSegment) => void;
  onSelectDrainageNode: (node: DrainageNode) => void;
  onSelectFacility: (facility: CriticalFacility) => void;
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
  routeOptions: { normalRoute?: RouteOption; floodSafeRoute?: RouteOption } | null;
}

export const FloodMap: React.FC<FloodMapProps> = (props) => {
  return (
    <div className="relative w-full h-full min-h-[460px] rounded-lg overflow-hidden border border-[#1e293b] shadow-2xl">
      {/* Floating Layer Controls (Top Left) */}
      <div className="absolute top-3 left-12 z-[1000]">
        <LayerControls layers={props.layers} onToggleLayer={props.onToggleLayer} />
      </div>

      {/* Floating Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-3 z-[1000]">
        <MapLegend />
      </div>

      {/* Main Interactive Leaflet Map */}
      <DynamicFloodMapInner {...props} />
    </div>
  );
};
