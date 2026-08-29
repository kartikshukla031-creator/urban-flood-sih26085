'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  Rectangle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  DEMCell,
  RouteOption,
} from '../../types/flood';
import { MapLayerState } from './LayerControls';
import { DEMO_ZONE_BOUNDS } from '../../data/urbanCatchmentData';

interface FloodMapInnerProps {
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
  routeOptions: { normalRoute?: RouteOption; floodSafeRoute?: RouteOption } | null;
}

// Custom icon creator for facilities
function createFacilityIcon(type: CriticalFacility['type'], risk: CriticalFacility['currentRisk']) {
  let iconText = '🏥';
  if (type === 'FIRE_STATION') iconText = '🚒';
  else if (type === 'POLICE_HQ') iconText = '🚓';
  else if (type === 'TRANSIT_HUB') iconText = '🚇';
  else if (type === 'SCHOOL') iconText = '🏫';
  else if (type === 'SHELTER') iconText = '⛺';

  const ringColor =
    risk === 'SEVERE'
      ? 'border-rose-500 bg-rose-950/90 text-rose-300 animate-bounce'
      : risk === 'HIGH'
      ? 'border-amber-500 bg-amber-950/90 text-amber-300'
      : 'border-cyan-500 bg-cyan-950/90 text-cyan-300';

  return L.divIcon({
    className: 'custom-facility-marker',
    html: `<div class="w-8 h-8 rounded-full border-2 ${ringColor} flex items-center justify-center text-sm shadow-lg font-bold cursor-pointer transition-transform hover:scale-125">${iconText}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export const FloodMapInner: React.FC<FloodMapInnerProps> = ({
  roads,
  drainageNodes,
  drainageEdges,
  facilities,
  demCells,
  selectedRoad,
  selectedDrainageNode,
  selectedFacility,
  onSelectRoad,
  onSelectDrainageNode,
  onSelectFacility,
  layers,
  routeOptions,
}) => {
  return (
    <MapContainer
      center={DEMO_ZONE_BOUNDS.center}
      zoom={14}
      minZoom={13}
      maxZoom={17}
      className="w-full h-full z-0 bg-[#070b14]"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="eoc-map-tiles"
      />

      {/* 1. DEM Micro-Topography Grid Overlay */}
      {layers.showDEMContours &&
        demCells.map((cell) => {
          // Normalize elevation (200m -> dark blue, 226m -> highland green/brown)
          const norm = Math.max(0, Math.min(1, (cell.elevationM - 200) / 26));
          const cellFill =
            cell.elevationM <= 206
              ? '#1e1b4b' // Deep Depression Basin
              : cell.elevationM <= 212
              ? '#0f3a57' // Low Valley
              : cell.elevationM <= 218
              ? '#1e3a34' // Mid-slope
              : '#3b2d18'; // High Ridge

          const cellBounds: [[number, number], [number, number]] = [
            [cell.lat - 0.0007, cell.lng - 0.0007],
            [cell.lat + 0.0007, cell.lng + 0.0007],
          ];

          return (
            <Rectangle
              key={cell.id}
              bounds={cellBounds}
              pathOptions={{
                fillColor: cellFill,
                fillOpacity: 0.35,
                weight: 0.3,
                color: '#334155',
              }}
            >
              <Tooltip sticky>
                <div className="text-[10px] font-mono">
                  <div>Elevation: <span className="font-bold text-cyan-300">{cell.elevationM}m</span></div>
                  <div>Slope: {cell.slopePercent}%</div>
                  <div>Land: {cell.landUse}</div>
                </div>
              </Tooltip>
            </Rectangle>
          );
        })}

      {/* 2. Drainage Network Underground Pipes */}
      {layers.showDrainagePipes &&
        drainageEdges.map((edge) => {
          const isSelected = false;
          let pipeColor = '#06b6d4'; // Normal Cyan
          let pipeWeight = 3;
          let dashArray: string | undefined = undefined;

          if (edge.isSurcharging || edge.utilizationPercentage >= 98) {
            pipeColor = '#ef4444'; // Red Surcharge
            pipeWeight = 5;
            dashArray = '6 6';
          } else if (edge.utilizationPercentage >= 75) {
            pipeColor = '#f59e0b'; // Amber elevated
            pipeWeight = 4;
          }

          return (
            <Polyline
              key={edge.id}
              positions={edge.coordinates}
              pathOptions={{
                color: pipeColor,
                weight: pipeWeight,
                dashArray,
                opacity: 0.85,
              }}
            >
              <Tooltip sticky>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-cyan-400">{edge.name}</div>
                  <div>Manning Cap: {edge.effectiveCapacityLps} L/s (Blockage: {edge.blockagePercentage}%)</div>
                  <div>Current Flow: {edge.currentFlowLps} L/s ({edge.utilizationPercentage}%)</div>
                  {edge.isSurcharging && <div className="text-rose-400 font-bold">⚠️ PIPE OVERLOADED</div>}
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

      {/* 3. Drainage Manholes / Inlets */}
      {layers.showDrainageNodes &&
        drainageNodes.map((node) => {
          const isSelected = selectedDrainageNode?.id === node.id;
          const isSurcharging = node.status === 'CRITICAL_SURCHARGE';
          const isOverloaded = node.status === 'OVERLOADED';

          const markerColor = isSurcharging
            ? '#ef4444'
            : isOverloaded
            ? '#f97316'
            : node.status === 'ELEVATED'
            ? '#facc15'
            : '#06b6d4';

          return (
            <React.Fragment key={node.id}>
              {/* Outer pulsing ring if surcharging */}
              {isSurcharging && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={14}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: '3 3',
                  }}
                />
              )}
              <CircleMarker
                center={[node.lat, node.lng]}
                radius={isSelected ? 9 : 6}
                pathOptions={{
                  color: isSelected ? '#ffffff' : '#0f172a',
                  fillColor: markerColor,
                  fillOpacity: 0.95,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectDrainageNode(node),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <div className="text-[11px] font-mono">
                    <div className="font-bold text-slate-100">{node.name}</div>
                    <div className="text-slate-300">
                      Load: <span className="font-bold text-cyan-300">{node.totalLoadLps} L/s</span> ({node.loadPercentage}%)
                    </div>
                    {node.surchargeRateLps > 0 && (
                      <div className="text-rose-400 font-bold">
                        ⚠️ Surcharge Overflow: +{node.surchargeRateLps} L/s
                      </div>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}

      {/* 4. Urban Road Segments (Flood Inundation Overlay) */}
      {layers.showRoads &&
        roads.map((road) => {
          const isSelected = selectedRoad?.id === road.id;
          const depth = road.currentDepthCm;

          let roadColor = '#10b981'; // Safe (<8cm)
          let roadWeight = 4;
          let roadOpacity = 0.7;

          if (depth >= 35) {
            roadColor = '#dc2626'; // Severe (>35cm)
            roadWeight = 9;
            roadOpacity = 0.95;
          } else if (depth >= 20) {
            roadColor = '#ea580c'; // High (20-35cm)
            roadWeight = 7;
            roadOpacity = 0.9;
          } else if (depth >= 8) {
            roadColor = '#f59e0b'; // Moderate (8-20cm)
            roadWeight = 5;
            roadOpacity = 0.8;
          }

          if (isSelected) {
            roadWeight += 3;
          }

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color: isSelected ? '#38bdf8' : roadColor,
                weight: roadWeight,
                opacity: roadOpacity,
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            >
              <Tooltip sticky>
                <div className="text-[11px] font-mono">
                  <div className="font-bold text-slate-100">{road.name}</div>
                  <div className="flex items-center gap-2">
                    <span>Depth: <strong className="text-cyan-300">{depth} cm</strong></span>
                    <span>•</span>
                    <span className={road.riskLevel === 'SEVERE' ? 'text-rose-400 font-bold' : road.riskLevel === 'HIGH' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {road.riskLevel} RISK
                    </span>
                  </div>
                  {road.floodOnsetEtaMin !== null && (
                    <div className="text-amber-300 text-[10px]">
                      Flood Onset: {road.floodOnsetEtaMin === 0 ? 'ACTIVE NOW' : `in ${road.floodOnsetEtaMin} min`}
                    </div>
                  )}
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

      {/* 5. Flood-Safe Emergency Routing Overlays */}
      {layers.showSafeRoute && routeOptions && (
        <>
          {/* Direct / Normal Route (Dashed Red if Flooded) */}
          {routeOptions.normalRoute && routeOptions.normalRoute.coordinates.length > 0 && (
            <Polyline
              positions={routeOptions.normalRoute.coordinates}
              pathOptions={{
                color: '#f43f5e',
                weight: 5,
                dashArray: '8 6',
                opacity: 0.75,
              }}
            >
              <Tooltip sticky>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-rose-400">Standard Direct Route</div>
                  <div>Dist: {routeOptions.normalRoute.distanceKm} km | Max Depth: {routeOptions.normalRoute.maxWaterDepthCm}cm</div>
                  <div className="text-rose-300">{routeOptions.normalRoute.riskSummary}</div>
                </div>
              </Tooltip>
            </Polyline>
          )}

          {/* Flood-Safe Detour (Glowing Cyan) */}
          {routeOptions.floodSafeRoute && routeOptions.floodSafeRoute.coordinates.length > 0 && (
            <Polyline
              positions={routeOptions.floodSafeRoute.coordinates}
              pathOptions={{
                color: '#22d3ee',
                weight: 7,
                opacity: 0.95,
              }}
            >
              <Tooltip sticky>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-cyan-300">✅ Recommended Flood-Safe Route</div>
                  <div>Dist: {routeOptions.floodSafeRoute.distanceKm} km | Max Depth: {routeOptions.floodSafeRoute.maxWaterDepthCm}cm</div>
                  <div className="text-emerald-300">High ground detour via ridge corridor</div>
                </div>
              </Tooltip>
            </Polyline>
          )}
        </>
      )}

      {/* 6. Critical Municipal Infrastructure Markers */}
      {layers.showFacilities &&
        facilities.map((fac) => {
          return (
            <Marker
              key={fac.id}
              position={[fac.lat, fac.lng]}
              icon={createFacilityIcon(fac.type, fac.currentRisk)}
              eventHandlers={{
                click: () => onSelectFacility(fac),
              }}
            >
              <Popup>
                <div className="text-slate-900 text-xs p-1 font-mono">
                  <div className="font-bold text-sm">{fac.name}</div>
                  <div className="text-slate-600 mt-1">Status: <strong>{fac.accessStatus}</strong></div>
                  <div className="text-slate-600">Access Depth: <strong>{fac.predictedDepthCm} cm</strong></div>
                  <div className="mt-1.5 text-[11px] text-slate-700 bg-slate-100 p-1 rounded">{fac.alertMessage}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
};
