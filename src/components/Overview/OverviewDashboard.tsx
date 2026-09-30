import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import {
  RoadSegment,
  DrainageNode,
  RainfallNowcastPoint,
  AlertItem,
  FloodRiskLevel
} from '../../types';

interface OverviewDashboardProps {
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  rainfallData: RainfallNowcastPoint[];
  alerts: AlertItem[];
  onSelectRoad: (road: RoadSegment) => void;
  onNavigateToTab: (tabId: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  roads,
  drainageNodes,
  rainfallData,
  alerts,
  onSelectRoad,
  onNavigateToTab
}) => {
  const currentRainfall = rainfallData[0]?.observedMmHr || 58.4;
  const currentAccumulation = rainfallData[rainfallData.length - 1]?.accumulationMm || 197.6;
  const floodedRoads = roads.filter(r => r.currentFloodDepthCm > 15);
  const criticalRoads = roads.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'SEVERE');
  const maxDepthRoad = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm)[0];

  const overloadedNodes = drainageNodes.filter(n => n.status === 'surcharged' || n.status === 'overflowing');
  const avgDrainageUtilization = Math.round(
    drainageNodes.reduce((acc, curr) => acc + curr.utilizationPct, 0) / (drainageNodes.length || 1)
  );

  const overallRisk: FloodRiskLevel =
    maxDepthRoad?.currentFloodDepthCm > 60 ? 'CRITICAL' : maxDepthRoad?.currentFloodDepthCm > 30 ? 'SEVERE' : 'WARNING';

  const topHotspots = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Official Citizen Advisory Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Public Monsoon Advisory: Heavy Waterlogging in Low-Lying Underpasses
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Andheri Subway and Milan Subway are <strong>CLOSED</strong> due to deep standing water. Vehicles are strictly advised to use Eastern Freeway, Western Express Highway flyovers, or SV Road overbridges.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('routes')}
          className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Navigation className="w-4 h-4" />
          <span>Find Flood-Safe Route</span>
        </button>
      </div>

      {/* 6 Simple Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Rain Intensity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">Rainfall Right Now</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {currentRainfall} <span className="text-xs font-normal text-slate-500">mm/hr</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Very Heavy Rain
          </div>
        </div>

        {/* Card 2: Flooded Roads */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">Waterlogged Roads</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {floodedRoads.length} <span className="text-xs font-normal text-slate-500">roads affected</span>
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-2">
            4 Underpasses Closed
          </div>
        </div>

        {/* Card 3: Deepest Spot */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-red-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">Highest Water Depth</span>
            <Waves className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">
            {maxDepthRoad?.currentFloodDepthCm || 64} <span className="text-xs font-normal text-slate-500">cm</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-2 truncate" title={maxDepthRoad?.name}>
            Loc: {maxDepthRoad?.name.split('&')[0] || 'Andheri Subway'}
          </div>
        </div>

        {/* Card 4: Drains */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">City Drains Capacity</span>
            <Network className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800 mt-1">
            {avgDrainageUtilization}% <span className="text-xs font-normal text-slate-500">full</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 6 Storm Pumps Active
          </div>
        </div>

        {/* Card 5: Alert Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-red-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">Official Warning</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">
            {overallRisk}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Next 0 to 3 Hours
          </div>
        </div>

        {/* Card 6: Safe Routes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span className="font-bold text-slate-700">Safe Corridors</span>
            <Navigation className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            18 <span className="text-xs font-normal text-slate-500">routes clear</span>
          </div>
          <div className="text-[11px] text-blue-700 font-bold mt-2 cursor-pointer hover:underline" onClick={() => onNavigateToTab('routes')}>
            Check My Route &rarr;
          </div>
        </div>
      </div>

      {/* Main Analytical Section (Light & Simple) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 0-3h Rainfall Nowcast Chart & Water Depth Curves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rainfall Line Chart */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-700" /> Expected Rainfall for Next 3 Hours (Doppler Radar Forecast)
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Precipitation prediction in millimeters per hour. Readings above 50 mm/hr trigger high flash flood warnings.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Rain Rate (mm/hr)
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2.5 h-0.5 bg-red-600" /> Heavy Rain Threshold (50mm)
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

                {/* Fill Area */}
                <polygon
                  points="
                    40,95 120,80 200,60 280,48 360,65 440,110 520,145 600,165 680,180
                    680,185 40,185
                  "
                  fill="url(#lightRainGradient)"
                />

                {/* Main Forecast Line */}
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="3.5"
                  points="40,95 120,80 200,60 280,48 360,65 440,110 520,145 600,165 680,180"
                />

                {/* Data Points */}
                {[
                  { x: 40, y: 95, val: '58' },
                  { x: 120, y: 80, val: '68' },
                  { x: 200, y: 60, val: '76' },
                  { x: 280, y: 48, val: '82' },
                  { x: 360, y: 65, val: '74' },
                  { x: 440, y: 110, val: '52' },
                  { x: 520, y: 145, val: '34' },
                  { x: 600, y: 165, val: '22' },
                  { x: 680, y: 180, val: '12' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2.5" />
                    <text x={pt.x} y={pt.y - 8} fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      {pt.val}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {rainfallData.map((pt, i) => {
                  const x = 40 + i * 80;
                  return (
                    <text key={i} x={x} y="195" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                      {pt.timeOffsetMin === 0 ? 'Now' : `+${pt.timeOffsetMin}m`}
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
                  <Waves className="w-4 h-4 text-blue-700" /> Deep Water Levels at Major Railway & Road Underpasses
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Vehicles should avoid these locations until pumps clear the waterlogging
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('map')}
                className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
              >
                View on Map &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Andheri Subway', depthNow: 64, peak: 95, time: '+60m', status: 'CLOSED', color: 'text-red-700' },
                { name: 'Milan Subway', depthNow: 56, peak: 85, time: '+60m', status: 'CLOSED', color: 'text-red-700' },
                { name: 'Hindmata Junction', depthNow: 38, peak: 68, time: '+60m', status: 'DIVERSION', color: 'text-orange-700' },
                { name: 'Kurla LBS Marg', depthNow: 44, peak: 71, time: '+60m', status: 'CLOSED', color: 'text-red-700' }
              ].map((spot, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block truncate">{spot.name}</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-slate-900">{spot.depthNow}</span>
                    <span className="text-xs text-slate-500 font-medium">cm water</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 flex justify-between border-t border-slate-200 pt-1.5 font-medium">
                    <span>Peak: <strong className={spot.color}>{spot.peak}cm</strong></span>
                    <span className="font-bold text-red-700">{spot.status}</span>
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
                <AlertTriangle className="w-4 h-4 text-red-600" /> Roads to Avoid (Deep Water)
              </h3>
              <span className="text-[10px] font-bold text-red-700 px-1.5 py-0.5 rounded bg-red-100 border border-red-200">
                Take Alternate
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
                      {road.currentFloodDepthCm} cm
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1 rounded bg-red-100 text-red-800 border border-red-200">
                      {road.closureStatus === 'closed' ? 'Closed' : 'Caution'}
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
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Active Municipal Alerts
              </h3>
              <button
                onClick={() => onNavigateToTab('alerts')}
                className="text-xs text-blue-700 hover:underline font-bold"
              >
                View All ({alerts.length})
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
                      {alert.severity}
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
    </div>
  );
};
