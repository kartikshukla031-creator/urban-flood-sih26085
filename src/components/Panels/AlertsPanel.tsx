'use client';

import React from 'react';
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  Waves,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { FloodAlert } from '../../types/flood';

interface AlertsPanelProps {
  alerts: FloodAlert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-slate-100">Live Municipal Emergency Alerts</h2>
        </div>
        <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
          {alerts.length} ACTIVE
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
          <div>No critical flood hazards or drainage surcharges active.</div>
          <div className="text-[10px] text-slate-600 mt-1">System operational under normal parameters.</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert) => {
            const isEmergency = alert.severity === 'EMERGENCY' || alert.severity === 'CRITICAL';
            const badgeBg =
              alert.severity === 'EMERGENCY'
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : alert.severity === 'CRITICAL'
                ? 'bg-orange-950 text-orange-300 border-orange-700'
                : 'bg-amber-950 text-amber-300 border-amber-700';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  isEmergency ? 'border-rose-800/80 bg-rose-950/20' : 'border-slate-800 bg-[#0f172a]'
                } space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className={`w-4 h-4 shrink-0 ${isEmergency ? 'text-rose-400' : 'text-amber-400'}`} />
                    <h3 className="text-xs font-bold text-slate-200">{alert.title}</h3>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badgeBg}`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 bg-[#080d1a] p-1.5 rounded border border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <Waves className="w-3 h-3 text-cyan-400" />
                    <span>Depth: <strong className="text-cyan-300">{alert.waterDepthCm}cm</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>ETA: <strong className="text-amber-300">{alert.timeHorizonMin === 0 ? 'NOW' : `+${alert.timeHorizonMin}m`}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-indigo-300 font-bold">{alert.probabilityPct}% Prob</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-200 bg-slate-900/90 p-2 rounded border border-slate-800/80 leading-relaxed font-medium">
                  <span className="text-cyan-400 font-bold font-mono text-[10px] mr-1">ACTION DIRECTIVE:</span>
                  {alert.recommendedAction}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
