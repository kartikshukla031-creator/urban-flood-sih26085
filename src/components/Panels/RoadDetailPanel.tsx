'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Waves,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { RoadSegment, DrainageNode } from '../../types/flood';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface RoadDetailPanelProps {
  road: RoadSegment | null;
  connectedNode?: DrainageNode;
  onClose: () => void;
  onSelectNode: (node: DrainageNode) => void;
}

export const RoadDetailPanel: React.FC<RoadDetailPanelProps> = ({
  road,
  connectedNode,
  onClose,
  onSelectNode,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!road) return null;

  const attr = road.factorAttribution;
  const factorData = [
    { name: 'Rainfall', value: attr.heavyRainfallPct, fill: '#2563eb' },
    { name: 'Drainage Overload', value: attr.drainageOverloadPct, fill: '#4f46e5' },
    { name: 'Low Elevation', value: attr.lowElevationPct, fill: '#d97706' },
    { name: 'Impervious Surface', value: attr.highImperviousnessPct, fill: '#16a34a' },
    { name: 'Silt Blockage', value: attr.pipeBlockagePct, fill: '#dc2626' },
  ];

  const depthTrendData = Object.entries(road.predictedDepthCm).map(([t, depth]) => ({
    time: t === '0' ? 'Now' : `+${t}m`,
    depthCm: depth,
  }));

  const riskBadgeStyle =
    road.riskLevel === 'SEVERE'
      ? 'bg-red-50 text-red-700 border-red-200'
      : road.riskLevel === 'HIGH'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : road.riskLevel === 'MODERATE'
      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  const floodEtaLabel =
    road.floodOnsetEtaMin === null
      ? 'Safe'
      : road.floodOnsetEtaMin === 0
      ? 'Now'
      : `+${road.floodOnsetEtaMin} min`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Road Flood Risk
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{road.name}</h2>
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
            <Waves className="w-3.5 h-3.5 text-blue-600" />
            Water Depth
          </div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {road.currentDepthCm} <span className="text-xs font-normal text-slate-500">cm</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Risk Level
          </div>
          <div className="mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskBadgeStyle}`}>
              {road.riskLevel}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Flood ETA
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {floodEtaLabel}
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-medium">
            Probability
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {road.floodProbabilityPct}%
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-md p-2.5">
        <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
          Recommended Action
        </div>
        <p className="text-xs text-slate-800 font-medium leading-relaxed">
          {road.recommendedAction}
        </p>
      </div>

      {/* Expandable Technical Details Button */}
      <button
        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
      >
        <span>Technical Details & Forecast Trend</span>
        {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Technical Details */}
      {showTechnicalDetails && (
        <div className="space-y-3 pt-1 border-t border-slate-100">
          {/* 0-3h Trend */}
          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>0–3h Nowcast Water Depth Profile</span>
              <span className="text-[10px] text-slate-500">Depth (cm)</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depthTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      fontSize: '10px',
                      color: '#0f172a',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="depthCm"
                    name="Depth (cm)"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Connected Drain Node Link */}
          {connectedNode && (
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Catchment Drain Node</div>
                <div className="font-semibold text-slate-800">{connectedNode.name}</div>
                <div className="text-[10px] text-slate-500">
                  Load: {connectedNode.loadPercentage}% | Surcharge: {connectedNode.surchargeRateLps} L/s
                </div>
              </div>
              <button
                onClick={() => onSelectNode(connectedNode)}
                className="bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 text-xs px-2 py-1 rounded font-medium transition shadow-xs"
              >
                Inspect Drain
              </button>
            </div>
          )}

          {/* Factor Attribution */}
          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs">
            <div className="font-semibold text-slate-700 mb-1">Risk Factors (Attribution)</div>
            <p className="text-[11px] text-slate-600 italic mb-2">"{attr.summaryExplanation}"</p>
            <div className="space-y-1.5">
              {factorData.map((f, i) => (
                <div key={i} className="text-[10px]">
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>{f.name}</span>
                    <span className="font-semibold text-slate-800">{f.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${f.value}%`, backgroundColor: f.fill }}
                    />
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

