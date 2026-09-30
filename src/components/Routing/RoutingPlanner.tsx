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
  AlertTriangle
} from 'lucide-react';
import { RoadSegment, VehicleType, RouteOption, CriticalFacility, CityConfig } from '../../types';
import { RoutingEngine, RouteSearchRequest } from '../../services/routingEngine';

interface RoutingPlannerProps {
  roads: RoadSegment[];
  onSelectRoute: (route: RouteOption) => void;
  onNavigateToMap: () => void;
  currentCity?: CityConfig;
  facilities?: CriticalFacility[];
}

export const RoutingPlanner: React.FC<RoutingPlannerProps> = ({
  roads,
  onSelectRoute,
  onNavigateToMap,
  currentCity,
  facilities
}) => {
  const PRESET_LOCATIONS: { name: string; coords: [number, number] }[] = React.useMemo(() => {
    if (facilities && facilities.length >= 2) {
      return facilities.map(f => ({ name: f.name, coords: f.coordinates }));
    }
    if (roads && roads.length >= 2) {
      return roads.slice(0, 6).map(r => ({ name: r.name, coords: r.coordinates[0] }));
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

  const handleCalculateRoute = () => {
    const origin = PRESET_LOCATIONS[originIndex];
    const destination = PRESET_LOCATIONS[destinationIndex];

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
  }, [originIndex, destinationIndex, selectedVehicle, departureOffset, isEmergencyPriority]);

  const vehicles: { type: VehicleType; label: string; icon: React.ElementType; limit: number; advice: string }[] = [
    { type: 'ambulance', label: 'Ambulance', icon: HeartPulse, limit: 45, advice: 'High chassis clearance' },
    { type: 'fire_truck', label: 'Fire Truck', icon: Flame, limit: 60, advice: 'Heavy rescue clearance' },
    { type: 'police', label: 'Police 4x4', icon: Shield, limit: 35, advice: 'Patrol & rescue' },
    { type: 'bus', label: 'BEST Bus', icon: Bus, limit: 40, advice: 'Municipal transit' },
    { type: 'car', label: 'Car / Auto', icon: Car, limit: 20, advice: 'Avoid water above 20cm' },
    { type: 'walking', label: 'Pedestrian', icon: Footprints, limit: 12, advice: 'Avoid hidden open manholes' }
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" /> Municipal Flood-Safe Route Finder
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Avoids Submerged Roads
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Plan your travel route to avoid submerged subways, overflowing nullahs, and stalled traffic during heavy Mumbai rains.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg text-slate-800">
          <input
            type="checkbox"
            checked={isEmergencyPriority}
            onChange={(e) => setIsEmergencyPriority(e.target.checked)}
            className="rounded accent-emerald-600 w-4 h-4"
          />
          <span className="font-bold text-emerald-800">Emergency Convoy Priority</span>
        </label>
      </div>

      {/* Inputs & Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
            Route Details
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Starting From (Origin)</label>
            <select
              value={originIndex}
              onChange={(e) => setOriginIndex(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              {PRESET_LOCATIONS.map((loc, idx) => (
                <option key={idx} value={idx}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Going To (Destination)</label>
            <select
              value={destinationIndex}
              onChange={(e) => setDestinationIndex(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
            <label className="font-bold text-slate-700 block mb-1.5">How are you traveling?</label>
            <div className="grid grid-cols-2 gap-2">
              {vehicles.map((v) => {
                const Icon = v.icon;
                const isSelected = selectedVehicle === v.type;
                return (
                  <button
                    key={v.type}
                    onClick={() => setSelectedVehicle(v.type)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs leading-tight">{v.label}</div>
                      <div className="text-[10px] text-slate-500">Max: {v.limit} cm water</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Offset */}
          <div>
            <div className="flex justify-between text-slate-700 font-medium mb-1">
              <span>Leaving Time:</span>
              <span className="font-bold text-blue-800">
                {departureOffset === 0 ? 'Right Now' : `In ${departureOffset} minutes`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="30"
              value={departureOffset}
              onChange={(e) => setDepartureOffset(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Now</span>
              <span>+60m</span>
              <span>+120m</span>
              <span>+180m</span>
            </div>
          </div>

          <button
            onClick={handleCalculateRoute}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Find Safest Path</span>
          </button>
        </div>

        {/* Route Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Available Routes ({routes.length} options)
            </h3>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
            >
              Show Selected Route on Map <ExternalLink className="w-3.5 h-3.5" />
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
                        {isSafe ? 'RECOMMENDED SAFE ROUTE' : isModerate ? 'CAUTION ROUTE' : 'BLOCKED / IMPASSABLE'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{route.title}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700">
                      <span>{route.totalDistanceKm} km</span>
                      <span>·</span>
                      <span className="text-blue-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{route.estimatedDurationMin} mins
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">Deepest Water on Route</span>
                      <span className={`font-bold font-mono ${isSafe ? 'text-emerald-700' : isModerate ? 'text-amber-700' : 'text-red-700'}`}>
                        {route.maxWaterDepthCm} cm
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">Flooded Stretches</span>
                      <span className="text-slate-800 font-bold">
                        {route.floodedSegmentsCount} sections
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">Safety Confidence</span>
                      <span className="text-blue-800 font-bold font-mono">
                        {route.confidenceScore}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-medium">Road Condition</span>
                      <span className={`font-bold ${isSafe ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isSafe ? 'DRY / ELEVATED' : 'HAZARDOUS'}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 text-xs mb-2.5 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    <strong>Route Advice:</strong> {route.safetyReason}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Key Waypoints:</span>
                    {route.waypoints.map((wp, i) => (
                      <React.Fragment key={i}>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-medium">
                          {wp}
                        </span>
                        {i < route.waypoints.length - 1 && <span className="text-slate-400">&rarr;</span>}
                      </React.Fragment>
                    ))}
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
