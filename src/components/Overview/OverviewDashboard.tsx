import React, { useState } from 'react';
import {
  CloudRain,
  AlertTriangle,
  Waves,
  Network,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Info,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileText,
  Download,
  Loader2,
  Printer,
  Filter
} from 'lucide-react';
import {
  RoadSegment,
  DrainageNode,
  RainfallNowcastPoint,
  AlertItem,
  FloodRiskLevel,
  CityConfig,
  CriticalFacility
} from '../../types';
import { ReportModal } from './ReportModal';
import { downloadFloodReportPDF } from '../../services/reportGenerator';
import { useTranslation } from '../../i18n/LanguageContext';

interface OverviewDashboardProps {
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  rainfallData: RainfallNowcastPoint[];
  alerts: AlertItem[];
  onSelectRoad: (road: RoadSegment) => void;
  onNavigateToTab: (tabId: any) => void;
  currentCity?: CityConfig;
  lastUpdated?: string;
  facilities?: CriticalFacility[];
  officerName?: string;
  department?: string;
  selectedWard?: string;
  warningLevel?: FloodRiskLevel;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  roads,
  drainageNodes,
  rainfallData,
  alerts,
  onSelectRoad,
  onNavigateToTab,
  currentCity,
  lastUpdated = '14:30:15 IST',
  facilities = [],
  officerName,
  department,
  selectedWard = 'ALL',
  warningLevel
}) => {
  const { t } = useTranslation();
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const activeCity: CityConfig = currentCity || {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [19.076, 72.8777],
    zoom: 12,
    wards: ['Ward K/West', 'Ward H/East', 'Ward G/North', 'Ward L'],
    radarStation: 'IMD Colaba Doppler (DWR)',
    tideStation: 'Apollo Bunder Tide Gauge'
  };

  const isWardFiltered = selectedWard && selectedWard !== 'ALL' && selectedWard !== 'Entire City';

  const currentRainfall = rainfallData[0]?.observedMmHr || rainfallData[0]?.forecastMmHr || 58.4;
  const floodedRoads = roads.filter(r => r.currentFloodDepthCm > 15);
  const closedRoads = roads.filter(r => r.closureStatus === 'closed' || r.currentFloodDepthCm > 45);
  const maxDepthRoad = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm)[0];

  const avgDrainageUtilization = Math.round(
    drainageNodes.reduce((acc, curr) => acc + curr.utilizationPct, 0) / (drainageNodes.length || 1)
  );

  const overallRisk: FloodRiskLevel =
    warningLevel ||
    (maxDepthRoad?.currentFloodDepthCm > 60 || currentRainfall > 70
      ? 'CRITICAL'
      : maxDepthRoad?.currentFloodDepthCm > 30 || currentRainfall > 45
      ? 'SEVERE'
      : maxDepthRoad?.currentFloodDepthCm > 15
      ? 'WARNING'
      : 'WATCH');

  const topHotspots = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm).slice(0, 5);

  const handleDirectDownload = () => {
    setIsDownloadingReport(true);
    setTimeout(() => {
      try {
        const fileName = downloadFloodReportPDF({
          city: activeCity,
          roads,
          drainageNodes,
          rainfallData,
          alerts,
          facilities,
          officerName: officerName || 'Disaster Response Officer',
          department: department || 'MoES National Urban Flood Warning Cell'
        });
        setDownloadSuccessToast(fileName);
        setTimeout(() => setDownloadSuccessToast(null), 6000);
      } catch (e) {
        console.error('Error generating PDF report:', e);
      } finally {
        setIsDownloadingReport(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-5">
      {/* Executive Command & SitRep Export Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] tracking-wide uppercase">
              {activeCity.name} {t('overview.urbanBasin')}
            </span>

            {isWardFiltered && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-700" />
                {selectedWard}
              </span>
            )}

            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {t('overview.state')}: <strong className="text-slate-700">{activeCity.state}</strong>
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('overview.liveTelemetry')}: <strong className="text-slate-700 font-mono">{lastUpdated}</strong>
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {t('overview.radar')}: <strong className="text-slate-700">{activeCity.radarStation}</strong>
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2 flex-wrap">
            <span>{t('overview.dashboardTitle')}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                overallRisk === 'CRITICAL'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : overallRisk === 'SEVERE'
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {t(`status.${overallRisk.toLowerCase()}`) || overallRisk}
            </span>
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            {t('overview.dashboardSubtitle')}
          </p>
        </div>

        {/* Action Controls: Download Report (PDF) & Preview */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Preview structured flood situation report before exporting"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>{t('overview.previewSitRep')}</span>
          </button>

          <button
            onClick={handleDirectDownload}
            disabled={isDownloadingReport}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-70 group cursor-pointer"
            title="Generate and download a structured PDF summary of the current city flood status, rainfall trends, and critical alerts"
          >
            {isDownloadingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('overview.generatingPdf')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>{t('overview.downloadReport')}</span>
                <span className="bg-blue-600 text-blue-100 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                  PDF
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {downloadSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">{t('overview.reportDownloaded')}</span>{' '}
              <span className="font-mono text-emerald-800">{downloadSuccessToast}</span>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                {t('overview.reportDownloadedDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDownloadSuccessToast(null)}
            className="text-xs font-bold text-emerald-700 hover:underline shrink-0"
          >
            {t('overview.dismiss')}
          </button>
        </div>
      )}

      {/* Official Citizen Advisory Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              {t('overview.advisoryTitle')}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {t('overview.advisoryDesc')}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('routes')}
          className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>{t('overview.findSafeRoute')}</span>
        </button>
      </div>

      {/* 6 Simple Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Rain Intensity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.rainfallNow')}</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {currentRainfall} <span className="text-xs font-normal text-slate-500">{t('common.mmHr')}</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {t('overview.veryHeavyRain')}
          </div>
        </div>

        {/* Card 2: Flooded Roads */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.waterloggedRoads')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {floodedRoads.length} <span className="text-xs font-normal text-slate-500">{t('overview.roadsAffected')}</span>
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-2">
            {closedRoads.length} {t('overview.underpassesClosed')}
          </div>
        </div>

        {/* Card 3: Deepest Spot */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-red-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.highestWaterDepth')}</span>
            <Waves className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">
            {maxDepthRoad?.currentFloodDepthCm || 0} <span className="text-xs font-normal text-slate-500">{t('common.cm')}</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-2 truncate" title={maxDepthRoad?.name || 'Safe'}>
            {t('overview.loc')} {maxDepthRoad?.name.split('&')[0] || (isWardFiltered ? `${selectedWard} Clear` : 'Subway')}
          </div>
        </div>

        {/* Card 4: Drains */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.cityDrainsCapacity')}</span>
            <Network className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800 mt-1">
            {avgDrainageUtilization}% <span className="text-xs font-normal text-slate-500">{t('overview.full')}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {drainageNodes.filter(n => n.isPumpingActive).length || 4} {t('overview.stormPumpsActive')}
          </div>
        </div>

        {/* Card 5: Alert Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-red-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.officialWarning')}</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">
            {t(`status.${overallRisk.toLowerCase()}`) || overallRisk}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {t('overview.nextHours')}
          </div>
        </div>

        {/* Card 6: Safe Routes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">{t('overview.safeCorridors')}</span>
            <Navigation className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {roads.filter(r => r.currentFloodDepthCm <= 15).length} <span className="text-xs font-normal text-slate-500">{t('overview.routesClear')}</span>
          </div>
          <div className="text-[11px] text-blue-700 font-bold mt-2 cursor-pointer hover:underline" onClick={() => onNavigateToTab('routes')}>
            {t('overview.checkMyRoute')}
          </div>
        </div>
      </div>

      {/* Main Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 0-3h Rainfall Nowcast Chart & Water Depth Curves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rainfall Line Chart */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-700" /> {t('overview.expectedRainfallTitle')}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {t('overview.expectedRainfallSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> {t('overview.rainRate')}
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2.5 h-0.5 bg-red-600" /> {t('overview.heavyRainThreshold')}
                </span>
              </div>
            </div>

            {/* Clean Light SVG Hyetograph */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lightRainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="60" x2="680" y2="60" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="100" x2="680" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="140" x2="680" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />

                {/* Y-Axis Labels */}
                <text x="5" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">100mm</text>
                <text x="12" y="64" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">75mm</text>
                <text x="12" y="104" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">50mm</text>
                <text x="12" y="144" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">25mm</text>

                {/* Critical Threshold 50mm Line */}
                <line x1="40" y1="100" x2="680" y2="100" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,4" />

                {/* Points calculation from rainfallData */}
                {(() => {
                  const points = rainfallData.slice(0, 9).map((pt, i) => {
                    const x = 40 + i * 80;
                    const val = pt.forecastMmHr || pt.observedMmHr;
                    const y = Math.max(20, Math.min(180, 185 - (val / 100) * 165));
                    return { x, y, val: Math.round(val) };
                  });

                  if (points.length === 0) return null;

                  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                  const polygonPoints = `${polylinePoints} ${points[points.length - 1].x},185 ${points[0].x},185`;

                  return (
                    <>
                      <polygon points={polygonPoints} fill="url(#lightRainGradient)" />
                      <polyline fill="none" stroke="#1d4ed8" strokeWidth="3.5" points={polylinePoints} />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2.5" />
                          <text x={pt.x} y={pt.y - 8} fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                            {pt.val}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}

                {/* X Axis Labels */}
                {rainfallData.slice(0, 9).map((pt, i) => {
                  const x = 40 + i * 80;
                  return (
                    <text key={i} x={x} y="195" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                      {pt.timeOffsetMin === 0 ? t('common.now') : `+${pt.timeOffsetMin}m`}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Deepest Hotspots Bar Overview */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-700" /> {t('overview.deepWaterLevelsTitle')}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {t('overview.deepWaterLevelsSubtitle')}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('map')}
                className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                {t('common.viewOnMap')} &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topHotspots.slice(0, 4).map((spot, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block truncate" title={spot.name}>{spot.name}</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-slate-900">{spot.currentFloodDepthCm}</span>
                    <span className="text-xs text-slate-500 font-medium">{t('common.cm')} {t('common.water')}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 flex justify-between border-t border-slate-200 pt-1.5 font-medium">
                    <span>{t('overview.peak')} <strong className={spot.currentFloodDepthCm > 40 ? 'text-red-700' : 'text-orange-700'}>{spot.predictedDepthCm[60] || spot.currentFloodDepthCm}cm</strong></span>
                    <span className={`font-bold uppercase ${spot.closureStatus === 'closed' ? 'text-red-700' : 'text-amber-700'}`}>
                      {t(`status.${spot.closureStatus}`) || spot.closureStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Top Waterlogged Roads List & Live Alerts */}
        <div className="space-y-6">
          {/* Top 5 Locations List */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> {t('overview.roadsToAvoidTitle')}
              </h3>
              <span className="text-[10px] font-bold text-red-700 px-1.5 py-0.5 rounded bg-red-100 border border-red-200">
                {t('overview.takeAlternate')}
              </span>
            </div>

            <div className="space-y-2.5">
              {topHotspots.map((road, idx) => (
                <div
                  key={road.id}
                  onClick={() => onSelectRoad(road)}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-800 truncate">
                        {road.name}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {road.ward}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-red-700">
                      {road.currentFloodDepthCm} {t('common.cm')}
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1 rounded bg-red-100 text-red-800 border border-red-200">
                      {t(`status.${road.closureStatus}`) || road.closureStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Official Alerts */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> {t('overview.activeAlertsTitle')}
              </h3>
              <button
                onClick={() => onNavigateToTab('alerts')}
                className="text-xs text-blue-700 hover:underline font-bold cursor-pointer"
              >
                {t('common.viewAll')} ({alerts.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                      alert.severity === 'severe' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {t(`status.${alert.severity}`) || alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{alert.timeIssued}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{alert.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Situation Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        city={activeCity}
        roads={roads}
        drainageNodes={drainageNodes}
        rainfallData={rainfallData}
        alerts={alerts}
        facilities={facilities}
        lastUpdated={lastUpdated}
        officerName={officerName}
        department={department}
      />
    </div>
  );
};
