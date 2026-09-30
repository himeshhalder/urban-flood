import { RoadSegment, DrainageNode, FloodRiskLevel } from '../types';

export interface HydrologyCalculationResult {
  runoffVolumeM3: number;
  inflowRateM3s: number;
  effectiveDrainCapacityM3s: number;
  excessRateM3s: number;
  calculatedDepthCm: number;
  riskLevel: FloodRiskLevel;
  confidenceScore: number;
  recoveryTimeMin: number;
  overflowDirection: string;
}

export class HydrologyEngine {
  // Runoff coefficients
  static readonly COEFFICIENTS = {
    concrete: 0.90,
    asphalt: 0.85,
    roof: 0.95,
    soil: 0.35,
    parks: 0.25,
    waterBody: 1.00
  };

  /**
   * Calculate surface runoff for a given road catchment using Rational Method
   * Q = 0.278 * C * I * A  (where I in mm/hr, A in km^2, Q in m^3/s)
   */
  static calculateRunoff(rainfallMmHr: number, areaSqM: number, runoffCoeff = 0.88): { runoffVolumeM3: number; peakDischargeM3s: number } {
    const areaKm2 = areaSqM / 1_000_000;
    const peakDischargeM3s = 0.278 * runoffCoeff * rainfallMmHr * areaKm2;
    // 1-hour equivalent runoff volume in cubic meters
    const rainfallMeters = (rainfallMmHr / 1000);
    const runoffVolumeM3 = rainfallMeters * areaSqM * runoffCoeff;
    return { runoffVolumeM3, peakDischargeM3s };
  }

  /**
   * Determine flood risk level based on water depth in centimeters
   */
  static getRiskLevel(depthCm: number): FloodRiskLevel {
    if (depthCm <= 5) return 'NORMAL';
    if (depthCm <= 15) return 'WATCH';
    if (depthCm <= 30) return 'WARNING';
    if (depthCm <= 60) return 'SEVERE';
    return 'CRITICAL';
  }

  /**
   * Simulate what happens to a road segment under specific rainfall & drainage conditions
   */
  static simulateRoadCondition(
    road: RoadSegment,
    simulatedRainfallMmHr: number,
    simulatedBlockagePct: number,
    durationMin = 60
  ): HydrologyCalculationResult {
    const { peakDischargeM3s, runoffVolumeM3 } = this.calculateRunoff(
      simulatedRainfallMmHr,
      road.catchmentAreaSqM,
      road.imperviousRatio
    );

    // Effective drain capacity after blockage
    const blockageFactor = Math.max(0, 1 - (simulatedBlockagePct / 100));
    const effectiveDrainCapacityM3s = road.drainCapacityM3s * blockageFactor;

    // Excess discharge that cannot enter drainage
    const excessRateM3s = Math.max(0, peakDischargeM3s - effectiveDrainCapacityM3s);

    // Surface ponding calculation
    const roadSurfaceAreaSqM = road.lengthMeters * road.widthMeters;
    const accumulatedVolumeM3 = excessRateM3s * (durationMin * 60) * 0.45; // factoring lateral surface dispersion
    
    // Depth in cm
    let calculatedDepthCm = (accumulatedVolumeM3 / roadSurfaceAreaSqM) * 100;
    
    // Terrain depression factor (lower elevations gather water)
    if (road.elevationMsl < 4.0) {
      calculatedDepthCm *= 1.35;
    } else if (road.elevationMsl < 5.5) {
      calculatedDepthCm *= 1.15;
    }

    calculatedDepthCm = Math.round(Math.min(calculatedDepthCm, 120) * 10) / 10;
    const riskLevel = this.getRiskLevel(calculatedDepthCm);

    // Confidence depends on calibration bounds
    const confidenceScore = Math.min(98, Math.max(75, Math.round(96 - (simulatedBlockagePct * 0.1) - (simulatedRainfallMmHr > 80 ? 10 : 0))));

    // Recovery time: how long for pumps & gravity to clear ponding after rain stops
    const pumpDrainRateM3s = effectiveDrainCapacityM3s > 0 ? effectiveDrainCapacityM3s : 0.5;
    const recoveryTimeMin = Math.round((accumulatedVolumeM3 / (pumpDrainRateM3s * 60)) + 15);

    // Overflow direction based on terrain gradient
    const overflowDirection = road.elevationMsl < 4.5 
      ? 'Southwest toward Mithi Creek basin & Arabian Sea lowlands' 
      : 'Natural gravity flow into secondary storm culverts';

    return {
      runoffVolumeM3: Math.round(runoffVolumeM3),
      inflowRateM3s: Math.round(peakDischargeM3s * 100) / 100,
      effectiveDrainCapacityM3s: Math.round(effectiveDrainCapacityM3s * 100) / 100,
      excessRateM3s: Math.round(excessRateM3s * 100) / 100,
      calculatedDepthCm,
      riskLevel,
      confidenceScore,
      recoveryTimeMin,
      overflowDirection
    };
  }

