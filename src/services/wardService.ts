import {
  RoadSegment,
  DrainageNode,
  RainfallNowcastPoint,
  AlertItem,
  FloodRiskLevel
} from '../types';

/**
 * Robust fuzzy ward matching function that handles:
 * - Exact matches ("F/South (Parel)" === "F/South (Parel)")
 * - Substring matches ("F/South (Parel / Hindmata)" matches "F/South (Parel)")
 * - Ward code prefixes ("F/South", "K/West", "H/East", "L", "Zone 9", "Borough VII", "Central Delhi")
 * - Combined ward strings ("K/West & H/East")
 */
export function matchWard(itemWard: string | undefined | null, selectedWard: string): boolean {
  if (!selectedWard || selectedWard === 'ALL' || selectedWard === 'Entire City') {
    return true;
  }
  if (!itemWard) return false;

  const s1 = selectedWard.toLowerCase().trim();
  const s2 = itemWard.toLowerCase().trim();

  if (s1 === s2) return true;
  if (s2.includes(s1) || s1.includes(s2)) return true;

  // Extract key token identifiers (e.g., 'f/south', 'sion', 'andheri', 'kurla', 'parel')
  const extractTokens = (str: string) => {
    return str
      .replace(/[()\/&,.-]/g, ' ')
      .split(/\s+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 1 && !['ward', 'zone', 'borough', 'area', 'subway', 'marg', 'road', 'subways'].includes(t));
  };

  const tokens1 = extractTokens(s1);
  const tokens2 = extractTokens(s2);

  // If both have code like "f" and "south", check intersection
  const common = tokens1.filter(t => tokens2.includes(t));
  return common.length >= 1;
}

/**
 * Calculates geographic center and bounding box for roads in a selected ward
 */
export function getWardGeoBounds(roads: RoadSegment[], fallbackCenter: [number, number]): {
  center: [number, number];
  bounds?: [[number, number], [number, number]];
  zoom: number;
} {
  if (!roads || roads.length === 0) {
    return { center: fallbackCenter, zoom: 12 };
  }

  const allCoords: [number, number][] = [];
  roads.forEach(r => {
    if (r.coordinates && r.coordinates.length > 0) {
      allCoords.push(...r.coordinates);
    }
  });

  if (allCoords.length === 0) {
    return { center: fallbackCenter, zoom: 12 };
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  let sumLat = 0;
  let sumLng = 0;

  allCoords.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    sumLat += lat;
    sumLng += lng;
  });

  const centerLat = sumLat / allCoords.length;
  const centerLng = sumLng / allCoords.length;

  return {
    center: [centerLat, centerLng],
    bounds: [
      [minLat - 0.003, minLng - 0.003],
      [maxLat + 0.003, maxLng + 0.003]
    ],
    zoom: 14
  };
}

/**
 * Synchronizes all dashboard data components when a specific ward is selected
 */
