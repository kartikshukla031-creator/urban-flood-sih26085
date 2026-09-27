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
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto text-slate-800">
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Critical Infrastructure
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Accessibility status for essential municipal services.
        </p>
      </div>

      <div className="space-y-2">
        {facilities.map((fac) => {
          const Icon = getFacilityIcon(fac.type);
          const isCutOff = fac.accessStatus === 'CUT_OFF';
          const isMarginal = fac.accessStatus === 'MARGINAL';

          const statusText = isCutOff ? 'Access Affected' : isMarginal ? 'At Risk' : 'Accessible';

          const cardStyle = isCutOff
            ? 'border-red-200 bg-red-50/30'
            : isMarginal
            ? 'border-amber-200 bg-amber-50/30'
            : 'border-slate-200 bg-slate-50/60';

          const badgeStyle = isCutOff
            ? 'bg-red-50 text-red-700 border-red-200'
            : isMarginal
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200';

          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility(fac)}
              className={`p-3 rounded-md border ${cardStyle} hover:border-blue-400 transition cursor-pointer space-y-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 text-blue-600 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{fac.name}</h3>
                    <div className="text-[11px] text-slate-500">
                      Approach Road: <strong>{fac.nearestRoadId}</strong> • Depth: <strong>{fac.predictedDepthCm} cm</strong>
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${badgeStyle}`}>
                  {isCutOff ? (
                    <XCircle className="w-3 h-3 text-red-600" />
                  ) : isMarginal ? (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  )}
                  {statusText}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 font-medium">
                {fac.alertMessage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

