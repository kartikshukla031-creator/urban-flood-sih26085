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
}) => {
  const menuItems = [
    {
      id: 'map' as ActiveTab,
      label: 'Flood Map',
      icon: MapPin,
    },
    {
      id: 'drainage' as ActiveTab,
      label: 'Drainage',
      icon: GitGraph,
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Alerts',
      icon: BellRing,
      alertCount: activeAlertsCount,
    },
    {
      id: 'facilities' as ActiveTab,
      label: 'Critical Infrastructure',
      icon: Building2,
    },
    {
      id: 'routing' as ActiveTab,
      label: 'Safe Routing',
      icon: Navigation,
    },
    {
      id: 'whatif' as ActiveTab,
      label: 'What-If Simulation',
      icon: Sliders,
    },
    {
      id: 'transparency' as ActiveTab,
      label: 'Data & Model',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.alertCount !== undefined && item.alertCount > 0 && (
                <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                  {item.alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Model Information Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2 text-xs">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Model Information
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div>
            <div className="text-slate-400 text-[10px]">Hydrology</div>
            <div className="font-medium text-slate-700">Rational Runoff</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Terrain</div>
            <div className="font-medium text-slate-700">DEM / Elevation</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Drainage</div>
            <div className="font-medium text-slate-700">Manning-based Hydraulic Model</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Routing</div>
            <div className="font-medium text-slate-700">Flood-aware shortest path</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