export function getWardFilteredData({
  roads,
  drainageNodes,
  rainfallData,
  alerts,
  selectedWard
}: {
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  rainfallData: RainfallNowcastPoint[];
  alerts: AlertItem[];
  selectedWard: string;
}) {
  const isAllWards = selectedWard === 'ALL' || selectedWard === 'Entire City';

  // 1. Filtered Roads
  const filteredRoads = isAllWards
    ? roads
    : roads.filter(r => matchWard(r.ward, selectedWard));

  const effectiveRoads = filteredRoads.length > 0 ? filteredRoads : roads;

  // 2. Filtered Drainage Nodes
  const filteredNodes = isAllWards
    ? drainageNodes
    : drainageNodes.filter(n => {
        // Connected to a road in the ward
        const isConnected = effectiveRoads.some(r => r.id === n.connectedRoadId || r.connectedNodeId === n.id);
        if (isConnected) return true;
        // Or name matches ward
        return matchWard(n.name, selectedWard);
      });

  const effectiveNodes = filteredNodes.length > 0 ? filteredNodes : drainageNodes;

  // 3. Area-Specific Rainfall Nowcast
  let effectiveRainfall = rainfallData;
  if (!isAllWards && effectiveRoads.length > 0) {
    const wardAvgRain = effectiveRoads.reduce((acc, r) => acc + (r.rainfallMmHr || 50), 0) / effectiveRoads.length;
    const baseRain = rainfallData[0]?.observedMmHr || 58.4;
    const ratio = baseRain > 0 ? wardAvgRain / baseRain : 1;

    effectiveRainfall = rainfallData.map(pt => {
      const scaledForecast = Math.round(Math.max(5, (pt.forecastMmHr || pt.observedMmHr) * ratio) * 10) / 10;
      const scaledObserved = pt.observedMmHr > 0 ? Math.round(pt.observedMmHr * ratio * 10) / 10 : 0;
      const scaledAccum = Math.round((pt.accumulationMm || 100) * ratio * 10) / 10;

      return {
        ...pt,
        observedMmHr: scaledObserved,
        forecastMmHr: scaledForecast,
        accumulationMm: scaledAccum
      };
    });
  }

  // 4. Highest Water Depth
  const sortedByDepth = [...effectiveRoads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm);
  const maxDepthRoad = sortedByDepth[0] || null;
  const highestDepthCm = maxDepthRoad ? maxDepthRoad.currentFloodDepthCm : 0;

  // 5. Drainage Capacity & Active Pumps
  const avgDrainageUtilization = Math.round(
    effectiveNodes.reduce((acc, curr) => acc + curr.utilizationPct, 0) / (effectiveNodes.length || 1)
  );

  const activeStormPumps = effectiveNodes.filter(
    n => n.isPumpingActive || (n.pumpCapacityM3s && n.pumpCapacityM3s > 0)
  ).length;

  // 6. Dynamic Warning Level for Selected Ward
  const currentRain = effectiveRainfall[0]?.observedMmHr || effectiveRainfall[0]?.forecastMmHr || 40;
  const officialWarningLevel: FloodRiskLevel =
    highestDepthCm > 60 || currentRain > 70
      ? 'CRITICAL'
      : highestDepthCm > 30 || currentRain > 45
      ? 'SEVERE'
      : highestDepthCm > 15 || currentRain > 25
      ? 'WARNING'
      : 'WATCH';

  // 7. Roads to Avoid (Hotspots in Ward)
  const floodedRoads = effectiveRoads.filter(r => r.currentFloodDepthCm > 15);
  const closedRoads = effectiveRoads.filter(r => r.closureStatus === 'closed' || r.currentFloodDepthCm > 45);
  const safeCorridorsCount = effectiveRoads.filter(r => r.currentFloodDepthCm <= 15 && r.closureStatus !== 'closed').length;

  // 8. Relevant Alerts
  let relevantAlerts = alerts;
  if (!isAllWards) {
    const wardMatchedAlerts = alerts.filter(
      a => matchWard(a.ward, selectedWard) || matchWard(a.location, selectedWard)
    );

    if (wardMatchedAlerts.length > 0) {
      relevantAlerts = wardMatchedAlerts;
    } else {
      // Synthesize ward advisory
      const syntheticAlert: AlertItem = {
        id: `ward-alt-${Date.now()}`,
        severity: officialWarningLevel === 'CRITICAL' ? 'critical' : officialWarningLevel === 'SEVERE' ? 'severe' : 'watch',
        title: `${selectedWard}: Ward Hydrological Status`,
        location: `${selectedWard} Drainage Sub-basin`,
        ward: selectedWard,
        description:
          highestDepthCm > 30
            ? `Deep standing water recorded (${highestDepthCm}cm at ${maxDepthRoad?.name || 'underpass'}). Dewatering units deployed.`
            : `All roads in ${selectedWard} monitored. No severe road submersion reported at this time.`,
        timeIssued: 'Just now',
        expectedTime: 'Next 0-3 hours',
        predictedDepthCm: highestDepthCm,
        recommendedAction:
          highestDepthCm > 30
            ? 'Avoid low-lying underpasses and use designated elevated corridors.'
            : 'Normal vigilance. Sump pumps functioning within standard parameters.',
        confidence: 94,
        status: 'new',
        alertType: highestDepthCm > 30 ? 'road_flooding' : 'heavy_rainfall'
      };
      relevantAlerts = [syntheticAlert, ...alerts.slice(0, 2)];
    }
  }

  return {
    effectiveRoads,
    effectiveNodes,
    effectiveRainfall,
    relevantAlerts,
    maxDepthRoad,
    highestDepthCm,
    avgDrainageUtilization,
    activeStormPumps,
    officialWarningLevel,
    floodedRoads,
    closedRoads,
    safeCorridorsCount
  };
}
