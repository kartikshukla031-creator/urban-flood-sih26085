'use client';

import React from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Waves,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { RoadSegment, DrainageNode } from '../../types/flood';
import {
  BarChart,
  Bar,
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
  if (!road) return null;

  const attr = road.factorAttribution;
  const factorData = [
    { name: 'Rainfall', value: attr.heavyRainfallPct, fill: '#38bdf8' },
    { name: 'Drain Load', value: attr.drainageOverloadPct, fill: '#818cf8' },
    { name: 'Low Elev.', value: attr.lowElevationPct, fill: '#f59e0b' },
    { name: 'Impervious', value: attr.highImperviousnessPct, fill: '#10b981' },
    { name: 'Blockage', value: attr.pipeBlockagePct, fill: '#ef4444' },
  ];

  // 0-3h Depth Trend Data
  const depthTrendData = Object.entries(road.predictedDepthCm).map(([t, depth]) => ({
    time: t === '0' ? 'NOW' : `+${t}m`,
    depthCm: depth,
  }));

  const riskBadgeColor =
    road.riskLevel === 'SEVERE'
      ? 'bg-rose-950/90 text-rose-300 border-rose-700'
      : road.riskLevel === 'HIGH'
      ? 'bg-amber-950/90 text-amber-300 border-amber-700'
      : road.riskLevel === 'MODERATE'
      ? 'bg-yellow-950/90 text-yellow-300 border-yellow-700'
      : 'bg-emerald-950/90 text-emerald-300 border-emerald-700';

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px] uppercase">{road.roadType} corridor</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${riskBadgeColor}`}>
              {road.riskLevel} RISK
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-0.5">{road.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Street Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Waves className="w-3 h-3 text-cyan-400" />
            Current Depth
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
            {road.currentDepthCm} <span className="text-xs font-normal text-slate-400">cm</span>
          </div>
          <div className="text-[10px] text-slate-400">Max Forecast: {road.maxPredictedDepthCm} cm</div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            Flood Probability
          </div>
          <div className="text-lg font-bold font-mono text-indigo-300 mt-0.5">
            {road.floodProbabilityPct}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">Confidence: {road.confidence}</div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Flood Onset ETA
          </div>
          <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
            {road.floodOnsetEtaMin === null
              ? 'No Imminent Risk'
              : road.floodOnsetEtaMin === 0
              ? 'ACTIVE NOW (>15cm)'
              : `in ${road.floodOnsetEtaMin} min`}
          </div>
          <div className="text-[10px] text-slate-400">Critical 15cm threshold</div>
        </div>

        <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" />
            Micro-Elevation
          </div>
          <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
            {road.minElevationM} <span className="text-xs font-normal text-slate-400">m MSL</span>
          </div>
          <div className="text-[10px] text-slate-400">Slope: {road.slopePercent}%</div>
        </div>
      </div>

      {/* 0-3h Water Depth Trend Line */}
      <div className="bg-[#09101f] p-2.5 rounded-lg border border-slate-800">
        <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>0–3h Nowcast Water Depth Profile</span>
          <span className="text-[10px] text-cyan-400 font-mono">Depth (cm)</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={depthTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090f1d',
                  borderColor: '#1e293b',
                  fontSize: '10px',
                }}
              />
              <Line
                type="monotone"
                dataKey="depthCm"
                name="Depth (cm)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38bdf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connected Drainage Node Link */}
      {connectedNode && (
        <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Catchment Drain Node</div>
            <div className="text-xs font-bold text-cyan-400 font-mono">{connectedNode.name}</div>
            <div className="text-[10px] text-slate-300">
              Load: {connectedNode.loadPercentage}% | Surcharge: {connectedNode.surchargeRateLps} L/s
            </div>
          </div>
          <button
            onClick={() => onSelectNode(connectedNode)}
            className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] px-2.5 py-1 rounded font-medium transition"
          >
            Inspect Drain
          </button>
        </div>
      )}

      {/* Explainable Factor Attribution Breakdown */}
      <div className="bg-[#09101f] p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Why is this road at risk? (Factor Attribution)</span>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            SHAP / Hydro Matrix
          </span>
        </div>

        <div className="text-[11px] text-cyan-300/90 font-medium mb-2 italic">
          "{attr.summaryExplanation}"
        </div>

        {/* Feature contribution horizontal bars */}
        <div className="space-y-1.5">
          {factorData.map((f, i) => (
            <div key={i} className="text-[10px]">
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>{f.name}</span>
                <span className="font-mono font-bold text-slate-300">{f.value}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${f.value}%`, backgroundColor: f.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Municipal Action */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-cyan-900/60 rounded-lg p-2.5">
        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 font-mono mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Model Decision Support Directive
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {road.recommendedAction}
        </p>
      </div>
    </div>
  );
};