  /**
   * Run simulation on a specific drainage node when user changes blockage or rainfall in UI
   */
  static simulateNodeBlockage(
    node: DrainageNode,
    allRoads: RoadSegment[],
    newBlockagePct: number,
    newRainfallMmHr: number
  ): {
    updatedNode: DrainageNode;
    affectedRoads: RoadSegment[];
    surchargeDepthCm: number;
    estimatedRecoveryTimeMin: number;
    overflowDirection: string;
  } {
    // Recalculate node utilization
    const effectiveInlet = node.inletCapacityM3s * Math.max(0.1, 1 - (newBlockagePct / 100));
    const simulatedInflow = (newRainfallMmHr / 50.0) * node.currentInflowM3s;
    const utilizationPct = Math.min(100, Math.round((simulatedInflow / effectiveInlet) * 100));

    let status = node.status;
    if (newBlockagePct >= 80 || utilizationPct >= 98) {
      status = 'overflowing';
    } else if (utilizationPct >= 85) {
      status = 'surcharged';
    } else if (utilizationPct >= 70) {
      status = 'high_utilization';
    } else {
      status = 'normal';
    }

    const updatedNode: DrainageNode = {
      ...node,
      blockagePct: newBlockagePct,
      currentInflowM3s: Math.round(simulatedInflow * 10) / 10,
      utilizationPct,
      status
    };

    // Find connected roads
    const connected = allRoads.filter(r => r.connectedNodeId === node.id || r.id === node.connectedRoadId);
    
    // Simulate each connected road
    const affectedRoads = connected.map(road => {
      const sim = this.simulateRoadCondition(road, newRainfallMmHr, newBlockagePct, 45);
      return {
        ...road,
        currentFloodDepthCm: sim.calculatedDepthCm,
        riskLevel: sim.riskLevel,
        blockagePct: newBlockagePct,
        drainCapacityM3s: sim.effectiveDrainCapacityM3s,
        closureStatus: sim.calculatedDepthCm > 40 ? ('closed' as const) : sim.calculatedDepthCm > 15 ? ('caution' as const) : ('open' as const),
        confidenceScore: sim.confidenceScore,
        lastUpdated: 'Simulated just now'
      };
    });

    const maxDepth = affectedRoads.length > 0 ? Math.max(...affectedRoads.map(r => r.currentFloodDepthCm)) : 35;
    const recoveryTime = Math.round(maxDepth * 2.2 + 20);

    return {
      updatedNode,
      affectedRoads,
      surchargeDepthCm: maxDepth,
      estimatedRecoveryTimeMin: recoveryTime,
      overflowDirection: node.groundElevationMsl < 4.0 ? 'Spilling into low-lying carriageway and underground basement sumps' : 'Diverting into adjacent district storm trunk'
    };
  }
}
