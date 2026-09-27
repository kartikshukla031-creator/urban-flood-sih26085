'use client';

import React from 'react';
import {
  BookOpen,
  Scale,
  Cpu,
  FileText,
} from 'lucide-react';

export const ModelTransparency: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto text-xs text-slate-700">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Data Provenance & Methodology
          </h2>
        </div>
        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
          SIH26085 Standard
        </span>
      </div>

      {/* Model Framework Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1.5 text-slate-700">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
          <Scale className="w-4 h-4 text-blue-600" />
          <span>Municipal Simulation Architecture</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          This system models urban stormwater drainage and surface runoff using established civil engineering formulations: the Rational Runoff method, Manning's gravity conduit equations, micro-topography DEM routing, and flood-aware shortest path routing.
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 font-medium">
          <span>Mode: Simulation & Nowcasting</span>
          <span>•</span>
          <span>Catchment Archetype: 3.5 km² Urban Sector</span>
        </div>
      </div>

      {/* Physical Formulations */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>Hydrologic & Hydraulic Formulations</span>
        </h3>

        {/* 1. Rational Runoff */}
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 text-xs">
            1. Surface Runoff (Rational Method)
          </div>
          <div className="bg-white p-2 rounded text-slate-900 text-xs my-1 border border-slate-200 font-mono">
            Q_runoff (L/s) = [C &times; I (mm/h) &times; A (m²)] / 3.6
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Where <em>C</em> is composite runoff coefficient (Roads: 0.90, Commercial: 0.92, Residential: 0.75, Parks: 0.25). <em>I(t)</em> is time-varying nowcast intensity.
          </p>
        </div>

        {/* 2. Manning's Pipe Flow */}
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 text-xs">
            2. Gravity Pipe Flow (Manning's Equation)
          </div>
          <div className="bg-white p-2 rounded text-slate-900 text-xs my-1 border border-slate-200 font-mono">
            Q_nominal = (1/n) &times; A &times; R^(2/3) &times; S^(1/2)
            <br />
            Q_effective = Q_nominal &times; (1 - Blockage/100)^1.5
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Where <em>n=0.015</em> is Manning roughness for concrete pipes, <em>D</em> is diameter (0.8m to 2.0m), and <em>S</em> is conduit slope.
          </p>
        </div>

        {/* 3. Node Mass Balance & Overload */}
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 text-xs">
            3. Node Water Flow Balance & Drainage Overload
          </div>
          <div className="bg-white p-2 rounded text-slate-900 text-xs my-1 border border-slate-200 font-mono">
            Overload (L/s) = max(0, Q_inflow + &Sigma;Q_upstream - &Sigma;Q_discharge)
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            When total inflow exceeds pipe discharge capacity, surplus water accumulates on connected road depressions.
          </p>
        </div>

        {/* 4. Shortest Path Routing */}
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 text-xs">
            4. Flood-Aware Shortest Path Routing
          </div>
          <div className="bg-white p-2 rounded text-slate-900 text-xs my-1 border border-slate-200 font-mono">
            Cost(segment) = Length &times; [ 1 + &alpha; &times; (Water Depth / Vehicle Clearance)^2.2 ]
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Penalizes traversed roads non-linearly when water depth approaches vehicle clearance limits.
          </p>
        </div>
      </div>
    </div>
  );
};

