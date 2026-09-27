'use client';

import React, { useState } from 'react';
import {
  X,
  Gauge,
  Droplet,
  Wrench,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  GitGraph,
  Layers,
} from 'lucide-react';
import { DrainageNode, DrainageEdge } from '../../types/flood';

interface DrainageDetailPanelProps {
  node: DrainageNode | null;
  edges: DrainageEdge[];
  onClose: () => void;
}

export const DrainageDetailPanel: React.FC<DrainageDetailPanelProps> = ({
  node,
  edges,
  onClose,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!node) return null;

  const connectedEdges = edges.filter(
    (e) => e.startNodeId === node.id || e.endNodeId === node.id
  );

  const isCritical = node.status === 'CRITICAL_SURCHARGE' || node.status === 'OVERLOADED';
  const statusLabel =
    node.status === 'CRITICAL_SURCHARGE'
      ? 'Critical'
      : node.status === 'OVERLOADED'
      ? 'Overloaded'
      : node.status === 'ELEVATED'
      ? 'Elevated'
      : 'Normal';

  const statusBadgeStyle =
    node.status === 'CRITICAL_SURCHARGE'
      ? 'bg-red-50 text-red-700 border-red-200'
      : node.status === 'OVERLOADED'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : node.status === 'ELEVATED'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  const recommendedAction =
    node.status === 'CRITICAL_SURCHARGE'
      ? 'Inspect / Clear Drain & Deploy Dewatering Pump'
      : node.blockagePercentage >= 25
      ? 'Inspect / Clear Silt Blockage'
      : node.status === 'OVERLOADED'
      ? 'Monitor Hydraulic Pressure / Divert Flow'
      : 'Routine Maintenance / Standby';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Drainage Status
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded transition"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary 4-field Summary Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            Status
          </div>
          <div className="mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusBadgeStyle}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-blue-600" />
            Current Flow
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {node.totalLoadLps} <span className="text-xs font-normal text-slate-500">L/s</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium">
            Available Capacity
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {node.effectiveCapacityLps} <span className="text-xs font-normal text-slate-500">L/s</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            Blockage
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {node.blockagePercentage}%
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-md p-2.5">
        <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">
          Action Directive
        </div>
        <p className="text-xs text-slate-800 font-medium">
          {recommendedAction}
        </p>
      </div>

      {/* Expandable Technical Details Button */}
      <button
        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
      >
        <span>Technical Details</span>
        {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Technical Details Expanded */}
      {showTechnicalDetails && (
        <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
          {/* Water Flow Balance (formerly Hydraulic Inflow Mass Balance) */}
          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Water Flow Balance</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Surface Runoff:</span>
              <span className="font-semibold text-slate-800">+{node.currentInflowLps} L/s</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Upstream Conduit Feed:</span>
              <span className="font-semibold text-slate-800">+{node.upstreamFlowLps} L/s</span>
            </div>
            <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-1 font-medium">
              <span>Total Water Load:</span>
              <span className="font-bold text-slate-900">{node.totalLoadLps} L/s</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Effective Discharge Capacity:</span>
              <span className="font-semibold text-emerald-700">-{node.effectiveCapacityLps} L/s</span>
            </div>
            {node.surchargeRateLps > 0 && (
              <div className="flex justify-between text-red-700 font-bold border-t border-slate-200 pt-1">
                <span>Drainage Overload (Surcharge):</span>
                <span>+{node.surchargeRateLps} L/s</span>
              </div>
            )}
          </div>

          {/* Connected Conduits */}
          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1.5">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <GitGraph className="w-3.5 h-3.5 text-blue-600" />
              <span>Connected Conduits ({connectedEdges.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {connectedEdges.map((e) => (
                <div key={e.id} className="bg-white p-1.5 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{e.name}</div>
                    <div className="text-slate-500 text-[10px]">
                      Diameter: {e.diameterM}m | Slope: {e.slope} | Silt: {e.blockagePercentage}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={e.utilizationPercentage >= 95 ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}>
                      {e.currentFlowLps} / {e.effectiveCapacityLps} L/s
                    </div>
                    <div className="text-[10px] text-slate-500">{e.utilizationPercentage}% Capacity</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

