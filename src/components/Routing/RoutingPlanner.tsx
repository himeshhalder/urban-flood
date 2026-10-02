import React, { useState } from 'react';
import {
  Navigation,
  Shield,
  Car,
  Bus,
  Flame,
  Footprints,
  HeartPulse,
  Clock,
  Compass,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { RoadSegment, VehicleType, RouteOption, CriticalFacility, CityConfig } from '../../types';
import { RoutingEngine, RouteSearchRequest } from '../../services/routingEngine';
import { useTranslation } from '../../i18n/LanguageContext';

interface RoutingPlannerProps {
  roads: RoadSegment[];
  onSelectRoute: (route: RouteOption) => void;
  onNavigateToMap: () => void;
  currentCity?: CityConfig;
  facilities?: CriticalFacility[];
  selectedWard?: string;
}

export const RoutingPlanner: React.FC<RoutingPlannerProps> = ({
  roads,
  onSelectRoute,
  onNavigateToMap,
  currentCity,
  facilities,
  selectedWard = 'ALL'
}) => {
  const { t } = useTranslation();

  const isWardFiltered = selectedWard && selectedWard !== 'ALL' && selectedWard !== 'Entire City';

  const PRESET_LOCATIONS: { name: string; coords: [number, number] }[] = React.useMemo(() => {
    const list: { name: string; coords: [number, number] }[] = [];

    // Prioritize roads in the active ward
    if (roads && roads.length > 0) {
      roads.forEach(r => {
        if (r.coordinates && r.coordinates.length > 0) {
          list.push({ name: `${r.name} (${r.ward.split('(')[0].trim()})`, coords: r.coordinates[0] });
        }
      });
    }

    if (facilities && facilities.length > 0) {
      facilities.forEach(f => {
        list.push({ name: f.name, coords: f.coordinates });
      });
    }

    if (list.length >= 2) {
      return list;
    }

    return [
      { name: 'Government Civil Hospital Emergency Gate', coords: [19.0035, 72.8428] },
      { name: 'District Fire & Rescue Command Center', coords: [19.0385, 72.8610] },
      { name: 'Central Transit Interchange & Railway Station', coords: [19.0650, 72.8680] },
      { name: 'Municipal Evacuation Shelter Camp', coords: [18.9400, 72.8350] }
    ];
  }, [facilities, roads]);

  const [originIndex, setOriginIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('ambulance');
  const [departureOffset, setDepartureOffset] = useState<number>(0);
  const [isEmergencyPriority, setIsEmergencyPriority] = useState<boolean>(true);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-safe-01');

  // Clamp indices if PRESET_LOCATIONS change
  const safeOriginIndex = Math.min(originIndex, Math.max(0, PRESET_LOCATIONS.length - 1));
  const safeDestinationIndex = Math.min(destinationIndex, Math.max(0, PRESET_LOCATIONS.length - 1));

  const handleCalculateRoute = () => {
    const origin = PRESET_LOCATIONS[safeOriginIndex] || PRESET_LOCATIONS[0];
    const destination = PRESET_LOCATIONS[safeDestinationIndex] || PRESET_LOCATIONS[1] || PRESET_LOCATIONS[0];

    const req: RouteSearchRequest = {
      originName: origin.name,
      destinationName: destination.name,
      originCoords: origin.coords,
      destinationCoords: destination.coords,
      vehicleType: selectedVehicle,
      departureTimeOffsetMin: departureOffset,
      emergencyPriority: isEmergencyPriority
    };

    const calculated = RoutingEngine.findSafeRoutes(req, roads);
    setRoutes(calculated);
    if (calculated.length > 0) {
      setActiveRouteId(calculated[0].id);
      onSelectRoute(calculated[0]);
    }
  };

  React.useEffect(() => {
    handleCalculateRoute();
  }, [safeOriginIndex, safeDestinationIndex, selectedVehicle, departureOffset, isEmergencyPriority, roads]);

  const vehicles: { type: VehicleType; labelKey: string; icon: React.ElementType; limit: number; advice: string }[] = [
    { type: 'ambulance', labelKey: 'ambulance', icon: HeartPulse, limit: 45, advice: 'High chassis clearance' },
    { type: 'fire_truck', labelKey: 'fire_truck', icon: Flame, limit: 60, advice: 'Heavy rescue clearance' },
    { type: 'police', labelKey: 'police', icon: Shield, limit: 35, advice: 'Patrol & rescue' },
    { type: 'bus', labelKey: 'bus', icon: Bus, limit: 40, advice: 'Municipal transit' },
    { type: 'car', labelKey: 'car', icon: Car, limit: 20, advice: 'Avoid water above 20cm' },
    { type: 'walking', labelKey: 'walking', icon: Footprints, limit: 12, advice: 'Avoid hidden open manholes' }
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" /> {t('routes.title')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              {t('routes.badge')}
            </span>
            {isWardFiltered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-700" />
                {selectedWard}
              </span>
            )}
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            {t('routes.subtitle')}
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg text-slate-800">
          <input
            type="checkbox"
            checked={isEmergencyPriority}
            onChange={(e) => setIsEmergencyPriority(e.target.checked)}
            className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
          />
          <span className="font-bold text-emerald-800">{t('routes.emergencyPriority')}</span>
        </label>
      </div>

      {/* Inputs & Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
            {t('routes.title')}
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">{t('routes.startingFrom')}</label>
            <select
              value={safeOriginIndex}
              onChange={(e) => setOriginIndex(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              {PRESET_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={idx}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">{t('routes.goingTo')}</label>
            <select
              value={safeDestinationIndex}
              onChange={(e) => setDestinationIndex(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              {PRESET_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={idx}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">{t('routes.vehicleType')}</label>
            <div className="grid grid-cols-2 gap-2">
              {vehicles.map((v) => {
                const Icon = v.icon;
                const isSelected = selectedVehicle === v.type;
                const vLabel = t(`routes.vehicles.${v.labelKey}`) || v.labelKey;
                return (
                  <button
                    key={v.type}
                    onClick={() => setSelectedVehicle(v.type)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs leading-tight">{vLabel}</div>
                      <div className="text-[10px] text-slate-500">Max: {v.limit} {t('common.cm')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Offset */}
          <div>
            <div className="flex justify-between text-slate-700 font-medium mb-1">
              <span>{t('routes.departureTime')}:</span>
              <span className="font-bold text-blue-800">
                {departureOffset === 0 ? t('routes.nowImmediate') : `+${departureOffset} ${t('common.mins')}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="30"
              value={departureOffset}
              onChange={(e) => setDepartureOffset(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{t('common.now')}</span>
              <span>+60m</span>
              <span>+120m</span>
              <span>+180m</span>
            </div>
          </div>

          <button
            onClick={handleCalculateRoute}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{t('overview.findSafeRoute')}</span>
          </button>
        </div>

        {/* Route Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {t('routes.title')} ({routes.length} options)
            </h3>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              {t('routes.viewRouteOnMap')} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {routes.map((route) => {
              const isActive = activeRouteId === route.id;
              const isSafe = route.riskLevel === 'safe';
              const isModerate = route.riskLevel === 'moderate_risk';

              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setActiveRouteId(route.id);
                    onSelectRoute(route);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? isSafe
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/50'
                        : isModerate
                        ? 'bg-amber-50/70 border-amber-500 shadow-sm'
                        : 'bg-red-50/70 border-red-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isSafe ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        isModerate ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {isSafe ? t('routes.recommendedRoute') : t('routes.alternativeRoute')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{route.title}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700">
                      <span>{route.totalDistanceKm} km</span>
                      <span>·</span>
                      <span className="text-blue-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{route.estimatedDurationMin} {t('common.mins')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">{t('routes.maxDepth')}</span>
                      <span className={`font-bold font-mono ${isSafe ? 'text-emerald-700' : isModerate ? 'text-amber-700' : 'text-red-700'}`}>
                        {route.maxWaterDepthCm} {t('common.cm')}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">{t('routes.waterloggedSegments')}</span>
                      <span className="text-slate-800 font-bold">
                        {route.floodedSegmentsCount} {t('common.water')}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">{t('routes.confidenceScore')}</span>
                      <span className="text-blue-800 font-bold font-mono">
                        {route.confidenceScore}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">{t('routes.clearance')}</span>
                      <span className={`font-bold ${isSafe ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isSafe ? t('routes.fullClearance') : t('routes.cautionRequired')}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-start gap-1.5 bg-white/80 p-2 rounded border border-slate-200/80">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSafe ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <strong className="text-slate-800">{t('routes.waypoints')}:</strong>{' '}
                      {route.waypoints.join(' → ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
