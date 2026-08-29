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

  // Map Layer Toggles
  const [layers, setLayers] = useState<MapLayerState>({
    showRoads: true,
    showDrainagePipes: true,
    showDrainageNodes: true,
    showFacilities: true,
    showDEMContours: true,
    showSafeRoute: true,
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
    <div className="flex flex-col h-screen bg-[#070c17] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <TopBar
        currentScenario={currentScenario}
        onSelectScenario={(sc) => {
          setCurrentScenario(sc);
          // If selecting emergency demo, auto switch to routing tab
          if (sc.id === 'emergency_response_demo') {
            setActiveTab('routing');
          }
        }}
        timeOffsetMin={timeOffsetMin}
        onTimeChange={(t) => setTimeOffsetMin(t)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        rainfallIntensity={activeSimulation.rainfallIntensityMmHr}
        cumulativeRainfall={activeSimulation.cumulativeRainfallMm}
        activeAlertsCount={activeSimulation.activeAlertsCount}
        onOpenWhatIf={() => setActiveTab('whatif')}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          activeAlertsCount={activeSimulation.activeAlertsCount}
          criticalDrainsCount={activeSimulation.criticalDrainageNodesCount}
        />

        {/* Center / Right Content Area */}
        <main className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
          {/* Top KPI Metrics Bar */}
          <KpiMetrics simulation={activeSimulation} />

          {/* Core Interactive Workspace (Map + Side Panel) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            {/* GIS Center Map (Col 7 or 8) */}
            <div
              className={`h-full min-h-[380px] flex flex-col gap-2 transition-all ${
                activeTab === 'transparency' ? 'lg:col-span-4' : 'lg:col-span-7 xl:col-span-8'
              }`}
            >
              <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-800">
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

              {/* Bottom Hydrograph Profile */}
              <HydrographChart
                scenario={currentScenario}
                currentTimeOffset={timeOffsetMin}
                rainfallMultiplier={whatIfParams.rainfallMultiplier}
              />
            </div>

            {/* Right Actionable Intelligence Panel (Col 4 or 5) */}
            <div
              className={`h-full flex flex-col transition-all overflow-hidden ${
                activeTab === 'transparency' ? 'lg:col-span-8' : 'lg:col-span-5 xl:col-span-4'
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
                  ) : (
                    <RoadDetailPanel
                      road={selectedRoad}
                      connectedNode={connectedDrainageNode}
                      onClose={() => setSelectedRoadId(null)}
                      onSelectNode={(n) => setSelectedDrainageNodeId(n.id)}
                    />
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
