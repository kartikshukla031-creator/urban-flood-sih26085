'use client';

import React from 'react';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  Cpu,
  Binary,
  Layers,
  FileCode,
} from 'lucide-react';

export const ModelTransparency: React.FC = () => {
  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-4 shadow-2xl space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto text-xs text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100">Data Provenance & Scientific Methodology</h2>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
          SIH26085 COMPLIANCE
        </span>
      </div>

      {/* Scientific Transparency Notice */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 space-y-1.5 text-amber-200">
        <div className="flex items-center gap-2 font-bold text-xs">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>Scientific Disclaimer & Dataset Declaration</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-300/90">
          <strong>Demonstration Dataset:</strong> High-fidelity synthetic urban catchment dataset (~3.5 km²) modeled after the Koramangala-Indiranagar drainage basin archetype. Designed to realistically reproduce 2D surface water accumulation, Manning pipe flows, and surcharge backflows.
        </p>
        <div className="flex items-center gap-3 text-[10px] font-mono text-amber-400 pt-1">
          <span>DATA MODE: SIMULATION PROTOTYPE</span>
          <span>•</span>
          <span>OUTPUT: MODEL ESTIMATE</span>
        </div>
      </div>

      {/* Physical Formulations */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hydrodynamic Physics Formulations</span>
        </h3>

        {/* 1. Rational Runoff */}
        <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-400 font-mono text-[11px]">
            1. Urban Surface Hydrology (Rational Method)
          </div>
          <div className="bg-[#080d1a] p-2 rounded font-mono text-slate-200 text-[11px] my-1 border border-slate-800">
            Q_runoff (L/s) = [C &times; I (mm/hr) &times; A (m²)] / 3.6
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Where <em>C</em> is composite runoff coefficient (Roads: 0.90, Commercial: 0.92, Residential: 0.75, Parks: 0.25). <em>I(t)</em> is time-varying nowcast intensity.
          </p>
        </div>

        {/* 2. Manning's Pipe Flow */}
        <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-indigo-400 font-mono text-[11px]">
            2. Gravity Pipe Flow Hydraulics (Manning's Equation)
          </div>
          <div className="bg-[#080d1a] p-2 rounded font-mono text-slate-200 text-[11px] my-1 border border-slate-800">
            Q_nominal = (1/n) &times; A &times; R^(2/3) &times; S^(1/2)
            <br />
            Q_effective = Q_nominal &times; (1 - Blockage/100)^1.5
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Where <em>n=0.015</em> is Manning roughness for concrete pipes, <em>D</em> is diameter (0.8m to 2.0m), and <em>S</em> is pipe slope. Effective capacity incorporates non-linear reduction from debris constriction.
          </p>
        </div>

        {/* 3. Node Mass Balance & Surcharge */}
        <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-rose-400 font-mono text-[11px]">
            3. Node Mass Balance & Surface Surcharge Overflow
          </div>
          <div className="bg-[#080d1a] p-2 rounded font-mono text-slate-200 text-[11px] my-1 border border-slate-800">
            Surcharge (L/s) = max(0, Q_inflow + &Sigma;Q_upstream - &Sigma;Q_effective_out)
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            When total inflow exceeds pipe discharge capacity, excess volume erupts as surcharge backflow onto connected street depressions.
          </p>
        </div>

        {/* 4. Dijkstra Routing */}
        <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="font-bold text-emerald-400 font-mono text-[11px]">
            4. Dynamic Flood-Aware Dijkstra Cost Function
          </div>
          <div className="bg-[#080d1a] p-2 rounded font-mono text-slate-200 text-[11px] my-1 border border-slate-800">
            Cost(e) = Length(e) &times; [ 1 + &alpha; &times; (Depth / Clearance)^2.2 + &beta; &times; RiskScore ]
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Penalizes traversal costs non-linearly when water depth approaches or exceeds vehicle clearance limits (e.g. Ambulance &le;18cm, Fire Truck &le;45cm).
          </p>
        </div>
      </div>
    </div>
  );
};
