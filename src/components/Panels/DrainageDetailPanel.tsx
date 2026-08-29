'use client';

import React from 'react';
import {
  X,
  GitGraph,
  Gauge,
  AlertOctagon,
  Wrench,
  Layers,
  Droplet,
  Compass,
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
  if (!node) return null;

  const connectedEdges = edges.filter(
    (e) => e.startNodeId === node.id || e.endNodeId === node.id
  );

  const statusColor =
    node.status === 'CRITICAL_SURCHARGE'
      ? 'bg-rose-950/90 text-rose-300 border-rose-700'
      : node.status === 'OVERLOADED'
      ? 'bg-orange-950/90 text-orange-300 border-orange-700'
      : node.status === 'ELEVATED'
      ? 'bg-yellow-950/90 text-yellow-300 border-yellow-700'
      : 'bg-emerald-950/90 text-emerald-300 border-emerald-700';

  const vulnColor =
    node.vulnerabilityScore === 'CRITICAL'
      ? 'text-rose-400 font-bold'
      : node.vulnerabilityScore === 'HIGH'
      ? 'text-amber-400 font-bold'
      : 'text-emerald-400';

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px] uppercase">Stormwater Node / Inlet</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColor}`}>
              {node.status}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-0.5">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hydraulic Capacity & Load Diagnostics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            Total Flow Load
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
            {node.totalLoadLps} <span className="text-xs font-normal text-slate-400">L/s</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Capacity Load: <span className="font-bold text-slate-200">{node.loadPercentage}%</span>
          </div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Droplet className="w-3 h-3 text-blue-400" />
            Effective Discharge
          </div>
          <div className="text-lg font-bold font-mono text-blue-300 mt-0.5">
            {node.effectiveCapacityLps} <span className="text-xs font-normal text-slate-400">L/s</span>
          </div>
          <div className="text-[10px] text-slate-400">Nominal: {node.nominalCapacityLps} L/s</div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            Surcharge Rate
          </div>
          <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
            {node.surchargeRateLps > 0 ? `+${node.surchargeRateLps} L/s (Overflow)` : '0 L/s (No Spill)'}
          </div>
          <div className="text-[10px] text-slate-400">Surface Backflow</div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-400" />
            Silt / Debris Blockage
          </div>
          <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
            {node.blockagePercentage}% Blocked
          </div>
          <div className="text-[10px] text-slate-400">Constriction Factor: {Math.round(Math.pow(1 - node.blockagePercentage/100, 1.5)*100)}%</div>
        </div>
      </div>

      {/* Hydraulic Inflow Breakdown */}
      <div className="bg-[#09101f] p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="text-[11px] font-bold text-slate-200 uppercase font-sans mb-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hydraulic Inflow Mass Balance</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Catchment Surface Runoff:</span>
          <span className="text-cyan-300 font-bold">+{node.currentInflowLps} L/s</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Upstream Pipe Feed:</span>
          <span className="text-indigo-300 font-bold">+{node.upstreamFlowLps} L/s</span>
        </div>
        <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
          <span>Total Hydraulic Inflow:</span>
          <span className="text-slate-100 font-bold">{node.totalLoadLps} L/s</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Max Available Discharge:</span>
          <span className="text-emerald-300 font-bold">-{node.effectiveCapacityLps} L/s</span>
        </div>
      </div>

      {/* Vulnerability & Maintenance Recommendation */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 rounded-lg p-2.5 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Vulnerability Rating</span>
          <span className={`font-mono text-xs uppercase ${vulnColor}`}>{node.vulnerabilityScore}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Maintenance Priority</span>
          <span className="text-cyan-300 font-bold font-mono text-xs uppercase">{node.maintenancePriority}</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight pt-1">
          {node.status === 'CRITICAL_SURCHARGE'
            ? 'Emergency de-silting and mobile trash-pump deployment recommended to clear backflow.'
            : node.blockagePercentage >= 30
            ? 'Scheduled municipal drain desilting required before next high-precipitation event.'
            : 'Operational within safe design thresholds.'}
        </div>
      </div>

      {/* Connected Pipe Network Edges */}
      <div className="bg-[#09101f] p-2.5 rounded-lg border border-slate-800 space-y-2">
        <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1 font-sans">
          <GitGraph className="w-3.5 h-3.5 text-cyan-400" />
          <span>Connected Stormwater Conduits ({connectedEdges.length})</span>
        </div>
        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {connectedEdges.map((e) => (
            <div key={e.id} className="bg-[#0f172a] p-1.5 rounded border border-slate-800 text-[10px] flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{e.name}</div>
                <div className="text-slate-400 font-mono">
                  D: {e.diameterM}m | Slope: {e.slope} | Blockage: {e.blockagePercentage}%
                </div>
              </div>
              <div className="text-right font-mono">
                <div className={e.utilizationPercentage >= 95 ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                  {e.currentFlowLps} / {e.effectiveCapacityLps} L/s
                </div>
                <div className="text-[9px] text-slate-400">{e.utilizationPercentage}% Cap</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
