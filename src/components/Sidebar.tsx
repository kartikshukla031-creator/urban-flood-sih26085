'use client';

import React from 'react';
import {
  MapPin,
  GitGraph,
  Navigation,
  Sliders,
  Building2,
  BellRing,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

export type ActiveTab = 'map' | 'drainage' | 'routing' | 'whatif' | 'facilities' | 'alerts' | 'transparency';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeAlertsCount: number;
  criticalDrainsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertsCount,
  criticalDrainsCount,
}) => {
  const menuItems = [
    {
      id: 'map' as ActiveTab,
      label: '0–3h Flood Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'drainage' as ActiveTab,
      label: 'Drainage Hydraulics',
      icon: GitGraph,
      badge: criticalDrainsCount > 0 ? `${criticalDrainsCount} Overload` : null,
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    },
    {
      id: 'routing' as ActiveTab,
      label: 'Flood-Safe Routing',
      icon: Navigation,
      badge: 'Emergency',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      id: 'whatif' as ActiveTab,
      label: 'What-If Digital Twin',
      icon: Sliders,
      badge: 'Simulator',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'facilities' as ActiveTab,
      label: 'Critical Infrastructure',
      icon: Building2,
      badge: null,
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Active Alerts',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
      badgeColor: 'bg-rose-900/70 text-rose-200 border-rose-700',
    },
    {
      id: 'transparency' as ActiveTab,
      label: 'Data & Model Science',
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#0c1427] border-r border-[#1e293b] flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono">
          Command Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/40 text-cyan-200 border border-cyan-700/50 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151f38]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Municipal EOC Diagnostic Card */}
      <div className="bg-[#09101f] border border-slate-800/80 rounded-lg p-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-mono text-[10px] uppercase">Model Fidelity</span>
          <span className="text-emerald-400 font-semibold font-mono">HIGH (2D Flux)</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full w-full animate-pulse" />
        </div>
        <div className="text-[10px] text-slate-500 leading-tight">
          Coupled DEM Micro-topography + Rational Runoff + Manning Stormwater Graph.
        </div>
      </div>
    </aside>
  );
};
