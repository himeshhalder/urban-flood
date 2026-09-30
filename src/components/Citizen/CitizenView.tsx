import React, { useState } from 'react';
import {
  Waves,
  ArrowLeft,
  PhoneCall,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CloudRain,
  Navigation,
  Bell,
  Camera,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Info,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import {
  CityConfig,
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  CitizenReportItem,
  AlertItem,
  RainfallNowcastPoint,
  RouteOption
} from '../../types';
import { FloodMap } from '../Map/FloodMap';
import { RoutingPlanner } from '../Routing/RoutingPlanner';
import { CitizenReporting } from './CitizenReporting';
import { AlertsModule } from '../Alerts/AlertsModule';
import {
  MUMBAI_ARRIVAL_ZONES,
  MUMBAI_FLOOD_POLYGONS,
  SUPPORTED_CITIES
} from '../../data/mockData';

interface CitizenViewProps {
  currentCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  drainageEdges: DrainageEdge[];
  facilities: CriticalFacility[];
  citizenReports: CitizenReportItem[];
  alerts: AlertItem[];
  rainfallData: RainfallNowcastPoint[];
  onBackToLanding: () => void;
  onOpenMinistryLogin: () => void;
  onSubmitReport: (report: CitizenReportItem) => void;
  onUpvoteReport: (id: string) => void;
}

export const CitizenView: React.FC<CitizenViewProps> = ({
  currentCity,
  onCityChange,
  roads,
  drainageNodes,
  drainageEdges,
  facilities,
  citizenReports,
  alerts,
  rainfallData,
  onBackToLanding,
  onOpenMinistryLogin,
  onSubmitReport,
  onUpvoteReport
}) => {
  // Simple Citizen Tab: 'map' | 'routes' | 'alerts' | 'report' | 'safety'
  const [citizenTab, setCitizenTab] = useState<'map' | 'routes' | 'alerts' | 'report' | 'safety'>('map');
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);
  const [selectedNode, setSelectedNode] = useState<DrainageNode | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Critical statistics for citizen understanding (VIEW -> UNDERSTAND -> ACT)
  const criticalRoads = roads.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'SEVERE');
  const maxDepth = Math.max(...roads.map(r => r.currentFloodDepthCm), 0);
  const earliestArrival = Math.min(...roads.filter(r => r.floodArrivalTimeMin > 0).map(r => r.floodArrivalTimeMin), 45);
  const unreadAlertsCount = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-800 font-sans">
      {/* Top National Strip */}
      <header className="shrink-0 z-40 bg-[#08182f] border-b border-blue-900/60 px-4 py-1 text-[11px] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-4 rounded-xs overflow-hidden shadow-xs">
            <span className="bg-[#ff9933] w-1/3 h-full" />
            <span className="bg-[#ffffff] w-1/3 h-full" />
            <span className="bg-[#128807] w-1/3 h-full" />
          </span>
          <span className="font-semibold text-slate-200">
            Ministry of Earth Sciences &middot; Government of India
          </span>
          <span className="hidden sm:inline text-blue-300 font-medium">&bull; Public Citizen Early Warning Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>Emergency 24/7: 112 / 1070</span>
          </div>

          <button
            onClick={onOpenMinistryLogin}
            className="hidden md:flex items-center gap-1 text-[11px] text-blue-200 hover:text-white bg-blue-950 px-2 py-0.5 rounded border border-blue-800 transition-colors"
          >
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Ministry Staff Sign-In</span>
          </button>
        </div>
      </header>

      {/* Main Public Government Header Bar */}
      <div className="shrink-0 z-40 bg-[#0f284e] border-b border-blue-950 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Back button + Branding */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/90 hover:bg-blue-800 text-white text-xs font-semibold border border-blue-700/80 shadow-xs transition-all cursor-pointer focus:ring-2 focus:ring-amber-400 group"
            title="Return to National Portal Gateway"
            aria-label="Back to Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-200 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold">Back</span>
          </button>

          <div className="w-9 h-9 rounded-lg bg-white p-1 shadow-sm flex items-center justify-center border border-slate-200">
            <Waves className="w-6 h-6 text-blue-800" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                Urban Flood Nowcasting System
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 uppercase">
                Citizen Portal
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              Ministry of Earth Sciences &middot; 0–3 Hour Rain &amp; Street Flood Forecast
            </p>
          </div>
        </div>

        {/* Center: City Selector */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/80 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-blue-200 font-medium">Select City / Region:</span>
            <select
              value={currentCity.id}
              onChange={(e) => {
                const found = SUPPORTED_CITIES.find(c => c.id === e.target.value);
                if (found) {
                  onCityChange(found);
                  setSelectedRoad(null);
                }
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
        </div>

        {/* Right: Quick Tab Bar for Citizens */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setCitizenTab('map')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              citizenTab === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-200 hover:bg-blue-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flood Map</span>
          </button>

          <button
            onClick={() => setCitizenTab('routes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              citizenTab === 'routes' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-200 hover:bg-blue-900/60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Safe Routes</span>
          </button>

          <button
            onClick={() => setCitizenTab('alerts')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 relative ${
              citizenTab === 'alerts' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-200 hover:bg-blue-900/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCitizenTab('report')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              citizenTab === 'report' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-200 hover:bg-blue-900/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden sm:inline">Report Flood</span>
          </button>

          <button
            onClick={() => setShowSafetyModal(true)}
            className="px-2.5 py-1.5 rounded-lg font-semibold text-amber-200 hover:bg-amber-950/40 border border-amber-500/30 flex items-center gap-1"
            title="Safety Guidelines during Urban Floods"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Safety Rules</span>
          </button>
        </div>
      </div>

      {/* Citizen Action Bar (VIEW -> UNDERSTAND -> ACT) */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 shadow-xs z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* 1. Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Current Flood Risk</span>
              <div className="font-extrabold text-red-700 text-xs sm:text-sm">
                {currentCity.id === 'all_india' ? 'MONSOON ACTIVE (4 High Risk Hotspots)' : 'HIGH RISK (Milan & Hindmata)'}
              </div>
            </div>
          </div>

          {/* 2. Expected Flood Arrival Time */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <Clock className="w-4 h-4 text-purple-700 shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Expected Arrival</span>
              <div className="font-bold text-purple-900">
                {earliestArrival} Minutes (Crest Window)
              </div>
            </div>
          </div>

          {/* 3. Rainfall Nowcast */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Rainfall Nowcast</span>
              <div className="font-bold text-slate-900">
                Heavy Rain (48.5 mm/hr) &bull; Radar Connected
              </div>
            </div>
          </div>

          {/* 4. Recommended Action */}
          <div className="flex-1 min-w-[280px] bg-blue-50/80 border border-blue-200 rounded-lg px-3 py-1 flex items-center gap-2 text-slate-800">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <div className="text-[11px] leading-snug">
              <strong className="text-blue-900">Recommended Action:</strong> Avoid low-lying underpasses. Use elevated arterial roads.
            </div>
          </div>

          {/* 5. Emergency Helpline */}
          <div className="flex items-center gap-1.5 font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-lg font-mono">
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Call 112 for Rescue</span>
          </div>
        </div>
      </div>

      {/* Main Citizen Body - Occupies 100% of Remaining Height Without Webpage Scrolling */}
      <div className="flex-1 w-full min-h-0 overflow-hidden relative flex flex-col">
        {citizenTab === 'map' && (
          <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
            <FloodMap
              cityCenter={currentCity.center}
              zoom={currentCity.zoom}
              roads={roads}
              drainageNodes={drainageNodes}
              drainageEdges={drainageEdges}
              facilities={facilities}
              citizenReports={citizenReports}
              arrivalZones={MUMBAI_ARRIVAL_ZONES}
              floodPolygons={MUMBAI_FLOOD_POLYGONS}
              activeRoute={activeRoute}
              onSelectRoad={setSelectedRoad}
              onSelectNode={setSelectedNode}
              selectedRoad={selectedRoad}
            />
          </div>
        )}

        {citizenTab === 'routes' && (
          <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 bg-slate-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Flood-Safe Route Planner</h2>
                  <p className="text-xs text-slate-600">Calculates transit paths that steer clear of submerged underpasses and waterlogged corridors.</p>
                </div>
                <button
                  onClick={() => setCitizenTab('map')}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  &larr; Return to Flood Map
                </button>
              </div>
              <RoutingPlanner
                roads={roads}
                onSelectRoute={(rt) => {
                  setActiveRoute(rt);
                  setCitizenTab('map');
                }}
                onNavigateToMap={() => setCitizenTab('map')}
              />
            </div>
          </div>
        )}

        {citizenTab === 'alerts' && (
          <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 bg-slate-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Public Flood Alerts &amp; Advisories</h2>
                  <p className="text-xs text-slate-600">Official notices issued by the Ministry of Earth Sciences and disaster authorities.</p>
                </div>
                <button
                  onClick={() => setCitizenTab('map')}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  &larr; Return to Flood Map
                </button>
              </div>
              <AlertsModule
                alerts={alerts}
                onUpdateAlertStatus={() => {}}
                onBroadcastAlert={() => {}}
              />
            </div>
          </div>
        )}

        {citizenTab === 'report' && (
          <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 bg-slate-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Report Local Street Flooding</h2>
                  <p className="text-xs text-slate-600">Help your community and authorities by sharing real-time waterlogging depth and road conditions.</p>
                </div>
                <button
                  onClick={() => setCitizenTab('map')}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  &larr; Return to Flood Map
                </button>
              </div>
              <CitizenReporting
                reports={citizenReports}
                onSubmitReport={onSubmitReport}
                onUpdateReportStatus={() => {}}
                onUpvoteReport={onUpvoteReport}
              />
            </div>
          </div>
        )}
      </div>

      {/* Safety Instructions Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-300 shadow-2xl p-6 text-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">Citizen Safety Rules During Urban Flooding</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <div className="font-bold text-red-900 mb-1">WHAT NOT TO DO (CRITICAL DANGERS)</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>Never attempt to drive or walk through flooded railway subways or low-lying underpasses.</li>
                  <li>Do not touch electric poles, transformers, or hanging cables in standing water.</li>
                  <li>Do not walk near open stormwater drains, manholes, or overflowing nullahs.</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="font-bold text-emerald-900 mb-1">RECOMMENDED ACTIONS</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>Move vehicles to elevated parking garages or higher ground.</li>
                  <li>Keep emergency flashlights, drinking water, and essential medicines charged and handy.</li>
                  <li>Check the Live Flood Arrival Heatmap before beginning any municipal transit.</li>
                  <li>If stranded, immediately call the National Emergency Helpline at <strong>112</strong> or NDMA at <strong>1070</strong>.</li>
                </ul>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowSafetyModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Understood &middot; Close Safety Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
