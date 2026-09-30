export type FloodRiskLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE' | 'CRITICAL';

export type VehicleType = 'car' | 'bus' | 'ambulance' | 'fire_truck' | 'police' | 'walking';

export type UserRole = 'citizen' | 'operator' | 'emergency_responder' | 'admin' | 'analyst';

export type DrainageNodeType = 'manhole' | 'catch_basin' | 'inlet' | 'junction' | 'pump_station' | 'storage_tank' | 'outfall';

export type DrainageNodeStatus = 'normal' | 'high_utilization' | 'surcharged' | 'blocked' | 'overflowing' | 'pump_failure';

export type AlertSeverity = 'critical' | 'severe' | 'warning' | 'watch' | 'advisory';

export type AlertStatus = 'new' | 'acknowledged' | 'in_progress' | 'resolved';

export type ReportStatus = 'submitted' | 'under_verification' | 'verified' | 'rejected' | 'resolved';

export interface RoadSegment {
  id: string;
  name: string;
  ward: string;
  lengthMeters: number;
  widthMeters: number;
  coordinates: [number, number][]; // [lat, lng] array
  elevationMsl: number; // meters above sea level
  imperviousRatio: number; // 0.85 - 0.95
  catchmentAreaSqM: number;
  drainCapacityM3s: number;
  currentFloodDepthCm: number;
  predictedDepthCm: Record<number, number>; // timeline offset in minutes -> depth in cm {0: 12, 30: 25, 60: 42, 90: 55, 120: 38, 150: 20, 180: 8}
  floodArrivalTimeMin: number;
  expectedDurationMin: number;
  blockagePct: number;
  riskLevel: FloodRiskLevel;
  confidenceScore: number; // 0 - 100
  rainfallMmHr: number;
  connectedNodeId: string;
  recommendedAction: string;
  closureStatus: 'open' | 'caution' | 'closed';
  lastUpdated: string;
  modelExplanation: {
    rainfallContributionPct: number;
    drainageOverloadPct: number;
    blockagePct: number;
    terrainDepressionPct: number;
    tidalLockPct: number;
  };
}

export interface DrainageNode {
  id: string;
  name: string;
  type: DrainageNodeType;
  coordinates: [number, number]; // [lat, lng]
  groundElevationMsl: number;
  invertElevationMsl: number;
  currentWaterLevelM: number;
  maxStorageM3: number;
  inletCapacityM3s: number;
  currentInflowM3s: number;
  utilizationPct: number;
  blockagePct: number;
  status: DrainageNodeStatus;
  connectedRoadId: string;
  pumpCapacityM3s?: number;
  isPumpingActive?: boolean;
  lastInspection: string;
}

export interface DrainageEdge {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  coordinates: [number, number][];
  lengthMeters: number;
  diameterMm: number;
  slopePct: number;
  maxCapacityM3s: number;
  currentFlowM3s: number;
  flowDirection: string;
  blockagePct: number;
  status: DrainageNodeStatus;
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police_station' | 'shelter';
  coordinates: [number, number];
  address: string;
  contactNumber: string;
  capacity?: number;
  currentStatus: 'operational' | 'at_risk' | 'inaccessible';
  surroundingFloodDepthCm: number;
}

export interface RainfallNowcastPoint {
  timeOffsetMin: number; // 0, 15, 30, 45, 60, 90, 120, 150, 180
  timestamp: string;
  observedMmHr: number;
  forecastMmHr: number;
  confidenceMin: number;
  confidenceMax: number;
  accumulationMm: number;
  thresholdCriticalMmHr: number;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  location: string;
  ward: string;
  description: string;
  timeIssued: string;
  expectedTime: string;
  predictedDepthCm: number;
  recommendedAction: string;
  confidence: number;
  status: AlertStatus;
  alertType: 'heavy_rainfall' | 'flash_flood' | 'road_flooding' | 'drain_surcharge' | 'pump_failure' | 'infrastructure_risk';
}

export interface CitizenReportItem {
  id: string;
  latitude: number;
  longitude: number;
  locationName: string;
  ward: string;
  floodDepthCm: number;
  description: string;
  roadName: string;
  waterFlowDirection: 'north' | 'south' | 'east' | 'west' | 'standing';
  vehicleAccessibility: 'all' | 'suv_only' | 'emergency_only' | 'impassable';
  isAnonymous: boolean;
  reporterName?: string;
  photoUrl?: string;
  timestamp: string;
  status: ReportStatus;
  upvotes: number;
}

export interface RouteOption {
  id: string;
  title: string;
  pathCoordinates: [number, number][];
  totalDistanceKm: number;
  estimatedDurationMin: number;
  maxWaterDepthCm: number;
  floodedSegmentsCount: number;
  riskLevel: 'safe' | 'moderate_risk' | 'unsafe' | 'closed';
  confidenceScore: number;
  isRecommended: boolean;
  safetyReason: string;
  waypoints: string[];
}

export interface HistoricalEvent {
  id: string;
  name: string;
  date: string;
  peakRainfallMmHr: number;
  total24hRainfallMm: number;
  maxFloodDepthCm: number;
  observedFloodedRoads: number;
  predictedFloodedRoads: number;
  modelAccuracyPct: number;
  precisionPct: number;
  recallPct: number;
  f1Score: number;
  maeCm: number;
  iouFloodArea: number;
  summary: string;
}

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  wards: string[];
  radarStation: string;
  tideStation: string;
}

export interface FloodArrivalZone {
  id: string;
  name: string;
  basin: string;
  center: [number, number];
  radiusMeters: number;
  arrivalTimeMin: number; // e.g. 0 (already arrived), 15, 30, 45, 60, 90, 120, 150
  expectedDurationMin: number;
  peakDepthCm: number;
  riskDescription: string;
}

export interface FloodInundationPolygon {
  id: string;
  name: string;
  ward: string;
  polygon: [number, number][];
  elevationMsl: number;
  depthCmByTime: Record<number, number>;
  maxDepthCm: number;
  criticalUnderpass?: boolean;
  basinType: 'depression_bowl' | 'river_floodplain' | 'creek_backwater' | 'underpass_sump' | 'coastal_surge';
  description: string;
}

export interface NationalFloodHotspot {
  id: string;
  cityId: string;
  cityName: string;
  state: string;
  coordinates: [number, number];
  riskLevel: FloodRiskLevel;
  peakDepthCm: number;
  arrivalTimeMin: number;
  rainfallMmHr: number;
  riverBasin: string;
  affectedLocations: string[];
  recommendedAction: string;
  radarStation: string;
  populationAtRisk: string;
}


