'use client';

import React from 'react';
import {
  BellRing,
  AlertTriangle,
  Waves,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { FloodAlert } from '../../types/flood';

interface AlertsPanelProps {
  alerts: FloodAlert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Active Flood Alerts
          </h2>
        </div>
        <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">
          {alerts.length} Active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2 opacity-80" />
          <div className="font-semibold text-slate-700">No active flood alerts.</div>
          <div className="text-slate-400 mt-0.5">Water levels are within normal drainage capacity.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'EMERGENCY' || alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-md border ${
                  isCritical
                    ? 'border-red-200 bg-red-50/40'
                    : 'border-amber-200 bg-amber-50/40'
                } space-y-2`}
              >
                {/* Severity & Location */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{isCritical ? '🔴' : '🟠'}</span>
                    <span className={`text-xs font-bold uppercase ${isCritical ? 'text-red-700' : 'text-amber-800'}`}>
                      {isCritical ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    ETA: <strong className="text-slate-700">{alert.timeHorizonMin === 0 ? 'Now' : `+${alert.timeHorizonMin} min`}</strong>
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {alert.title}
                </div>

                <div className="text-xs text-slate-700 flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Water Depth: <strong className="text-slate-900">{alert.waterDepthCm} cm</strong></span>
                </div>

                {/* Action */}
                <div className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 font-medium leading-relaxed">
                  <strong className="text-slate-900 font-semibold">Action: </strong>
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

