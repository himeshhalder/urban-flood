"""
Pydantic data models for Urban Flood Nowcasting API
"""

from typing import List, Dict, Optional, Tuple, Literal
from pydantic import BaseModel, Field

FloodRiskLevel = Literal['NORMAL', 'WATCH', 'WARNING', 'SEVERE', 'CRITICAL']
DrainageNodeType = Literal['manhole', 'catch_basin', 'inlet', 'junction', 'pump_station', 'storage_tank', 'outfall']
DrainageNodeStatus = Literal['normal', 'high_utilization', 'surcharged', 'blocked', 'overflowing', 'pump_failure']
AlertSeverity = Literal['critical', 'severe', 'warning', 'watch', 'advisory']
AlertStatus = Literal['new', 'acknowledged', 'in_progress', 'resolved']
VehicleType = Literal['car', 'bus', 'ambulance', 'fire_truck', 'police', 'walking']

class ModelExplanation(BaseModel):
    rainfallContributionPct: float
    drainageOverloadPct: float
    blockagePct: float
    terrainDepressionPct: float
    tidalLockPct: float

class RoadSegmentModel(BaseModel):
    id: str
    name: str
    ward: str
    lengthMeters: float
    widthMeters: float
    coordinates: List[Tuple[float, float]]
    elevationMsl: float
    imperviousRatio: float
    catchmentAreaSqM: float
    drainCapacityM3s: float
    currentFloodDepthCm: float
    predictedDepthCm: Dict[int, float]
    floodArrivalTimeMin: int
    expectedDurationMin: int
    blockagePct: float
    riskLevel: FloodRiskLevel
    confidenceScore: float
    rainfallMmHr: float
    connectedNodeId: str
    recommendedAction: str
    closureStatus: Literal['open', 'caution', 'closed']
    lastUpdated: str
    modelExplanation: ModelExplanation

class DrainageNodeModel(BaseModel):
    id: str
    name: str
    type: DrainageNodeType
    coordinates: Tuple[float, float]
    groundElevationMsl: float
    invertElevationMsl: float
    currentWaterLevelM: float
    maxStorageM3: float
    inletCapacityM3s: float
    currentInflowM3s: float
    utilizationPct: float
    blockagePct: float
    status: DrainageNodeStatus
    connectedRoadId: str
    pumpCapacityM3s: Optional[float] = None
    isPumpingActive: Optional[bool] = None
    lastInspection: str

class DrainageEdgeModel(BaseModel):
    id: str
    name: str
    fromNodeId: str
    toNodeId: str
    coordinates: List[Tuple[float, float]]
    lengthMeters: float
    diameterMm: float
    slopePct: float
    maxCapacityM3s: float
    currentFlowM3s: float
    flowDirection: str
    blockagePct: float
    status: DrainageNodeStatus

class SimulationRequest(BaseModel):
    node_id: str
    blockage_pct: float = Field(ge=0, le=100)
    rainfall_mm_hr: float = Field(ge=0, le=250)
    duration_min: int = Field(default=60, ge=15, le=360)

class SimulationResponse(BaseModel):
    node_id: str
    updated_utilization_pct: float
    status: DrainageNodeStatus
    surcharge_depth_cm: float
    affected_roads: List[str]
    estimated_recovery_time_min: int
    overflow_direction: str

class RouteSearchQuery(BaseModel):
    origin: str  # "lat,lng"
    destination: str  # "lat,lng"
    vehicle: VehicleType = 'ambulance'
    priority: bool = True
    horizon: int = 0

class RouteOptionModel(BaseModel):
    id: str
    title: str
    pathCoordinates: List[Tuple[float, float]]
    totalDistanceKm: float
    estimatedDurationMin: int
    maxWaterDepthCm: float
    floodedSegmentsCount: int
    riskLevel: Literal['safe', 'moderate_risk', 'unsafe', 'closed']
    confidenceScore: float
    isRecommended: bool
    safetyReason: str
    waypoints: List[str]

class AlertModel(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    location: str
    ward: str
    description: str
    timeIssued: str
    expectedTime: str
    predictedDepthCm: float
    recommendedAction: str
    confidence: float
    status: AlertStatus
    alertType: str

class CitizenReportModel(BaseModel):
    id: Optional[str] = None
    latitude: float
    longitude: float
    locationName: str
    ward: str
    floodDepthCm: float
    description: str
    roadName: str
    waterFlowDirection: Literal['north', 'south', 'east', 'west', 'standing']
    vehicleAccessibility: Literal['all', 'suv_only', 'emergency_only', 'impassable']
    isAnonymous: bool = False
    reporterName: Optional[str] = None
    photoUrl: Optional[str] = None
    timestamp: Optional[str] = None
    status: Optional[str] = 'submitted'
    upvotes: Optional[int] = 0
