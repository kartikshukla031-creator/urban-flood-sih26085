'use client';

import React from 'react';
import {
  Building2,
  Hospital,
  Flame,
  Shield,
  Train,
  GraduationCap,
  Tent,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { CriticalFacility } from '../../types/flood';

interface CriticalInfrastructureProps {
  facilities: CriticalFacility[];
  onSelectFacility: (facility: CriticalFacility) => void;
}

export const CriticalInfrastructure: React.FC<CriticalInfrastructureProps> = ({
  facilities,
  onSelectFacility,
}) => {
  const getFacilityIcon = (type: CriticalFacility['type']) => {
    switch (type) {
      case 'HOSPITAL':
        return Hospital;
      case 'FIRE_STATION':
        return Flame;
      case 'POLICE_HQ':
        return Shield;
      case 'TRANSIT_HUB':
        return Train;
      case 'SCHOOL':
        return GraduationCap;
      case 'SHELTER':
        return Tent;
      default:
        return Building2;
    }
  };

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100">Critical Infrastructure Monitoring</h2>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Real-time access feasibility and inundation risk for emergency hubs, hospitals, and shelters.
        </p>
      </div>

      <div className="space-y-2">
        {facilities.map((fac) => {
          const Icon = getFacilityIcon(fac.type);
          const isCutOff = fac.accessStatus === 'CUT_OFF';
          const isMarginal = fac.accessStatus === 'MARGINAL';

          const cardBorder = isCutOff
            ? 'border-rose-700/80 bg-rose-950/20'
            : isMarginal
            ? 'border-amber-700/80 bg-amber-950/20'
            : 'border-slate-800/80 bg-[#0f172a]';

          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility(fac)}
              className={`p-3 rounded-lg border ${cardBorder} hover:border-cyan-600 transition cursor-pointer space-y-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isCutOff
                        ? 'bg-rose-900/60 text-rose-300'
                        : isMarginal
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-cyan-950 text-cyan-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{fac.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Elevation: {fac.elevationM}m MSL | Approach: {fac.nearestRoadId}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isCutOff
                      ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                      : isMarginal
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {isCutOff ? (
                    <XCircle className="w-2.5 h-2.5" />
                  ) : isMarginal ? (
                    <AlertTriangle className="w-2.5 h-2.5" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  )}
                  {fac.accessStatus}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 bg-[#080d1a]/80 p-2 rounded border border-slate-800/60 leading-relaxed">
                {fac.alertMessage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
