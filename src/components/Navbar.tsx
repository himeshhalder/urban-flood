import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Waves,
  AlertTriangle,
  Bell,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  RefreshCw,
  PhoneCall,
  ChevronDown,
  Volume2,
  VolumeX,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Network,
  CloudRain,
  BellRing,
  History,
  X,
  LayoutDashboard,
  Map,
  Navigation,
  FileText,
  Settings,
  ChevronRight,
  PanelLeft
} from 'lucide-react';
import { CityConfig, UserRole, AlertItem } from '../types';
import { SUPPORTED_CITIES } from '../data/mockData';
import { NavTabId } from './Sidebar';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  currentCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  selectedWard: string;
  onWardChange: (ward: string) => void;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  alerts: AlertItem[];
  onOpenAlerts: () => void;
  lastUpdated: string;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  officerInfo?: { name: string; email: string; role: string; department: string } | null;
  onOpenOfficialLogin: () => void;
  onSelectTab?: (tab: NavTabId) => void;
  activeTab?: NavTabId;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  reportCount?: number;
  isSimulatedData?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onCityChange,
  selectedWard,
  onWardChange,
  emergencyMode,
  onToggleEmergencyMode,
  userRole,
  onRoleChange,
  alerts,
  onOpenAlerts,
  lastUpdated,
  onRefreshData,
  isRefreshing,
  onBack,
  onLogout,
  officerInfo,
  onOpenOfficialLogin,
  onSelectTab,
  activeTab = 'overview',
  onToggleSidebar,
  isSidebarOpen = true,
  reportCount = 0,
  isSimulatedData
}) => {
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  // Positioning & refs for Portal-based dropdowns (so they strictly render ABOVE the map canvas/controls)
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [bellPos, setBellPos] = useState<{ top: number; right: number; maxWidth: number } | null>(null);

  const officerButtonRef = useRef<HTMLButtonElement>(null);
  const officerPanelRef = useRef<HTMLDivElement>(null);
  const [officerPos, setOfficerPos] = useState<{ top: number; right: number; maxWidth: number } | null>(null);

  const updateBellPos = useCallback(() => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const right = Math.max(12, viewportWidth - rect.right);
      const top = rect.bottom + 8;
      const maxWidth = Math.min(360, viewportWidth - 24);
      setBellPos({ top, right, maxWidth });
    }
  }, []);

  const updateOfficerPos = useCallback(() => {
    if (officerButtonRef.current) {
      const rect = officerButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const right = Math.max(12, viewportWidth - rect.right);
      const top = rect.bottom + 8;
      const maxWidth = Math.min(320, viewportWidth - 24);
      setOfficerPos({ top, right, maxWidth });
    }
  }, []);

  // Handle Notifications outside clicks, escape key, and viewport resize/scroll
  useEffect(() => {
    if (!showNotifications) return;
    updateBellPos();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        bellButtonRef.current && !bellButtonRef.current.contains(target) &&
        notificationPanelRef.current && !notificationPanelRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };

    const handleResizeOrScroll = () => {
      updateBellPos();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [showNotifications, updateBellPos]);

  // Handle Officer Menu outside clicks, escape key, and viewport resize/scroll
  useEffect(() => {
    if (!showOfficerMenu) return;
    updateOfficerPos();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        officerButtonRef.current && !officerButtonRef.current.contains(target) &&
        officerPanelRef.current && !officerPanelRef.current.contains(target)
      ) {
        setShowOfficerMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowOfficerMenu(false);
    };

    const handleResizeOrScroll = () => {
      updateOfficerPos();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [showOfficerMenu, updateOfficerPos]);

  const unreadAlerts = alerts.filter(a => a.status === 'new');
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const roleLabels: Record<UserRole, { label: string; desc: string }> = {
    citizen: { label: 'Public Citizen', desc: 'Read-only alerts & safe routes' },
    operator: { label: 'Ministry Control Room', desc: 'MoES national flood operations' },
    emergency_responder: { label: 'Emergency Services', desc: 'Police / Fire / Ambulance priority' },
    admin: { label: 'System Admin', desc: 'Full system management' },
    analyst: { label: 'Hydrologist Analyst', desc: 'Sensor & model calibration' }
  };

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[#0f284e] border-b border-blue-950 text-white shadow-md select-none">
      {/* Top National & Emergency Helpline Strip */}
      <div className="bg-[#08182f] px-4 py-1 flex items-center justify-between text-[11px] border-b border-blue-900/60">
        <div className="flex items-center gap-2">
          {/* Subtle tricolor badge */}
          <span className="flex h-2.5 w-4 rounded-xs overflow-hidden shadow-xs">
            <span className="bg-[#ff9933] w-1/3 h-full"></span>
            <span className="bg-[#ffffff] w-1/3 h-full"></span>
            <span className="bg-[#128807] w-1/3 h-full"></span>
          </span>
          <span className="font-semibold text-slate-200">
            {t('common.ministryTitle')}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Prominent Emergency Helpline */}
          <div className="hidden xs:flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 text-[10px] sm:text-[11px]">
            <PhoneCall className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{t('common.helpline')}</span>
          </div>

          {/* Language Selector (Always visible across all device sizes) */}
          <div className="flex items-center gap-1 text-slate-300 text-[11px] sm:text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                language === 'en' ? 'bg-blue-800 text-white font-bold shadow-xs' : 'hover:text-white'
              }`}
            >
              English
            </button>
            <span>|</span>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                language === 'mr' ? 'bg-blue-800 text-white font-bold shadow-xs' : 'hover:text-white'
              }`}
            >
              मराठी
            </button>
            <span>|</span>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                language === 'hi' ? 'bg-blue-800 text-white font-bold shadow-xs' : 'hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* High Emergency Warning Ribbon if toggled */}
      {emergencyMode && (
        <div className="bg-red-700 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="uppercase tracking-wider font-bold">{t('common.highFloodAlert')}</span>
            <span>{t('common.highFloodAlertDesc')}</span>
          </div>
          <button
            onClick={onToggleEmergencyMode}
            className="text-[11px] underline hover:text-red-100 font-normal cursor-pointer"
          >
            {t('common.dismissAlert')}
          </button>
        </div>
      )}

      {/* Main Official Government Header Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back Button & Control Room Modules Toggle Button + Official Department Branding */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 items-start shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-900/90 hover:bg-blue-800 text-white text-xs font-bold border border-blue-700/90 shadow-xs transition-all cursor-pointer focus:ring-2 focus:ring-amber-400 group"
                title={t('common.back')}
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-200 group-hover:-translate-x-0.5 transition-transform" />
                <span>{t('common.back')}</span>
              </button>
            )}

            {/* Towel / Toggle button on the left hand side in down of back button */}
            <button
              onClick={onToggleSidebar}
              className={`w-full flex items-center justify-center py-1.5 px-2 rounded-md border transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-amber-400 group ${
                isSidebarOpen
                  ? 'bg-amber-400 text-blue-950 border-amber-300 ring-2 ring-amber-300 shadow-md'
                  : 'bg-blue-950 hover:bg-blue-900 text-amber-300 hover:text-amber-200 border-blue-700/80 hover:border-amber-400/80'
              }`}
              title={isSidebarOpen ? t('common.collapseMenu') : t('common.openMenu')}
              aria-label={isSidebarOpen ? t('common.collapseMenu') : t('common.openMenu')}
              aria-expanded={isSidebarOpen}
            >
              <PanelLeft className="w-4 h-4 text-amber-300 group-hover:text-amber-200 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-sm flex items-center justify-center border border-slate-200 shrink-0">
            {/* Government Seal Icon */}
            <Waves className="w-6 h-6 text-blue-800" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                {t('common.appName')}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-blue-950 uppercase">
                {t('common.officialPortal')}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              {t('common.appTagline')}
            </p>
          </div>
        </div>

        {/* Center: City & Ward Selector (Desktop View) */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-blue-950/70 border border-blue-800/80 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-blue-200 text-xs font-medium">{t('common.city')}:</span>
            <select
              value={currentCity.id}
              onChange={(e) => {
                const found = SUPPORTED_CITIES.find(c => c.id === e.target.value);
                if (found) onCityChange(found);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-950/70 border border-blue-800/80 rounded-lg px-2.5 py-1.5">
            <span className="text-blue-200 text-xs font-medium">{t('common.areaWard')}:</span>
            <select
              value={selectedWard}
              onChange={(e) => onWardChange(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs max-w-[180px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">{t('common.entireCity')}</option>
              {currentCity.wards.map(w => (
                <option key={w} value={w} className="bg-slate-900 text-white">
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-950/70 border border-blue-800/80 px-2.5 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${isSimulatedData ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className={isSimulatedData ? 'text-sky-300' : 'text-emerald-300'}>
              {isSimulatedData ? t('common.simulatedModel') : t('common.liveRadarConnected')}
            </span>
            <span className="text-slate-400">&middot;</span>
            <span className="text-slate-300 font-mono text-[11px]">{lastUpdated}</span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-blue-950/70 border border-blue-800/80 hover:bg-blue-900 text-white transition-colors"
            title="Update Live Radar Readings"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          {/* Emergency Alert Switch */}
          <button
            onClick={onToggleEmergencyMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              emergencyMode
                ? 'bg-red-600 text-white border-red-400 shadow-md'
                : 'bg-blue-950/70 text-blue-100 hover:bg-red-950/50 border-blue-800/80 hover:border-red-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{emergencyMode ? t('common.emergencyOn') : t('common.emergencyMode')}</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              ref={bellButtonRef}
              onClick={() => {
                setShowNotifications(prev => !prev);
                setShowOfficerMenu(false);
              }}
              className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
                showNotifications
                  ? 'bg-blue-800 border-amber-400 text-white'
                  : 'bg-blue-950/70 border-blue-800/80 hover:bg-blue-900 text-white'
              }`}
              title="View Current Flood Alerts"
              aria-label="View Current Flood Alerts"
              aria-expanded={showNotifications}
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel rendered via Portal into body layer to guarantee it renders ABOVE map canvas, tiles, markers, and controls */}
            {showNotifications && bellPos && typeof document !== 'undefined' && createPortal(
              <div
                ref={notificationPanelRef}
                style={{
                  position: 'fixed',
                  top: `${bellPos.top}px`,
                  right: `${bellPos.right}px`,
                  maxWidth: `${bellPos.maxWidth}px`,
                  width: '340px',
                }}
                className="z-[90] rounded-xl bg-white border border-slate-300 shadow-2xl p-3 text-slate-800 text-xs select-none ring-1 ring-black/5 animate-fadeIn"
                role="dialog"
                aria-label="Current Flood Alerts"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-700" />
                    <span className="font-bold text-slate-900 text-xs">Current Flood Alerts</span>
                    {alerts.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold text-[10px] border border-red-200">
                        {alerts.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenAlerts();
                      }}
                      className="text-blue-700 hover:text-blue-900 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      View All
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      aria-label="Close notification panel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <p className="font-semibold text-xs text-slate-700">No Active Flood Alerts</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">All monitored water levels within safe thresholds.</p>
                    </div>
                  ) : (
                    alerts.slice(0, 4).map(a => {
                      const isCritical = a.severity === 'critical';
                      const isSevere = a.severity === 'severe';
                      const isWarning = a.severity === 'warning';

                      return (
                        <div
                          key={a.id}
                          onClick={() => {
                            setShowNotifications(false);
                            onOpenAlerts();
                          }}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:shadow-xs ${
                            isCritical
                              ? 'bg-red-50/80 border-red-200 hover:bg-red-50'
                              : isSevere
                              ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-50'
                              : isWarning
                              ? 'bg-yellow-50/80 border-yellow-200 hover:bg-yellow-50'
                              : 'bg-slate-50 border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                              isCritical
                                ? 'bg-red-600 text-white'
                                : isSevere
                                ? 'bg-amber-600 text-white'
                                : isWarning
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {a.severity}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {a.timeIssued || 'Live Now'}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs leading-snug">{a.title}</div>
                          <div className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {a.description}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Panel Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 text-[10px] font-mono">National Early Warning</span>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onOpenAlerts();
                    }}
                    className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    Open Full Alert Center &rarr;
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Official / Operator Access Control */}
          {!officerInfo ? (
            /* Logged-out Public State: Prominent clean Official Sign In button */
            <button
              onClick={onOpenOfficialLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/90 hover:bg-blue-800 text-white text-xs font-bold border border-blue-600/70 shadow-xs transition-all cursor-pointer whitespace-nowrap focus:ring-2 focus:ring-amber-400 group"
              title="Official Ministry of Earth Sciences & Control Room Officer Sign In"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Official Sign In</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          ) : (
            /* Logged-in Officer State: Compact unified profile and operational tools dropdown */
            <div className="relative">
              <button
                ref={officerButtonRef}
                onClick={() => {
                  setShowOfficerMenu(prev => !prev);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-white transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-amber-400 ${
                  showOfficerMenu
                    ? 'bg-blue-900 border-amber-400'
                    : 'bg-blue-950/90 hover:bg-blue-900 border-blue-700/80'
                }`}
                title="Officer Duty Profile & Control Room Actions"
                aria-expanded={showOfficerMenu}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-amber-300 font-bold truncate max-w-[130px]">{officerInfo.name}</span>
                <span className="hidden lg:inline text-blue-200 text-[11px]">&middot; Control Room</span>
                <ChevronDown className={`w-3 h-3 text-blue-300 ml-0.5 transition-transform ${showOfficerMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Officer Menu Dropdown rendered via Portal into body layer */}
              {showOfficerMenu && officerPos && typeof document !== 'undefined' && createPortal(
                <div
                  ref={officerPanelRef}
                  style={{
                    position: 'fixed',
                    top: `${officerPos.top}px`,
                    right: `${officerPos.right}px`,
                    maxWidth: `${officerPos.maxWidth}px`,
                    width: '288px',
                  }}
                  className="z-[90] rounded-xl bg-white border border-slate-300 shadow-2xl overflow-hidden text-slate-800 text-xs animate-fadeIn select-none ring-1 ring-black/5"
                  role="menu"
                >
                  {/* Officer Profile Header */}
                  <div className="bg-[#0b1e36] text-white p-3 border-b border-blue-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold font-mono text-sm border border-blue-400">
                        {officerInfo.name ? officerInfo.name.charAt(0) : 'O'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs leading-tight truncate">{officerInfo.name}</div>
                        <div className="text-[10px] text-blue-200 mt-0.5 truncate">{officerInfo.department}</div>
                        <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Duty Active &middot; Level 3 Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Tools Navigation */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Control Room Operations
                    </div>

                    <button
                      onClick={() => {
                        setShowOfficerMenu(false);
                        if (onSelectTab) onSelectTab('drainage');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Network className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Drainage SCADA &amp; Pumps</div>
                        <div className="text-[10px] text-slate-500">Holding tanks &amp; pump telemetry</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowOfficerMenu(false);
                        if (onSelectTab) onSelectTab('rainfall');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <CloudRain className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Doppler Radar Network</div>
                        <div className="text-[10px] text-slate-500">37 IMD radar stations grid</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowOfficerMenu(false);
                        if (onSelectTab) onSelectTab('alerts');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <BellRing className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Broadcast Alert Bulletin</div>
                        <div className="text-[10px] text-slate-500">Emergency public sirens &amp; SMS</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowOfficerMenu(false);
                        if (onSelectTab) onSelectTab('historical');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Hydraulic Analytics &amp; Models</div>
                        <div className="text-[10px] text-slate-500">Historical cloudburst calibration</div>
                      </div>
                    </button>
                  </div>

                  {/* Clean Bottom Sign Out Section */}
                  <div className="p-2 border-t border-slate-200 bg-slate-50">
                    <button
                      onClick={() => {
                        setShowOfficerMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-200"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet City / Ward Sub-bar (Guarantees Area/Ward selector is 100% accessible on smaller screens) */}
      <div className="lg:hidden bg-[#0a1d38] px-3.5 py-1.5 flex items-center justify-between gap-2 text-xs border-t border-blue-900/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/80 rounded-lg px-2 py-1 shrink-0">
          <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
          <span className="text-blue-200 text-[11px] font-medium">{t('common.city')}:</span>
          <select
            value={currentCity.id}
            onChange={(e) => {
              const found = SUPPORTED_CITIES.find(c => c.id === e.target.value);
              if (found) onCityChange(found);
            }}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-[11px]"
          >
            {SUPPORTED_CITIES.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/80 rounded-lg px-2 py-1 shrink-0">
          <span className="text-blue-200 text-[11px] font-medium">{t('common.areaWard')}:</span>
          <select
            value={selectedWard}
            onChange={(e) => onWardChange(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-[11px] max-w-[150px] truncate"
          >
            <option value="ALL" className="bg-slate-900 text-white">{t('common.entireCity')}</option>
            {currentCity.wards.map(w => (
              <option key={w} value={w} className="bg-slate-900 text-white">
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
