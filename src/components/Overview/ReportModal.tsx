import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Waves,
  ShieldAlert,
  Building2,
  PhoneCall,
  Loader2
} from 'lucide-react';
import {
  CityConfig,
  RoadSegment,
  DrainageNode,
  RainfallNowcastPoint,
  AlertItem,
  CriticalFacility
} from '../../types';
import { downloadFloodReportPDF } from '../../services/reportGenerator';
import { useTranslation } from '../../i18n/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityConfig;
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  rainfallData: RainfallNowcastPoint[];
  alerts: AlertItem[];
  facilities?: CriticalFacility[];
  lastUpdated?: string;
  officerName?: string;
  department?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  city,
  roads,
  drainageNodes,
  rainfallData,
  alerts,
  facilities = [],
  lastUpdated = '14:30:15 IST',
  officerName = 'National Disaster Management Officer',
  department = 'MoES Urban Flood Cell & Municipal Emergency Command'
}) => {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [officerNameInput, setOfficerNameInput] = useState<string>(officerName);
  const [includeFacilities, setIncludeFacilities] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentRainfall = rainfallData[0]?.observedMmHr || 58.4;
  const floodedRoads = roads.filter(r => r.currentFloodDepthCm > 15);
  const closedRoads = roads.filter(r => r.closureStatus === 'closed' || r.currentFloodDepthCm > 45);
  const maxDepthRoad = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm)[0];
  const avgDrainageUtilization = Math.round(
    drainageNodes.reduce((acc, curr) => acc + curr.utilizationPct, 0) / (drainageNodes.length || 1)
  );

  const overallRisk =
    maxDepthRoad?.currentFloodDepthCm > 60 || currentRainfall > 70
      ? 'CRITICAL'
      : maxDepthRoad?.currentFloodDepthCm > 30 || currentRainfall > 45
      ? 'SEVERE'
      : 'WARNING';

  const handleDownload = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);

    try {
      setTimeout(() => {
        const fileName = downloadFloodReportPDF({
          city,
          roads,
          drainageNodes,
          rainfallData,
          alerts,
          facilities: includeFacilities ? facilities : [],
          officerName: officerNameInput,
          department
        });
        setIsGenerating(false);
        setDownloadSuccess(fileName);
      }, 300);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const topHotspots = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Urban Flood Situation Report (SITREP)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  PDF Export
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official structured briefing for {city.name} ({city.state}) • Offline decision-making
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Report Preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">PDF Situation Report Downloaded Successfully!</p>
                  <p className="text-emerald-700 font-mono text-[11px] mt-0.5">{downloadSuccess}</p>
                </div>
              </div>
              <button
                onClick={() => setDownloadSuccess(null)}
                className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Report Configuration & Officer Tag */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Authorized Field Officer / Designation
              </label>
              <input
                type="text"
                value={officerNameInput}
                onChange={(e) => setOfficerNameInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                placeholder="Enter officer name"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Incident Command Authority
              </label>
              <div className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium truncate">
                {department}
              </div>
            </div>
          </div>

          {/* Document Preview Sheet */}
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-sm space-y-5 text-slate-800">
            {/* National Crest & Formal Title */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-900 block">
                  Government of India • Ministry of Earth Sciences (MoES)
                </span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  NATIONAL URBAN FLOOD EARLY WARNING SYSTEM (NUFEWS)
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Comprehensive Flood Inundation, Doppler Rainfall Trends &amp; Emergency Action SitRep
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700">
                  REF: NUFEWS-{city.id.toUpperCase()}-SITREP
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Ingest Time: {lastUpdated}
                </p>
                <p className="text-[11px] text-slate-500">
                  Target Domain: <strong className="text-slate-800">{city.name}</strong> ({city.state})
                </p>
              </div>
            </div>

            {/* Overall Threat Callout */}
            <div className={`rounded-xl p-4 border flex items-center justify-between gap-4 ${
              overallRisk === 'CRITICAL'
                ? 'bg-red-50 border-red-300 text-red-900'
                : overallRisk === 'SEVERE'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-8 h-8 shrink-0 ${
                  overallRisk === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      OVERALL STATUS: {overallRisk} FLOOD INUNDATION PROTOCOL
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {closedRoads.length} major road underpasses impassable • Dewatering pump stations active • Public diversion corridors operational
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                overallRisk === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {overallRisk}
              </span>
            </div>

            {/* 4 Key Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" /> Rain Rate (Now)
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  {currentRainfall} <span className="text-xs font-normal text-slate-500">mm/h</span>
                </div>
                <div className="text-[10px] text-blue-700 font-semibold mt-1">
                  Doppler Ingest Active
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Flooded Roads
                </div>
                <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                  {floodedRoads.length} <span className="text-xs font-normal text-slate-500">segments</span>
                </div>
                <div className="text-[10px] text-red-700 font-semibold mt-1">
                  {closedRoads.length} Subways Closed
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Waves className="w-3.5 h-3.5 text-red-600" /> Max Water Depth
                </div>
                <div className="text-xl font-bold font-mono text-red-700 mt-1">
                  {maxDepthRoad?.currentFloodDepthCm || 64} <span className="text-xs font-normal text-slate-500">cm</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium truncate mt-1">
                  {maxDepthRoad?.name.split('&')[0] || 'Andheri Subway'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Drainage Nodes
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                  {avgDrainageUtilization}% <span className="text-xs font-normal text-slate-500">utilized</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium mt-1">
                  Continuous Discharge
                </div>
              </div>
            </div>

            {/* Table 1: Critical Roads Preview */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                1. Top Inundated Roads &amp; Railway Underpasses
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px]">
                      <th className="p-2 font-bold">Location</th>
                      <th className="p-2 font-bold">Ward</th>
                      <th className="p-2 font-bold text-center">Depth</th>
                      <th className="p-2 font-bold text-center">Status</th>
                      <th className="p-2 font-bold">Mandated Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {topHotspots.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-900">{r.name}</td>
                        <td className="p-2 text-slate-600">{r.ward}</td>
                        <td className="p-2 text-center font-mono font-bold text-red-700">
                          {r.currentFloodDepthCm} cm
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.closureStatus === 'closed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.closureStatus}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 text-[11px]">
                          {r.recommendedAction || 'Deploy mobile dewatering pumps'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: 0-3h Rainfall Trends Preview */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                2. Doppler Radar Rainfall Nowcast (0 to 3 Hours)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {rainfallData.slice(0, 6).map((pt, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {pt.timeOffsetMin === 0 ? 'Now' : `+${pt.timeOffsetMin}m`}
                    </span>
                    <span className="text-sm font-bold font-mono text-blue-800 block mt-0.5">
                      {pt.forecastMmHr || pt.observedMmHr}
                    </span>
                    <span className="text-[9px] text-slate-500">mm/hr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Alerts Preview */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                3. Active Municipal Alerts ({alerts.length})
              </h3>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alt) => (
                  <div key={alt.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{alt.title}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        {alt.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{alt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts Footer */}
            <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <PhoneCall className="w-3.5 h-3.5 text-blue-700" /> Emergency Hotlines:
              </div>
              <div>State EOC: <strong>1070</strong></div>
              <div>Municipal Flood Cell: <strong>1916</strong></div>
              <div>NDRF Ops: <strong>011-24363260</strong></div>
              <div>Police &amp; Fire: <strong>112</strong></div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeFacilities}
                onChange={(e) => setIncludeFacilities(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span>Include Hospital &amp; Emergency Shelter Matrix</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('overview.generatingPdf')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t('overview.downloadReport')} (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
