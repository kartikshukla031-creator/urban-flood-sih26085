'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TopBar } from '../components/TopBar';
import { Sidebar, ActiveTab } from '../components/Sidebar';
import { KpiMetrics } from '../components/Overview/KpiMetrics';
import { HydrographChart } from '../components/Overview/HydrographChart';
import { FloodMap } from '../components/Map/FloodMap';
import { MapLayerState } from '../components/Map/LayerControls';
import { RoadDetailPanel } from '../components/Panels/RoadDetailPanel';
import { DrainageDetailPanel } from '../components/Panels/DrainageDetailPanel';
import { RoutingPanel } from '../components/Panels/RoutingPanel';
import { WhatIfSimulator } from '../components/Panels/WhatIfSimulator';
import { CriticalInfrastructure } from '../components/Panels/CriticalInfrastructure';
import { AlertsPanel } from '../components/Panels/AlertsPanel';
import { ModelTransparency } from '../components/Panels/ModelTransparency';

import { PRESET_SCENARIOS } from '../data/scenarios';
import {
  FloodScenario,
  WhatIfParameters,
  RoadSegment,
  DrainageNode,
  CriticalFacility,
  RouteOption,
} from '../types/flood';
import { FloodRiskEngine } from '../engine/floodRiskEngine';
import { generateDemoDEMGrid } from '../data/urbanCatchmentData';
import { AlertTriangle, MapPin, ChevronRight, Waves } from 'lucide-react';

