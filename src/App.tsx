/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTabId } from './components/Sidebar';
import { FloodMap } from './components/Map/FloodMap';
import { OverviewDashboard } from './components/Overview/OverviewDashboard';
import { RainfallModule } from './components/Rainfall/RainfallModule';
import { DrainageModule } from './components/Drainage/DrainageModule';
import { RoutingPlanner } from './components/Routing/RoutingPlanner';
import { AlertsModule } from './components/Alerts/AlertsModule';
import { CitizenReporting } from './components/Citizen/CitizenReporting';
import { HistoricalAnalytics } from './components/Analytics/HistoricalAnalytics';
import { SettingsModule } from './components/Settings/SettingsModule';
import { MinistryLoginModal } from './components/Auth/MinistryLoginModal';

import {
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  RainfallNowcastPoint,
  AlertItem,
  CitizenReportItem,
  RouteOption,
  CityConfig,
  UserRole,
  AlertStatus,
  ReportStatus,
  FloodArrivalZone,
  FloodInundationPolygon
} from './types';

import {
  SUPPORTED_CITIES,
  INITIAL_CITIZEN_REPORTS,
  getCityData
} from './data/mockData';

import { getWardFilteredData } from './services/wardService';

export default function App() {
  // Navigation & Spatial Domain - Default to All India so India map fits on one screen on initial load
  const [currentCity, setCurrentCity] = useState<CityConfig>(SUPPORTED_CITIES[0]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  // Authentication State: Public by default (no initial login cards), Officer sign-in unlocks operational tools
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [officerSession, setOfficerSession] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('citizen');

  // Load initial city dataset (All India national overview or first city)
  const initialData = getCityData(SUPPORTED_CITIES[0].id);

  // Core Hydrological & Geospatial State for Currently Selected City
  const [roads, setRoads] = useState<RoadSegment[]>(initialData.roads);
  const [drainageNodes, setDrainageNodes] = useState<DrainageNode[]>(initialData.drainageNodes);
  const [drainageEdges, setDrainageEdges] = useState<DrainageEdge[]>(initialData.drainageEdges);
  const [facilities, setFacilities] = useState<CriticalFacility[]>(initialData.facilities);
  const [rainfallData, setRainfallData] = useState<RainfallNowcastPoint[]>(initialData.rainfallData);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialData.alerts);
  const [arrivalZones, setArrivalZones] = useState<FloodArrivalZone[]>(initialData.arrivalZones);
  const [floodPolygons, setFloodPolygons] = useState<FloodInundationPolygon[]>(initialData.floodPolygons);
  const [citizenReports, setCitizenReports] = useState<CitizenReportItem[]>(INITIAL_CITIZEN_REPORTS);

  // Selected Entities
  const [selectedRoad, setSelectedRoad] = useState<RoadSegment | null>(null);
  const [selectedNode, setSelectedNode] = useState<DrainageNode | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);

  // Live Telemetry simulation state
  const [lastUpdated, setLastUpdated] = useState<string>('14:30:15 IST');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // City switching handler: dynamically updates map, hotspots, rainfall, wards, depths, corridors, alerts
  const handleCityChange = useCallback((newCity: CityConfig) => {
    setCurrentCity(newCity);
    setSelectedWard('ALL');
    const cityData = getCityData(newCity.id);
    setRoads(cityData.roads);
    setDrainageNodes(cityData.drainageNodes);
    setDrainageEdges(cityData.drainageEdges);
    setFacilities(cityData.facilities);
    setRainfallData(cityData.rainfallData);
    setAlerts(cityData.alerts);
    setArrivalZones(cityData.arrivalZones);
    setFloodPolygons(cityData.floodPolygons);
    setSelectedRoad(null);
    setSelectedNode(null);
    setActiveRoute(null);
  }, []);

  // Synchronized Multi-Component Ward Filtering & Microclimate Analytics
  const wardData = React.useMemo(() => {
    return getWardFilteredData({
      roads,
      drainageNodes,
      rainfallData,
      alerts,
      selectedWard
    });
  }, [roads, drainageNodes, rainfallData, alerts, selectedWard]);

  const visibleRoads = wardData.effectiveRoads;

  // Trigger Telemetry Refresh (Simulates Live Doppler Radar & Sensor Ingestion)
  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const fluctuation = (Math.random() - 0.48) * 3.5;
      setRainfallData(prev => prev.map(pt => ({
        ...pt,
        forecastMmHr: Math.round(Math.max(5, pt.forecastMmHr + fluctuation) * 10) / 10
      })));

      const now = new Date();
      setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} IST`);
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Surcharge Simulation Update handler (Control Room / Operator Tool)
  const handleApplySimulatedNode = (updatedNode: DrainageNode, updatedRoads: RoadSegment[]) => {
    setDrainageNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
    setRoads(prev => {
      const roadMap = new Map(updatedRoads.map(r => [r.id, r]));
      return prev.map(r => roadMap.get(r.id) || r);
    });
    if (updatedNode.status === 'overflowing') {
      const newAlert: AlertItem = {
        id: `alt-${Date.now()}`,
        severity: 'critical',
        title: `Simulated Overflow: ${updatedNode.name}`,
        location: updatedNode.name,
        ward: 'Hydraulic Node Surcharge',
        description: `Drainage capacity exhausted (100%). Street ponding accumulating rapidly.`,
        timeIssued: 'Just now',
        expectedTime: 'Immediate',
        predictedDepthCm: updatedNode.currentWaterLevelM * 20,
        recommendedAction: 'Inspect subsurface culverts and deploy auxiliary mobile dewatering trucks.',
        confidence: 95,
        status: 'new',
        alertType: 'drain_surcharge'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Alert Status handler
  const handleUpdateAlertStatus = (alertId: string, newStatus: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
  };

  // Broadcast Alert Simulator
  const handleBroadcastAlert = (alertTitle: string, channel: 'sms' | 'push' | 'siren') => {
    // Triggers broadcast alert protocol in MoES emergency network
  };

  // Citizen Report Submission
  const handleSubmitReport = (newReport: CitizenReportItem) => {
    setCitizenReports(prev => [newReport, ...prev]);
  };

  // Citizen Report Verification
  const handleUpdateReportStatus = (reportId: string, status: ReportStatus) => {
    setCitizenReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
  };

  // Citizen Report Upvote
  const handleUpvoteReport = (reportId: string) => {
    setCitizenReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  // Focus Road & Open Map
  const handleSelectRoadAndShowMap = (road: RoadSegment) => {
    setSelectedRoad(road);
    setActiveTab('map');
  };

  // Back Navigation Handler
  const handleBack = () => {
    if (activeTab !== 'overview') {
      setActiveTab('overview');
    } else if (currentCity.id !== 'all_india') {
      const allIndia = SUPPORTED_CITIES.find(c => c.id === 'all_india');
      if (allIndia) handleCityChange(allIndia);
    }
  };

  // Sign out of Ministry Control Room - smoothly returns officer to public user role on same dashboard
  const handleLogout = () => {
    setOfficerSession(null);
    setUserRole('citizen');
  };

  // Fullscreen Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullscreen]);

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-800 font-sans select-none">
      {/* Top Fixed Header - Never Overlapped by Map in normal or fullscreen mode */}
      {!isMapFullscreen && (
        <Navbar
          currentCity={currentCity}
          onCityChange={handleCityChange}
          selectedWard={selectedWard}
          onWardChange={setSelectedWard}
          emergencyMode={emergencyMode}
          onToggleEmergencyMode={() => setEmergencyMode(!emergencyMode)}
          userRole={userRole}
          onRoleChange={setUserRole}
          alerts={wardData.relevantAlerts}
          onOpenAlerts={() => setActiveTab('alerts')}
          lastUpdated={lastUpdated}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          onBack={handleBack}
          onLogout={handleLogout}
          officerInfo={officerSession}
          onOpenOfficialLogin={() => setIsLoginModalOpen(true)}
          onSelectTab={setActiveTab}
          activeTab={activeTab}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setMobileSidebarOpen(prev => !prev);
            } else {
              setIsSidebarCollapsed(prev => !prev);
            }
          }}
          isSidebarOpen={!isSidebarCollapsed || mobileSidebarOpen}
          reportCount={citizenReports.length}
          isSimulatedData={!(currentCity as any).isLiveTelemetry}
        />
      )}

      {/* Control Room Operations Status Banner (Only visible when authorized officer is logged in and not fullscreen) */}
      {!isMapFullscreen && officerSession && (
        <div className="shrink-0 bg-[#08182f] border-b border-blue-900/60 px-4 py-1 text-white text-[11px] flex flex-wrap items-center justify-between gap-2 z-30 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">MoES Control Room Active:</span>
              <span className="font-mono text-slate-300">{officerSession.name} ({officerSession.department})</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span>Radar: <strong className="text-emerald-400 font-mono">37/37 IMD Stations</strong></span>
              <span>&bull;</span>
              <span>Pumps: <strong className="text-blue-300 font-mono">48 Operational</strong></span>
              <span>&bull;</span>
              <span>Gauges: <strong className="text-amber-300 font-mono">CWC Telemetry Online</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-[10px]">SCADA Overrides Unlocked</span>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleLogout}
              className="text-[11px] text-red-300 hover:text-red-100 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace (Sidebar + Content/Map) */}
      <div className={`flex-1 w-full min-h-0 overflow-hidden flex flex-row relative ${isMapFullscreen ? 'z-50' : 'isolate z-0'}`}>
        {/* Left Sidebar (hidden in map fullscreen) */}
        {!isMapFullscreen && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            alertCount={wardData.relevantAlerts.filter(a => a.status === 'new').length}
            reportCount={citizenReports.length}
            isOpen={!isSidebarCollapsed || mobileSidebarOpen}
            onClose={() => {
              setMobileSidebarOpen(false);
              setIsSidebarCollapsed(true);
            }}
          />
        )}

        {/* Main Content Workspace: Map occupies 100% of remaining screen height without webpage scrolling */}
        <main className="flex-1 h-full min-h-0 overflow-hidden relative flex flex-col bg-slate-100">
          {/* Overview Tab: Displays Summary Cards + Interactive Map Preview */}
          {activeTab === 'overview' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Summary Cards & Situation Report */}
              <OverviewDashboard
                roads={wardData.effectiveRoads}
                drainageNodes={wardData.effectiveNodes}
                rainfallData={wardData.effectiveRainfall}
                alerts={wardData.relevantAlerts}
                onSelectRoad={handleSelectRoadAndShowMap}
                onNavigateToTab={setActiveTab}
                currentCity={currentCity}
                lastUpdated={lastUpdated}
                facilities={facilities}
                officerName={officerSession?.name}
                department={officerSession?.department}
                selectedWard={selectedWard}
                warningLevel={wardData.officialWarningLevel}
              />

              {/* Integrated Live Map Preview in Overview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse" />
                    City Flood Map &amp; Arrival Heatmap ({currentCity.name})
                  </h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-blue-700 hover:underline font-bold"
                  >
                    Open Full Map &rarr;
                  </button>
                </div>

                <div className="h-[480px] rounded-xl overflow-hidden border border-slate-300 shadow-md">
                  <FloodMap
                    cityCenter={currentCity.center}
                    zoom={currentCity.zoom}
                    roads={visibleRoads}
                    drainageNodes={drainageNodes}
                    drainageEdges={drainageEdges}
                    facilities={facilities}
                    citizenReports={citizenReports}
                    arrivalZones={arrivalZones}
                    floodPolygons={floodPolygons}
                    activeRoute={activeRoute}
                    onSelectRoad={setSelectedRoad}
                    onSelectNode={setSelectedNode}
                    selectedRoad={selectedRoad}
                    onSelectCity={(cityId) => {
                      const found = SUPPORTED_CITIES.find(c => c.id === cityId);
                      if (found) handleCityChange(found);
                    }}
                    onToggleFullscreen={() => {
                      setActiveTab('map');
                      setIsMapFullscreen(true);
                    }}
                    selectedWard={selectedWard}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Interactive Flood Map Tab (Takes 100% of Viewport, Zero Page Scrolling) */}
          {activeTab === 'map' && (
            <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden flex flex-col">
              {/* Map Sub-header (hidden when fullscreen) */}
              {!isMapFullscreen && (
                <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between z-10 text-xs">
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>
                        {currentCity.id === 'all_india'
                          ? 'National Urban Flood Early Warning & Live Doppler Radar GIS'
                          : `${currentCity.name} Flood GIS & Arrival Heatmap (0–3 Hours)`}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                        {currentCity.id === 'all_india' ? 'National Domain' : 'City Ward Model'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {currentCity.id === 'all_india'
                        ? 'National flood hazard hotspots across major Indian basins. Click any hotspot to inspect local flood GIS.'
                        : '0–3 Hour flood arrival progression (purple to blue heatmap), street waterlogging depths, and drainage networks.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const allIndiaCity = SUPPORTED_CITIES.find(c => c.id === 'all_india');
                        if (allIndiaCity) handleCityChange(allIndiaCity);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        currentCity.id === 'all_india'
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      All India View
                    </button>

                    {currentCity.id === 'all_india' && (
                      <button
                        onClick={() => {
                          const delhiCity = SUPPORTED_CITIES.find(c => c.id === 'delhi');
                          if (delhiCity) handleCityChange(delhiCity);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Zoom to Delhi NCR &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Leaflet Map filling 100% of remaining height */}
              <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
                <FloodMap
                  cityCenter={currentCity.center}
                  zoom={currentCity.zoom}
                  roads={visibleRoads}
                  drainageNodes={drainageNodes}
                  drainageEdges={drainageEdges}
                  facilities={facilities}
                  citizenReports={citizenReports}
                  arrivalZones={arrivalZones}
                  floodPolygons={floodPolygons}
                  activeRoute={activeRoute}
                  onSelectRoad={setSelectedRoad}
                  onSelectNode={setSelectedNode}
                  selectedRoad={selectedRoad}
                  onSelectCity={(cityId) => {
                    const found = SUPPORTED_CITIES.find(c => c.id === cityId);
                    if (found) handleCityChange(found);
                  }}
                  isFullscreen={isMapFullscreen}
                  onToggleFullscreen={() => setIsMapFullscreen(prev => !prev)}
                  selectedWard={selectedWard}
                />
              </div>
            </div>
          )}

          {/* Rainfall Nowcast Tab */}
          {activeTab === 'rainfall' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <RainfallModule
                rainfallSeries={wardData.effectiveRainfall}
                onTriggerRainUpdate={handleRefreshData}
                currentCity={currentCity}
                selectedWard={selectedWard}
              />
            </div>
          )}

          {/* Drainage Network Tab */}
          {activeTab === 'drainage' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <DrainageModule
                nodes={wardData.effectiveNodes}
                edges={drainageEdges}
                roads={wardData.effectiveRoads}
                onApplySimulatedNode={handleApplySimulatedNode}
                onFocusOnMap={() => {
                  setActiveTab('map');
                }}
                currentCity={currentCity}
                selectedWard={selectedWard}
              />
            </div>
          )}

          {/* Flood-Safe Routes Tab */}
          {activeTab === 'routes' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <RoutingPlanner
                roads={wardData.effectiveRoads}
                onSelectRoute={setActiveRoute}
                onNavigateToMap={() => setActiveTab('map')}
                currentCity={currentCity}
                facilities={facilities}
                selectedWard={selectedWard}
              />
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <AlertsModule
                alerts={wardData.relevantAlerts}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onBroadcastAlert={handleBroadcastAlert}
                selectedWard={selectedWard}
                currentCity={currentCity}
              />
            </div>
          )}

          {/* Citizen Reports Tab */}
          {activeTab === 'citizen' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <CitizenReporting
                reports={citizenReports}
                onSubmitReport={handleSubmitReport}
                onUpdateReportStatus={handleUpdateReportStatus}
                onUpvoteReport={handleUpvoteReport}
              />
            </div>
          )}

          {/* Historical Analysis Tab */}
          {activeTab === 'historical' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <HistoricalAnalytics />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="flex-1 w-full h-full min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-100">
              <SettingsModule
                currentCity={currentCity}
                onCityChange={handleCityChange}
                userRole={userRole}
                onRoleChange={setUserRole}
              />
            </div>
          )}
        </main>
      </div>

      {/* Official / Ministry Login Modal */}
      <MinistryLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(officer) => {
          setOfficerSession(officer);
          setUserRole(officer.role);
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}
