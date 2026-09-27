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
  AlertTriangle,
  ArrowRight,
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
    name: 'Emergency Base ➔ City General Hospital',
    startName: 'Emergency Base (South Sector)',
    destName: 'City General Hospital',
    originCoords: [12.9250, 77.6120] as [number, number],
    destCoords: [12.9402, 77.6255] as [number, number],
    reason: 'Avoids 2 flooded road segments along central depression corridor.',
  },
  {
    id: 'p2',
    name: 'Central Metro ➔ Central Fire HQ',
    startName: 'Central Metro Station',
    destName: 'Central Fire HQ',
    originCoords: [12.9380, 77.6185] as [number, number],
    destCoords: [12.9452, 77.6125] as [number, number],
    reason: 'Reroutes via high-elevation northern ridge to ensure zero standing water.',
  },
  {
    id: 'p3',
    name: 'Civic Center ➔ South Relief Shelter',
    startName: 'Civic Center Boulevard',
    destName: 'South Emergency Shelter',
    originCoords: [12.9385, 77.6175] as [number, number],
    destCoords: [12.9265, 77.6140] as [number, number],
    reason: 'Evacuation detour bypassing flooded subway underpass.',
  },
];

export const RoutingPanel: React.FC<RoutingPanelProps> = ({ roads, onRouteCalculated }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('AMBULANCE');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [routeResult, setRouteResult] = useState<{ normalRoute: RouteOption; floodSafeRoute: RouteOption } | null>(null);

  const vehicleConfig = EMERGENCY_VEHICLES.find((v) => v.type === selectedVehicle) || EMERGENCY_VEHICLES[0];
  const activePreset = ROUTE_PRESETS.find((p) => p.id === selectedPresetId) || ROUTE_PRESETS[0];

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
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Flood-Safe Routing
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic route calculation avoiding submerged roads.
        </p>
      </div>

      {/* Vehicle Type Selection */}
      <div>
        <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
          Vehicle Profile
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {EMERGENCY_VEHICLES.map((v) => {
            const Icon = vehicleIcons[v.type];
            const isSelected = selectedVehicle === v.type;
            return (
              <button
                key={v.type}
                onClick={() => setSelectedVehicle(v.type)}
                className={`p-1.5 rounded-md border text-center transition flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] font-semibold truncate w-full">{v.name.split(' ')[0]}</span>
                <span className="text-[8px] text-slate-400 mt-0.5">≤{v.maxClearanceCm}cm</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Selector */}
      <div>
        <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
          Dispatch Route
        </div>
        <div className="space-y-1.5">
          {ROUTE_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPresetId(p.id)}
                className={`w-full text-left p-2 rounded-md border text-xs transition ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{p.name}</span>
                  {isSelected && <span className="text-[10px] text-blue-600 font-bold">Selected</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start / Destination Summary */}
      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">START:</span>
          <span className="font-bold text-slate-900">{activePreset.startName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">DESTINATION:</span>
          <span className="font-bold text-slate-900">{activePreset.destName}</span>
        </div>
      </div>

      {/* Comparison: Normal vs Flood-Safe Route */}
      {routeResult && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Normal Route */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Normal Route</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  routeResult.normalRoute.isPassable ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
                }`}>
                  {routeResult.normalRoute.isPassable ? 'Passable' : 'Flooded'}
                </span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {routeResult.normalRoute.distanceKm} km
              </div>
              <div className="text-[11px] text-slate-600">
                Max Depth: <strong className="text-red-600">{routeResult.normalRoute.maxWaterDepthCm} cm</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Time: ~{routeResult.normalRoute.estimatedTimeMin} min
              </div>
            </div>

            {/* Flood-Safe Route */}
            <div className="bg-emerald-50/50 border border-emerald-300 rounded-md p-2.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-800">Flood-Safe Route</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Recommended
                </span>
              </div>
              <div className="text-base font-bold text-emerald-950">
                {routeResult.floodSafeRoute.distanceKm} km
              </div>
              <div className="text-[11px] text-emerald-800">
                Max Depth: <strong>{routeResult.floodSafeRoute.maxWaterDepthCm} cm</strong>
              </div>
              <div className="text-[10px] text-emerald-700">
                Time: ~{routeResult.floodSafeRoute.estimatedTimeMin} min
              </div>
            </div>
          </div>

          {/* Reason Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-md p-2 text-xs">
            <span className="font-semibold text-blue-900">Reason: </span>
            <span className="text-slate-700">{activePreset.reason}</span>
          </div>
        </div>
      )}
    </div>
  );
};