export default function DashboardPage() {
  // Scenario & Simulation State
  const [currentScenario, setCurrentScenario] = useState<FloodScenario>(PRESET_SCENARIOS[1]); // Default to Heavy Rain
  const [timeOffsetMin, setTimeOffsetMin] = useState<number>(60); // Default to T+60 peak
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // What-If Parameters
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParameters>({
    rainfallMultiplier: 1.0,
    additionalBlockagePct: 0,
    auxiliaryPumpsLps: 0,
    greenInfrastructureRetentionPct: 0,
  });

  // Selected Entities for Detail Inspection
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>('R14'); // Default to hotspot Road 102
  const [selectedDrainageNodeId, setSelectedDrainageNodeId] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Map Layer Toggles - Default: Road Flooding ON only (as requested)
  const [layers, setLayers] = useState<MapLayerState>({
    showRoads: true,
    showDrainagePipes: false,
    showDrainageNodes: false,
    showFacilities: false,
    showDEMContours: false,
    showSafeRoute: false,
  });

  // Route Options State
  const [routeOptions, setRouteOptions] = useState<{
    normalRoute?: RouteOption;
    floodSafeRoute?: RouteOption;
  } | null>(null);

  // DEM grid cells
  const demCells = useMemo(() => generateDemoDEMGrid(), []);

  // Compute Baseline & Current Simulation
  const baselineSimulation = useMemo(() => {
    return FloodRiskEngine.runSimulation(currentScenario, timeOffsetMin);
  }, [currentScenario, timeOffsetMin]);

  const activeSimulation = useMemo(() => {
    const isWhatIfActive =
      activeTab === 'whatif' ||
      whatIfParams.rainfallMultiplier !== 1.0 ||
      whatIfParams.additionalBlockagePct !== 0 ||
      whatIfParams.auxiliaryPumpsLps !== 0 ||
      whatIfParams.greenInfrastructureRetentionPct !== 0;

    return FloodRiskEngine.runSimulation(
      currentScenario,
      timeOffsetMin,
      isWhatIfActive ? whatIfParams : undefined
    );
  }, [currentScenario, timeOffsetMin, whatIfParams, activeTab]);

  // Selected Entities
  const selectedRoad = useMemo(() => {
    return activeSimulation.roads.find((r) => r.id === selectedRoadId) || null;
  }, [activeSimulation.roads, selectedRoadId]);

  const connectedDrainageNode = useMemo(() => {
    if (!selectedRoad) return undefined;
    return activeSimulation.drainageNodes.find(
      (n) => n.id === selectedRoad.connectedDrainageNodeId
    );
  }, [activeSimulation.drainageNodes, selectedRoad]);

  const selectedDrainageNode = useMemo(() => {
    return activeSimulation.drainageNodes.find((n) => n.id === selectedDrainageNodeId) || null;
  }, [activeSimulation.drainageNodes, selectedDrainageNodeId]);

  const selectedFacility = useMemo(() => {
    return activeSimulation.facilities.find((f) => f.id === selectedFacilityId) || null;
  }, [activeSimulation.facilities, selectedFacilityId]);

  // Automatically enable relevant layer when switching to a specialized tab
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'routing') {
      setLayers((prev) => ({ ...prev, showSafeRoute: true }));
    } else if (tab === 'facilities') {
      setLayers((prev) => ({ ...prev, showFacilities: true }));
    } else if (tab === 'drainage') {
      setLayers((prev) => ({ ...prev, showDrainagePipes: true, showDrainageNodes: true }));
    }
  };

  // Nowcast Animation Timer (T+0 -> T+180)
  useEffect(() => {
    if (!isPlaying) return;

    const timeSteps = [0, 30, 60, 90, 120, 180];
    const timer = setInterval(() => {
      setTimeOffsetMin((prev) => {
        const currIdx = timeSteps.indexOf(prev);
        if (currIdx === -1 || currIdx === timeSteps.length - 1) {
          return timeSteps[0];
        }
        return timeSteps[currIdx + 1];
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectRoad = (road: RoadSegment) => {
    setSelectedRoadId(road.id);
    setSelectedDrainageNodeId(null);
    setSelectedFacilityId(null);
    if (activeTab !== 'map' && activeTab !== 'routing' && activeTab !== 'whatif') {
      setActiveTab('map');
    }
  };

  const handleSelectDrainageNode = (node: DrainageNode) => {
    setSelectedDrainageNodeId(node.id);
    setSelectedRoadId(null);
    setSelectedFacilityId(null);
  };

  const handleSelectFacility = (facility: CriticalFacility) => {
    setSelectedFacilityId(facility.id);
    const nearestRoad = activeSimulation.roads.find((r) => r.id === facility.nearestRoadId);
    if (nearestRoad) setSelectedRoadId(nearestRoad.id);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <TopBar
        currentScenario={currentScenario}
        onSelectScenario={(sc) => {
          setCurrentScenario(sc);
          if (sc.id === 'emergency_response_demo') {
            handleSelectTab('routing');
          }
        }}
        timeOffsetMin={timeOffsetMin}
        onTimeChange={(t) => setTimeOffsetMin(t)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        rainfallIntensity={activeSimulation.rainfallIntensityMmHr}
        cumulativeRainfall={activeSimulation.cumulativeRainfallMm}
        activeAlertsCount={activeSimulation.activeAlertsCount}
        onOpenWhatIf={() => handleSelectTab('whatif')}
      />

      {/* Main 3-Section Container: Sidebar (Left) | Hero Map (Center) | Context Panel (Right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section: Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          activeAlertsCount={activeSimulation.activeAlertsCount}
          criticalDrainsCount={activeSimulation.criticalDrainageNodesCount}
        />

        {/* Center / Right Content Workspace */}
        <main className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
          {/* Top Primary 4 KPIs */}
          <KpiMetrics simulation={activeSimulation} />

          {/* Interactive Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            {/* Center Section: Main Hero Map (Col 8) + Hydrograph Below */}
            <div
              className={`h-full min-h-[380px] flex flex-col gap-2.5 transition-all ${
                activeTab === 'transparency' ? 'lg:col-span-5' : 'lg:col-span-8'
              }`}
            >
              <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                <FloodMap
                  roads={activeSimulation.roads}
                  drainageNodes={activeSimulation.drainageNodes}
                  drainageEdges={activeSimulation.drainageEdges}
                  facilities={activeSimulation.facilities}
                  demCells={demCells}
                  selectedRoad={selectedRoad}
                  selectedDrainageNode={selectedDrainageNode}
                  selectedFacility={selectedFacility}
                  onSelectRoad={handleSelectRoad}
                  onSelectDrainageNode={handleSelectDrainageNode}
                  onSelectFacility={handleSelectFacility}
                  layers={layers}
                  onToggleLayer={toggleLayer}
                  routeOptions={routeOptions}
                />
              </div>

              {/* Bottom Hydrograph Forecast */}
              <HydrographChart
                scenario={currentScenario}
                currentTimeOffset={timeOffsetMin}
                rainfallMultiplier={whatIfParams.rainfallMultiplier}
              />
            </div>

            {/* Right Section: Selected Location / Alert Information (Col 4) */}
            <div
              className={`h-full flex flex-col transition-all overflow-hidden ${
                activeTab === 'transparency' ? 'lg:col-span-7' : 'lg:col-span-4'
              }`}
            >
              {activeTab === 'map' && (
                <>
                  {selectedDrainageNode ? (
                    <DrainageDetailPanel
                      node={selectedDrainageNode}
                      edges={activeSimulation.drainageEdges}
                      onClose={() => setSelectedDrainageNodeId(null)}
                    />
                  ) : selectedRoad ? (
                    <RoadDetailPanel
                      road={selectedRoad}
                      connectedNode={connectedDrainageNode}
                      onClose={() => setSelectedRoadId(null)}
                      onSelectNode={(n) => setSelectedDrainageNodeId(n.id)}
                    />
                  ) : (
                    /* Clean Fallback State when no road is clicked */
                    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3 text-xs text-slate-700">
                      <div className="border-b border-slate-100 pb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Monitoring Status
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                          Zone Overview & Key Alerts
                        </h2>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Select a Location on the Map</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Click any colored road segment or drainage node to inspect water depth and traffic diversion advisories.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                          Priority Attention Hotspots
                        </div>
                        {activeSimulation.alerts.slice(0, 2).map((alert) => (
                          <div
                            key={alert.id}
                            onClick={() => {
                              const match = activeSimulation.roads.find((r) => r.name === alert.locationName);
                              if (match) handleSelectRoad(match);
                            }}
                            className="p-2.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                {alert.waterDepthCm} cm
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">{alert.recommendedAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'drainage' && (
                <DrainageDetailPanel
                  node={
                    selectedDrainageNode ||
                    activeSimulation.drainageNodes.find((n) => n.status === 'CRITICAL_SURCHARGE') ||
                    activeSimulation.drainageNodes[0]
                  }
                  edges={activeSimulation.drainageEdges}
                  onClose={() => setSelectedDrainageNodeId(null)}
                />
              )}

              {activeTab === 'routing' && (
                <RoutingPanel
                  roads={activeSimulation.roads}
                  onRouteCalculated={(routes) => setRouteOptions(routes)}
                />
              )}

              {activeTab === 'whatif' && (
                <WhatIfSimulator
                  parameters={whatIfParams}
                  onUpdateParameters={(p) => setWhatIfParams(p)}
                  baselineSimulation={baselineSimulation}
                  simulatedResult={activeSimulation}
                />
              )}

              {activeTab === 'facilities' && (
                <CriticalInfrastructure
                  facilities={activeSimulation.facilities}
                  onSelectFacility={handleSelectFacility}
                />
              )}

              {activeTab === 'alerts' && <AlertsPanel alerts={activeSimulation.alerts} />}

              {activeTab === 'transparency' && <ModelTransparency />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

