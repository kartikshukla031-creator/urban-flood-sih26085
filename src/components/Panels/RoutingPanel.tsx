'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Ambulance,
  Flame,
  Shield,
  Bus,
  Car,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { RoadSegment, VehicleType, RouteOption } from '../../types/flood';
import { EMERGENCY_VEHICLES } from '../../data/scenarios';
import { SafeRoutingEngine } from '../../engine/safeRoutingEngine';

interface RoutingPanelProps {
  roads: RoadSegment[];
  onRouteCalculated: (routes: { normalRoute: RouteOption; floodSafeRoute: RouteOption } | null) => void;
}

const ROUTE_PRESETS = [
  {
    id: 'p1',
    name: 'Sector 4 Colony ➔ City General Hospital',
    originName: 'South-West Colony Junction (R21)',
    originCoords: [12.9250, 77.6120] as [number, number],
    destName: 'City General Hospital (R6)',
    destCoords: [12.9402, 77.6255] as [number, number],
    scenarioDesc: 'Direct arterial R14 traverses central depression sump. Safe detour reroutes via West Ridge.',
  },
  {
    id: 'p2',
    name: 'Central Metro ➔ Central Fire HQ',
    originName: 'Metropolitan Central Transit (R9)',
    originCoords: [12.9380, 77.6185] as [number, number],
    destName: 'Central Fire HQ (R1)',
    destCoords: [12.9452, 77.6125] as [number, number],
    scenarioDesc: 'Rapid deployment route to high-ground rescue station.',
  },
  {
    id: 'p3',
    name: 'Civic Center ➔ South Relief Shelter',
    originName: 'Civic Boulevard (R13)',
    originCoords: [12.9385, 77.6175] as [number, number],
    destName: 'South Basin Emergency Shelter (R26)',
    destCoords: [12.9265, 77.6140] as [number, number],
    scenarioDesc: 'Evacuation corridor avoiding Railway Underpass R24 inundation.',
  },
];

export const RoutingPanel: React.FC<RoutingPanelProps> = ({ roads, onRouteCalculated }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('AMBULANCE');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [routeResult, setRouteResult] = useState<{ normalRoute: RouteOption; floodSafeRoute: RouteOption } | null>(null);

  const vehicleConfig = EMERGENCY_VEHICLES.find((v) => v.type === selectedVehicle) || EMERGENCY_VEHICLES[0];
  const activePreset = ROUTE_PRESETS.find((p) => p.id === selectedPresetId) || ROUTE_PRESETS[0];

  // Re-calculate route when vehicle, preset, or road flood depths update
  useEffect(() => {
    const routes = SafeRoutingEngine.calculateRoutes(
      roads,
      activePreset.originCoords,
      activePreset.destCoords,
      selectedVehicle
    );
    setRouteResult(routes);
    onRouteCalculated(routes);
  }, [roads, selectedVehicle, selectedPresetId, onRouteCalculated, activePreset]);

  const vehicleIcons: Record<VehicleType, any> = {
    AMBULANCE: Ambulance,
    FIRE_TRUCK: Flame,
    POLICE_CRUISER: Shield,
    PUBLIC_BUS: Bus,
    COMMUTER_CAR: Car,
  };

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100">Dynamic Flood-Safe Emergency Routing</h2>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Topography-aware Dijkstra engine penalizing standing water depth and inundation probability.
        </p>
      </div>

      {/* Vehicle Selector */}
      <div>
        <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5 font-mono">
          1. Select Vehicle Profile & Water Clearance
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {EMERGENCY_VEHICLES.map((v) => {
            const Icon = vehicleIcons[v.type];
            const isSelected = selectedVehicle === v.type;
            return (
              <button
                key={v.type}
                onClick={() => setSelectedVehicle(v.type)}
                className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] font-bold truncate w-full">{v.type.replace('_', ' ')}</span>
                <span className="text-[8px] font-mono text-cyan-400 mt-0.5">&le; {v.maxClearanceCm}cm</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin & Destination Presets */}
      <div>
        <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5 font-mono">
          2. Emergency Dispatch Origin & Destination
        </div>
        <div className="space-y-1.5">
          {ROUTE_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPresetId(p.id)}
                className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-950/60 to-cyan-950/40 border-cyan-600/80 text-cyan-200'
                    : 'bg-[#0f172a] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs flex items-center justify-between">
                  <span>{p.name}</span>
                  {isSelected && <span className="text-[9px] font-mono text-cyan-400 font-semibold">ACTIVE</span>}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.scenarioDesc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Results */}
      {routeResult && (
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400 font-mono">
            3. Algorithmic Route Comparison Matrix
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Direct / Normal Shortest Route */}
            <div className="bg-[#0f172a] border border-rose-900/40 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">Direct Route</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  routeResult.normalRoute.isPassable ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}>
                  {routeResult.normalRoute.isPassable ? 'PASSABLE' : 'IMPASSABLE'}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Distance:</span>
                  <span className="text-slate-200 font-bold">{routeResult.normalRoute.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travel Time:</span>
                  <span className="text-slate-200 font-bold">{routeResult.normalRoute.estimatedTimeMin} min</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Max Water Depth:</span>
                  <span className="text-rose-400 font-bold">{routeResult.normalRoute.maxWaterDepthCm} cm</span>
                </div>
              </div>

              <div className="text-[10px] text-rose-300/80 bg-rose-950/40 p-1.5 rounded border border-rose-900/30">
                {routeResult.normalRoute.maxWaterDepthCm > vehicleConfig.maxClearanceCm
                  ? `DANGER: Encountered depth (${routeResult.normalRoute.maxWaterDepthCm}cm) exceeds ${vehicleConfig.name} clearance limit (${vehicleConfig.maxClearanceCm}cm). Risk of engine stall.`
                  : 'Passable but passes through elevated standing water.'}
              </div>
            </div>

            {/* Recommended Flood-Safe Route */}
            <div className="bg-[#0f172a] border border-cyan-800/80 rounded-lg p-2.5 space-y-2 shadow-lg shadow-cyan-950/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Safe Detour
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Distance:</span>
                  <span className="text-slate-200 font-bold">{routeResult.floodSafeRoute.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travel Time:</span>
                  <span className="text-slate-200 font-bold">{routeResult.floodSafeRoute.estimatedTimeMin} min</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Max Water Depth:</span>
                  <span className="text-emerald-400 font-bold">{routeResult.floodSafeRoute.maxWaterDepthCm} cm</span>
                </div>
              </div>

              <div className="text-[10px] text-emerald-300/90 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/30">
                {routeResult.floodSafeRoute.detourSummary}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
