import React from 'react';
import {
  LayoutDashboard,
  Map,
  CloudRain,
  Network,
  Navigation,
  BellRing,
  FileText,
  History,
  Settings,
  PhoneCall,
  Activity,
  CheckCircle2,
  ChevronLeft,
  X
} from 'lucide-react';

export type NavTabId =
  | 'overview'
  | 'map'
  | 'rainfall'
  | 'drainage'
  | 'routes'
  | 'alerts'
  | 'citizen'
  | 'historical'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  alertCount: number;
  reportCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  // Backward compatibility
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  alertCount,
  reportCount,
  isOpen,
  onClose,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  // Determine effective open state
  const effectiveOpen = isOpen !== undefined ? isOpen : (isMobileOpen || !isCollapsed);
  const handleClose = onClose || onCloseMobile || onToggleCollapse;

  const navItems: { id: NavTabId; label: string; simpleDesc: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Home Summary', simpleDesc: 'Overall city flood situation', icon: LayoutDashboard },
    { id: 'map', label: 'Live Flood Map', simpleDesc: 'Streets, depths & arrival times', icon: Map },
    { id: 'rainfall', label: 'Rainfall Forecast', simpleDesc: 'Next 0 to 3 hours rain rate', icon: CloudRain },
    { id: 'drainage', label: 'City Drains & Pumps', simpleDesc: 'Holding tanks & blockage tests', icon: Network },
    { id: 'routes', label: 'Safe Route Finder', simpleDesc: 'Avoid submerged roads & subways', icon: Navigation },
    { id: 'alerts', label: 'Public Alerts', simpleDesc: 'Official municipal warnings', icon: BellRing, badge: alertCount, badgeColor: 'bg-red-600 text-white' },
    { id: 'citizen', label: 'Report Flooding', simpleDesc: 'Citizen reports & photos', icon: FileText, badge: reportCount, badgeColor: 'bg-blue-100 text-blue-800 border border-blue-300' },
    { id: 'historical', label: 'Past Floods Data', simpleDesc: '2005 & 2017 cloudburst logs', icon: History },
    { id: 'settings', label: 'Settings & Help', simpleDesc: 'Thresholds & emergency guidelines', icon: Settings }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {effectiveOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs animate-fadeIn"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out md:static shadow-xs h-full shrink-0
          ${effectiveOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:-ml-64 pointer-events-none md:pointer-events-none'}
        `}
      >
        {/* Navigation Links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-blue-950 font-extrabold tracking-wide">Control Room Modules</span>
            {handleClose && (
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title="Collapse Left Bar"
                aria-label="Collapse Left Bar"
              >
                <ChevronLeft className="w-4 h-4 hidden md:block" />
                <X className="w-4 h-4 md:hidden" />
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 768 && handleClose) {
                    handleClose();
                  }
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer
                  ${isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-l-blue-700 font-bold shadow-xs'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.simpleDesc}</div>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      {/* Citizen Emergency Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mb-1">
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Emergency Contacts</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-0.5">
            <div>MoES / NDMA Helpline: <strong className="text-slate-900 font-mono">1070 / 1916</strong></div>
            <div>Police / Ambulance: <strong className="text-slate-900 font-mono">112</strong></div>
            <div>Fire Brigade: <strong className="text-slate-900 font-mono">101</strong></div>
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 font-medium">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Doppler Radar Active
          </span>
          <span className="text-emerald-700 font-bold">Online</span>
        </div>
      </div>
    </aside>
    </>
  );
};
