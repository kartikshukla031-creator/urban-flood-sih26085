'use client';

import React from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  Rectangle,
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
      ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-400'
      : risk === 'HIGH'
      ? 'border-amber-500 bg-amber-50 text-amber-700'
      : 'border-blue-600 bg-blue-50 text-blue-700';

  return L.divIcon({
    className: 'custom-facility-marker',
    html: `<div class="w-7 h-7 rounded-full border-2 ${ringColor} flex items-center justify-center text-xs shadow-md font-bold cursor-pointer transition-transform hover:scale-110 bg-white">${iconText}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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
      className="w-full h-full z-0 bg-slate-100"
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
          const cellFill =
            cell.elevationM <= 206
              ? '#93c5fd' // Depression Basin (Light blue)
              : cell.elevationM <= 212
              ? '#bfdbfe' // Low Valley
              : cell.elevationM <= 218
              ? '#e2e8f0' // Mid-slope
              : '#fde68a'; // High Ridge

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
                fillOpacity: 0.3,
                weight: 0.3,
                color: '#94a3b8',
              }}
            >
              <Tooltip sticky>
                <div className="text-xs text-slate-800 p-1">
                  <div>Elevation: <strong className="text-blue-700">{cell.elevationM}m</strong></div>
                  <div>Slope: {cell.slopePercent}%</div>
                  <div>Zone: {cell.landUse}</div>
                </div>
              </Tooltip>
            </Rectangle>
          );
        })}

      {/* 2. Drainage Network Underground Pipes */}
      {layers.showDrainagePipes &&
        drainageEdges.map((edge) => {
          let pipeColor = '#0284c7'; // Clean Blue
          let pipeWeight = 3;
          let dashArray: string | undefined = undefined;

          if (edge.isSurcharging || edge.utilizationPercentage >= 98) {
            pipeColor = '#dc2626'; // Red Surcharge
            pipeWeight = 4;
            dashArray = '6 4';
          } else if (edge.utilizationPercentage >= 75) {
            pipeColor = '#d97706'; // Amber elevated
            pipeWeight = 3.5;
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
                <div className="text-xs text-slate-800 p-1">
                  <div className="font-bold text-blue-700">{edge.name}</div>
                  <div>Capacity: {edge.effectiveCapacityLps} L/s (Blockage: {edge.blockagePercentage}%)</div>
                  <div>Flow: {edge.currentFlowLps} L/s ({edge.utilizationPercentage}%)</div>
                  {edge.isSurcharging && <div className="text-red-600 font-bold">⚠️ Surcharge Overload</div>}
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
            ? '#dc2626'
            : isOverloaded
            ? '#ea580c'
            : node.status === 'ELEVATED'
            ? '#d97706'
            : '#0284c7';

          return (
            <React.Fragment key={node.id}>
              {isSurcharging && (
                <CircleMarker
                  center={[node.lat, node.lng]}
                  radius={12}
                  pathOptions={{
                    color: '#dc2626',
                    fillColor: '#dc2626',
                    fillOpacity: 0.2,
                    weight: 1.5,
                  }}
                />
              )}
              <CircleMarker
                center={[node.lat, node.lng]}
                radius={isSelected ? 8 : 5}
                pathOptions={{
                  color: isSelected ? '#1e293b' : '#ffffff',
                  fillColor: markerColor,
                  fillOpacity: 1,
                  weight: isSelected ? 2.5 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectDrainageNode(node),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-xs text-slate-800 p-1">
                    <div className="font-bold">{node.name}</div>
                    <div>Flow Load: <strong>{node.totalLoadLps} L/s</strong> ({node.loadPercentage}%)</div>
                    {node.surchargeRateLps > 0 && (
                      <div className="text-red-600 font-bold">
                        ⚠️ Overload: +{node.surchargeRateLps} L/s
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

          let roadColor = '#16a34a'; // Safe (<8cm)
          let roadWeight = 4;
          let roadOpacity = 0.8;

          if (depth >= 35) {
            roadColor = '#dc2626'; // Severe (>35cm)
            roadWeight = 8;
            roadOpacity = 0.95;
          } else if (depth >= 20) {
            roadColor = '#ea580c'; // High (20-35cm)
            roadWeight = 6.5;
            roadOpacity = 0.9;
          } else if (depth >= 8) {
            roadColor = '#d97706'; // Moderate (8-20cm)
            roadWeight = 5;
            roadOpacity = 0.85;
          }

          if (isSelected) {
            roadWeight += 3;
          }

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color: isSelected ? '#2563eb' : roadColor,
                weight: roadWeight,
                opacity: roadOpacity,
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            >
              <Tooltip sticky>
                <div className="text-xs text-slate-800 p-1">
                  <div className="font-bold">{road.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span>Depth: <strong>{depth} cm</strong></span>
                    <span>•</span>
                    <span
                      className={
                        road.riskLevel === 'SEVERE'
                          ? 'text-red-600 font-bold'
                          : road.riskLevel === 'HIGH'
                          ? 'text-amber-600 font-bold'
                          : 'text-emerald-700 font-medium'
                      }
                    >
                      {road.riskLevel} Risk
                    </span>
                  </div>
                  {road.floodOnsetEtaMin !== null && (
                    <div className="text-amber-700 text-[10px] mt-0.5">
                      Flood ETA: {road.floodOnsetEtaMin === 0 ? 'Now' : `+${road.floodOnsetEtaMin} min`}
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
                color: '#dc2626',
                weight: 4.5,
                dashArray: '6 4',
                opacity: 0.8,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs text-slate-800 p-1">
                  <div className="font-bold text-red-600">Standard Direct Route</div>
                  <div>Distance: {routeOptions.normalRoute.distanceKm} km | Max Depth: {routeOptions.normalRoute.maxWaterDepthCm} cm</div>
                  <div className="text-red-700">{routeOptions.normalRoute.riskSummary}</div>
                </div>
              </Tooltip>
            </Polyline>
          )}

          {/* Flood-Safe Detour (Solid Emerald) */}
          {routeOptions.floodSafeRoute && routeOptions.floodSafeRoute.coordinates.length > 0 && (
            <Polyline
              positions={routeOptions.floodSafeRoute.coordinates}
              pathOptions={{
                color: '#16a34a',
                weight: 6,
                opacity: 0.95,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs text-slate-800 p-1">
                  <div className="font-bold text-emerald-700">✓ Recommended Flood-Safe Route</div>
                  <div>Distance: {routeOptions.floodSafeRoute.distanceKm} km | Max Depth: {routeOptions.floodSafeRoute.maxWaterDepthCm} cm</div>
                  <div className="text-emerald-800">Avoids flooded road segments via high-ground route</div>
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
                <div className="text-slate-900 text-xs p-1">
                  <div className="font-bold text-sm text-slate-900">{fac.name}</div>
                  <div className="text-slate-600 mt-1">Status: <strong>{fac.accessStatus === 'ACCESSIBLE' ? 'Accessible' : 'Access Affected'}</strong></div>
                  <div className="text-slate-600">Access Depth: <strong>{fac.predictedDepthCm} cm</strong></div>
                  <div className="mt-1 text-xs text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">{fac.alertMessage}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
};

