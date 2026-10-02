import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  CitizenReportItem,
  RouteOption,
  FloodArrivalZone,
  FloodInundationPolygon
} from '../../types';
import {
  Layers,
  Search,
  Play,
  Pause,
  Compass,
  X,
  Clock,
  Waves,
  MapPin,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  Crosshair,
  Eye,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Droplets
} from 'lucide-react';
import { MUMBAI_FLOOD_POLYGONS, MUMBAI_ARRIVAL_ZONES, NATIONAL_FLOOD_HOTSPOTS } from '../../data/mockData';
import { useTranslation } from '../../i18n/LanguageContext';

interface FloodMapProps {
  cityCenter: [number, number];
  zoom: number;
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  drainageEdges: DrainageEdge[];
  facilities: CriticalFacility[];
  citizenReports: CitizenReportItem[];
  arrivalZones?: FloodArrivalZone[];
  floodPolygons?: FloodInundationPolygon[];
  activeRoute?: RouteOption | null;
  onSelectRoad: (road: RoadSegment) => void;
  onSelectNode: (node: DrainageNode) => void;
  selectedRoad: RoadSegment | null;
  onSelectCity?: (cityId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
  selectedWard?: string;
}

export const FloodMap: React.FC<FloodMapProps> = ({
  cityCenter,
  zoom,
  roads,
  drainageNodes,
  drainageEdges,
  facilities,
  citizenReports,
  arrivalZones = MUMBAI_ARRIVAL_ZONES,
  floodPolygons = MUMBAI_FLOOD_POLYGONS,
  activeRoute,
  onSelectRoad,
  onSelectNode,
  selectedRoad,
  onSelectCity,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen,
  className,
  selectedWard = 'ALL'
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap style: High-Resolution Satellite Orthophoto (Streets option removed per user requirement)
  const [basemap] = useState<'satellite'>('satellite');

  // Layer Groups
  const nationalHotspotsGroupRef = useRef<L.LayerGroup | null>(null);
  const arrivalHeatmapGroupRef = useRef<L.LayerGroup | null>(null);
  const floodPolygonGroupRef = useRef<L.LayerGroup | null>(null);
  const roadLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drainageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const facilityLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const citizenLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const elevationContourGroupRef = useRef<L.LayerGroup | null>(null);
  const calloutBadgesGroupRef = useRef<L.LayerGroup | null>(null);

  // Time Slider State (0 to 180 min)
  const [timeStep, setTimeStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Layer Visibility Controls
  const [layerVisibility, setLayerVisibility] = useState({
    arrivalHeatmap: true, // Primary request: Flood arrival time heatmap (purple to blue)
    floodPolygons: true,  // 2D Inundation basins & catchments
    floodedRoads: true,   // Road network vector lines
    calloutBadges: true,  // Critical hazard labels on map
    drainageNetwork: true,// Pipes, manholes, pumping stations
    elevationLowlands: true, // Terrain DEM depressions (< 4m MSL)
    criticalFacilities: true, // Hospitals, fire stations, shelters
    citizenReports: true, // Field crowdsourced points
    safeRoutes: true      // Evacuation corridor overlays
  });

  const [showLayerDrawer, setShowLayerDrawer] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [legendActiveTab, setLegendActiveTab] = useState<'depth' | 'arrival' | 'layers'>('depth');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fullscreen support (Controlled or local)
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen;

  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen(prev => !prev);
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Ensure map size recalculates cleanly when entering/exiting fullscreen, tab changes, or window resizing
  useEffect(() => {
    const triggerInvalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };

    triggerInvalidate();
    const t0 = requestAnimationFrame(triggerInvalidate);
    const t1 = setTimeout(triggerInvalidate, 50);
    const t2 = setTimeout(triggerInvalidate, 150);
    const t3 = setTimeout(triggerInvalidate, 350);
    const t4 = setTimeout(triggerInvalidate, 650);

    return () => {
      cancelAnimationFrame(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isFullscreen]);

  // Window resize & container resize observer
  useEffect(() => {
    const triggerInvalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };

    window.addEventListener('resize', triggerInvalidate);

    let observer: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        triggerInvalidate();
      });
      observer.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', triggerInvalidate);
      if (observer) observer.disconnect();
    };
  }, []);

  // Map Probe / Inspection State (Sampling coordinate upon click)
  const [probeData, setProbeData] = useState<{
    lat: number;
    lng: number;
    depthCm: number;
    elevationMsl: number;
    arrivalTimeMin: number;
    locationLabel: string;
    action: string;
  } | null>(null);

  const timeSteps = [0, 30, 60, 90, 120, 150, 180];

  // Arrival time color mapping (Varying intensities of Purple to Blue progression)
  const getArrivalTimeColor = (minutes: number): { fill: string; stroke: string; label: string; textClass: string } => {
    if (minutes <= 15) {
      return { fill: '#4a044e', stroke: '#581c87', label: '0–15 min (Immediate / Surcharging)', textClass: 'text-purple-950 font-bold' }; // Deep royal purple
    }
    if (minutes <= 30) {
      return { fill: '#7c3aed', stroke: '#6d28d9', label: '15–30 min (Rapid Ingress)', textClass: 'text-purple-700 font-bold' }; // Violet purple
    }
    if (minutes <= 60) {
      return { fill: '#4338ca', stroke: '#3730a3', label: '30–60 min (Runoff Crest)', textClass: 'text-indigo-700 font-bold' }; // Indigo blue
    }
    if (minutes <= 120) {
      return { fill: '#1d4ed8', stroke: '#1e40af', label: '1–2 hours (Secondary Flood)', textClass: 'text-blue-700 font-bold' }; // Cobalt blue
    }
    return { fill: '#0284c7', stroke: '#0369a1', label: '2–3 hours (Basin Lag / Backwater)', textClass: 'text-sky-700 font-bold' }; // Sky / Cyan blue
  };

  // Water depth color scale (Light Blue <10cm, Medium Blue 10-50cm, Dark Blue >50cm, Purple Critical >60cm)
  const getDepthColor = (depthCm: number): string => {
    if (depthCm <= 10) return '#38bdf8'; // Light Blue (<10 cm Shallow)
    if (depthCm <= 50) return '#2563eb'; // Medium Blue (10–50 cm Moderate)
    if (depthCm <= 60) return '#1e40af'; // Dark Blue (>50 cm Deep)
    return '#7c3aed'; // Purple (Critical Submerged >60 cm)
  };

  // Basemap URLs - High Resolution Satellite Orthophoto (Streets option removed)
  const basemapUrls = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attrib: '&copy; Esri &copy; Maxar, Earthstar Geographics'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isAllIndia = zoom <= 6 || (cityCenter[0] > 20 && cityCenter[0] < 24 && cityCenter[1] > 77 && cityCenter[1] < 81);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: cityCenter,
        zoom: zoom,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        dragging: true,
        minZoom: 4,
        maxZoom: 19
      });

      // Add base satellite orthophoto tile layer (Streets option removed per requirement)
      baseTileLayerRef.current = L.tileLayer(basemapUrls.satellite.url, {
        attribution: basemapUrls.satellite.attrib,
        maxZoom: 19
      }).addTo(map);

      // Add reference boundaries & places overlay so road names and landmarks are crisp over satellite imagery
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 19,
        opacity: 0.85
      }).addTo(map);

      // Create GIS layer groups in correct hydrological stacking order (bottom to top)
      elevationContourGroupRef.current = L.layerGroup().addTo(map);
      arrivalHeatmapGroupRef.current = L.layerGroup().addTo(map);
      floodPolygonGroupRef.current = L.layerGroup().addTo(map);
      nationalHotspotsGroupRef.current = L.layerGroup().addTo(map);
      drainageLayerGroupRef.current = L.layerGroup().addTo(map);
      roadLayerGroupRef.current = L.layerGroup().addTo(map);
      calloutBadgesGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      facilityLayerGroupRef.current = L.layerGroup().addTo(map);
      citizenLayerGroupRef.current = L.layerGroup().addTo(map);

      // Fit to entire India bounding box if national view
      if (isAllIndia) {
        map.fitBounds([[7.5, 68.0], [36.0, 97.5]], { padding: [24, 24] });
      }

      // Click on map to probe coordinates and sample flood conditions
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Estimate depth based on proximity to low-lying roads or basins
        let closestRoad = roads[0];
        let minDistance = 999999;
        roads.forEach(r => {
          const dist = Math.hypot(r.coordinates[0][0] - lat, r.coordinates[0][1] - lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestRoad = r;
          }
        });

        const estDepth = minDistance < 0.02
          ? (closestRoad.predictedDepthCm[timeStep] ?? closestRoad.currentFloodDepthCm)
          : Math.max(0, Math.round((Math.sin(lat * 50) + Math.cos(lng * 50)) * 8));

        const estElevation = Math.round((closestRoad.elevationMsl + (minDistance * 20)) * 10) / 10;
        const estArrival = closestRoad.floodArrivalTimeMin;

        setProbeData({
          lat: Math.round(lat * 10000) / 10000,
          lng: Math.round(lng * 10000) / 10000,
          depthCm: estDepth,
          elevationMsl: estElevation,
          arrivalTimeMin: estArrival,
          locationLabel: `Near ${closestRoad.name.split('&')[0]} (${closestRoad.ward.split('(')[0]})`,
          action: estDepth > 30 ? 'High inundation risk. Avoid low-lying underpasses.' : 'Normal drainage capacity.'
        });
      });

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    } else {
      if (isAllIndia) {
        mapInstanceRef.current.fitBounds([[7.5, 68.0], [36.0, 97.5]], { padding: [24, 24] });
      } else {
        mapInstanceRef.current.setView(cityCenter, zoom);
      }
      mapInstanceRef.current.invalidateSize();
    }
  }, [cityCenter, zoom]);

  // Smoothly center and zoom map to the selected ward or reset to entire city
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedWard || selectedWard === 'ALL' || selectedWard === 'Entire City') {
      const isAllIndia = zoom <= 6 || (cityCenter[0] > 20 && cityCenter[0] < 24 && cityCenter[1] > 77 && cityCenter[1] < 81);
      if (isAllIndia) {
        map.fitBounds([[7.5, 68.0], [36.0, 97.5]], { padding: [24, 24] });
      } else {
        map.setView(cityCenter, zoom);
      }
      return;
    }

    // Collect coordinates of roads in the selected ward
    const coords: [number, number][] = [];
    roads.forEach(r => {
      if (r.coordinates && r.coordinates.length > 0) {
        coords.push(...r.coordinates);
      }
    });

    if (coords.length > 0) {
      let minLat = 90;
      let maxLat = -90;
      let minLng = 180;
      let maxLng = -180;
      let sumLat = 0;
      let sumLng = 0;

      coords.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        sumLat += lat;
        sumLng += lng;
      });

      const latSpan = maxLat - minLat;
      const lngSpan = maxLng - minLng;

      if (latSpan > 0.005 || lngSpan > 0.005) {
        map.flyToBounds(
          [
            [minLat - 0.004, minLng - 0.004],
            [maxLat + 0.004, maxLng + 0.004]
          ],
          { padding: [50, 50], maxZoom: 15, duration: 0.8 }
        );
      } else {
        map.flyTo([sumLat / coords.length, sumLng / coords.length], 14, { duration: 0.8 });
      }
    }
  }, [selectedWard, roads, cityCenter, zoom]);

  // Handle Play Animation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeStep((prev) => {
          const currentIndex = timeSteps.indexOf(prev);
          if (currentIndex === -1 || currentIndex >= timeSteps.length - 1) {
            return timeSteps[0];
          }
          return timeSteps[currentIndex + 1];
        });
      }, 2400);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Render All Vector GIS Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. RENDER FLOOD ARRIVAL TIME HEATMAP (PURPLE TO BLUE PROGRESSION OVER 0-3H)
    if (arrivalHeatmapGroupRef.current) {
      arrivalHeatmapGroupRef.current.clearLayers();

      if (layerVisibility.arrivalHeatmap && arrivalZones.length > 0) {
        arrivalZones.forEach((zone) => {
          const colorMeta = getArrivalTimeColor(zone.arrivalTimeMin);
          const hasArrived = timeStep >= zone.arrivalTimeMin;
          const isCurrentArrivalWave = timeStep >= zone.arrivalTimeMin && timeStep < zone.arrivalTimeMin + 45;

          // Cap radius at max 220 meters to strictly eliminate excessive dark spot overlays
          const safeRadius = Math.min(zone.radiusMeters, 220);

          // Crisp, subtle wavefront ripple ring with high transparency so roads & streets remain fully visible
          const rippleRing = L.circle(zone.center, {
            radius: safeRadius,
            color: colorMeta.stroke,
            weight: 1.5,
            fillColor: colorMeta.fill,
            fillOpacity: hasArrived ? 0.20 : 0.08,
            dashArray: hasArrived ? '4, 4' : '2, 6'
          });

          // Small central pulse badge with zero visual occlusion of the street map
          const pulseIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: `
              <div class="relative flex items-center justify-center w-5 h-5 -translate-x-2.5 -translate-y-2.5">
                <span class="absolute w-5 h-5 rounded-full animate-ping opacity-40" style="background-color: ${colorMeta.stroke};"></span>
                <span class="relative w-3.5 h-3.5 rounded-full border border-white shadow-sm flex items-center justify-center" style="background-color: ${colorMeta.fill};">
                  <span class="w-1 h-1 rounded-full bg-white"></span>
                </span>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          const pulseMarker = L.marker(zone.center, { icon: pulseIcon });

          // Rich official tooltip
          const tooltipContent = `
            <div class="font-sans text-xs p-1.5 max-w-xs">
              <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 mb-1">
                <span class="font-bold text-slate-900">${zone.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold" style="background-color: ${colorMeta.fill}20; color: ${colorMeta.stroke};">
                  ${zone.arrivalTimeMin === 0 ? 'ACTIVE NOW' : `+${zone.arrivalTimeMin}m ARRIVAL`}
                </span>
              </div>
              <div class="text-slate-600 text-[11px] mb-1">Basin: <strong>${zone.basin}</strong></div>
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5 mb-1 font-mono">
                <div class="flex justify-between">
                  <span>At Timeline (+${timeStep}m):</span>
                  <strong class="${hasArrived ? 'text-purple-800' : 'text-blue-700'}">
                    ${hasArrived ? '🌊 Inundation Front Active' : `Approaching in ~${Math.max(0, zone.arrivalTimeMin - timeStep)} mins`}
                  </strong>
                </div>
                <div class="flex justify-between">
                  <span>Peak Predicted Depth:</span>
                  <strong class="text-red-700">${zone.peakDepthCm} cm</strong>
                </div>
                <div class="flex justify-between">
                  <span>Expected Duration:</span>
                  <span>~${zone.expectedDurationMin} mins</span>
                </div>
              </div>
              <p class="text-[10px] text-slate-500 italic">${zone.riskDescription}</p>
            </div>
          `;

          rippleRing.bindTooltip(tooltipContent, { sticky: true });
          pulseMarker.bindTooltip(tooltipContent, { sticky: true });

          rippleRing.addTo(arrivalHeatmapGroupRef.current!);
          pulseMarker.addTo(arrivalHeatmapGroupRef.current!);
        });
      }
    }

    // 2. RENDER 2D INUNDATION CATCHMENT POLYGONS (Floodplains & Underpass Sumps)
    if (floodPolygonGroupRef.current) {
      floodPolygonGroupRef.current.clearLayers();

      if (layerVisibility.floodPolygons && floodPolygons.length > 0) {
        floodPolygons.forEach((poly) => {
          const depthAtTime = poly.depthCmByTime[timeStep] ?? poly.maxDepthCm * 0.6;
          const color = getDepthColor(depthAtTime);
          const isCritical = poly.criticalUnderpass || depthAtTime >= 50;

          const polygonFeature = L.polygon(poly.polygon, {
            color: color,
            weight: isCritical ? 2.5 : 1.5,
            fillColor: color,
            fillOpacity: depthAtTime > 20 ? 0.45 : 0.25,
            dashArray: depthAtTime > 40 ? undefined : '4, 4'
          });

          polygonFeature.bindTooltip(
            `<div class="font-sans text-xs p-1">
              <div class="font-bold text-slate-900">${poly.name}</div>
              <div class="text-[10px] text-slate-500 font-mono">Ward: ${poly.ward} · Type: ${poly.basinType.replace('_', ' ').toUpperCase()}</div>
              <div class="mt-1 font-mono font-bold text-sm" style="color: ${color};">
                Depth (+${timeStep}m): ${depthAtTime} cm (Gnd: ${poly.elevationMsl}m MSL)
              </div>
              <p class="text-[11px] text-slate-600 mt-1">${poly.description}</p>
            </div>`,
            { sticky: true }
          );

          polygonFeature.addTo(floodPolygonGroupRef.current!);
        });
      }
    }

    // 3. RENDER LOW-ELEVATION TERRAIN CONTOURS (< 4.5m MSL)
    if (elevationContourGroupRef.current) {
      elevationContourGroupRef.current.clearLayers();

      if (layerVisibility.elevationLowlands) {
        // Lowland geographic corridor shading around Mithi River and central depression
        const mithiLowlandCorr = L.polygon([
          [19.048, 72.845], [19.060, 72.865], [19.075, 72.885], [19.088, 72.895],
          [19.095, 72.890], [19.078, 72.875], [19.065, 72.855], [19.050, 72.840]
        ], {
          color: '#3b82f6',
          weight: 1,
          fillColor: '#60a5fa',
          fillOpacity: 0.12,
          dashArray: '3, 6'
        });

        mithiLowlandCorr.bindTooltip(
          `<div class="font-sans text-xs">
            <strong>Mithi River Natural Drainage Corridor</strong>
            <div class="text-[11px] text-slate-600 font-mono">Elevation &lt; 4.0m MSL · Tidal Surcharge Zone</div>
          </div>`,
          { sticky: true }
        );

        mithiLowlandCorr.addTo(elevationContourGroupRef.current);
      }
    }

    // 4. RENDER ROADS VECTOR LAYER
    if (roadLayerGroupRef.current) {
      roadLayerGroupRef.current.clearLayers();

      if (layerVisibility.floodedRoads) {
        roads.forEach((road) => {
          const depthAtTime = road.predictedDepthCm[timeStep] ?? road.currentFloodDepthCm;
          const strokeColor = getDepthColor(depthAtTime);
          const weight = depthAtTime > 40 ? 7 : depthAtTime > 20 ? 5.5 : 4;
          const opacity = depthAtTime > 0 ? 0.95 : 0.6;

          const polyline = L.polyline(road.coordinates, {
            color: strokeColor,
            weight: weight,
            opacity: opacity,
            dashArray: depthAtTime > 40 ? '6, 6' : undefined
          });

          polyline.on('click', () => onSelectRoad(road));

          polyline.bindTooltip(
            `<div class="font-sans text-xs p-1">
              <div class="font-bold text-slate-900">${road.name}</div>
              <div class="text-blue-800 font-bold font-mono mt-0.5">Water Depth: ${depthAtTime} cm (${road.riskLevel})</div>
              <div class="text-[11px] text-slate-600 font-medium">Status: ${road.closureStatus.toUpperCase()} · Ward: ${road.ward}</div>
              <div class="text-[10px] text-slate-500 font-mono">Drain Cap: ${road.drainCapacityM3s} m³/s · Silt: ${road.blockagePct}%</div>
            </div>`,
            { sticky: true }
          );

          polyline.addTo(roadLayerGroupRef.current!);
        });
      }
    }

    // 5. RENDER CALLOUT HAZARD BADGES DIRECTLY ON MAP
    if (calloutBadgesGroupRef.current) {
      calloutBadgesGroupRef.current.clearLayers();

      if (layerVisibility.calloutBadges) {
        // Crisp, non-intrusive flood depth markers for roads with waterlogging
        roads.forEach((road) => {
          const depth = road.predictedDepthCm[timeStep] ?? road.currentFloodDepthCm;
          if (depth <= 0) return;

          const midCoord = road.coordinates[Math.floor(road.coordinates.length / 2)] || road.coordinates[0];
          const isPassable = depth < 15;
          const isCaution = depth >= 15 && depth < 30;
          const isSevere = depth >= 30 && depth <= 60;
          const isImpassable = depth > 60 || road.closureStatus === 'closed';

          const badgeBg = isImpassable
            ? 'bg-red-600 text-white border-red-700 shadow-red-900/30 ring-1 ring-red-300'
            : isSevere
            ? 'bg-orange-600 text-white border-orange-700 shadow-orange-900/30'
            : isCaution
            ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-amber-900/20'
            : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/20';

          const statusIcon = isImpassable ? '🚫' : isSevere ? '🌊' : isCaution ? '⚠️' : '🟢';
          const roadShortName = road.name.split('&')[0].split('(')[0].trim();

          const badgeIcon = L.divIcon({
            className: 'custom-callout-badge',
            html: `
              <div class="cursor-pointer transform hover:scale-105 transition-all flex items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-md border text-[11px] font-bold font-mono whitespace-nowrap ${badgeBg}">
                <span>${statusIcon}</span>
                <span>${roadShortName}: ${depth}cm</span>
              </div>
            `,
            iconSize: [140, 24],
            iconAnchor: [70, 12]
          });

          const marker = L.marker(midCoord, { icon: badgeIcon });
          marker.on('click', () => onSelectRoad(road));
          marker.addTo(calloutBadgesGroupRef.current!);
        });
      }
    }

    // 6. RENDER DRAINAGE NETWORK (PIPES & NODES)
    if (drainageLayerGroupRef.current) {
      drainageLayerGroupRef.current.clearLayers();

      if (layerVisibility.drainageNetwork) {
        drainageEdges.forEach((edge) => {
          const edgeColor = edge.status === 'overflowing' ? '#dc2626' : edge.status === 'surcharged' ? '#ea580c' : '#0284c7';
          const pipeLine = L.polyline(edge.coordinates, {
            color: edgeColor,
            weight: 3.5,
            opacity: 0.85,
            dashArray: '4, 4'
          });

          pipeLine.bindTooltip(
            `<div class="font-sans text-xs">
              <div class="font-bold text-slate-900">${edge.name}</div>
              <div class="font-mono text-slate-700 text-[11px]">Flow: ${edge.currentFlowM3s} / ${edge.maxCapacityM3s} m³/s</div>
              <div class="text-[10px] text-slate-500">Blockage: ${edge.blockagePct}% · Direction: ${edge.flowDirection}</div>
            </div>`,
            { sticky: true }
          );

          pipeLine.addTo(drainageLayerGroupRef.current!);
        });

        drainageNodes.forEach((node) => {
          const isCritical = node.status === 'overflowing' || node.status === 'surcharged';
          const nodeColor = node.status === 'overflowing' ? '#dc2626' : node.status === 'surcharged' ? '#ea580c' : '#0284c7';

          const markerIcon = L.divIcon({
            className: 'custom-drain-icon',
            html: `
              <div class="relative flex items-center justify-center">
                ${isCritical ? '<div class="absolute w-5 h-5 rounded-full bg-red-400/50 animate-ping"></div>' : ''}
                <div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${nodeColor};"></div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const marker = L.marker(node.coordinates, { icon: markerIcon });
          marker.on('click', () => onSelectNode(node));

          marker.bindTooltip(
            `<div class="font-sans text-xs">
              <div class="font-bold text-slate-900">${node.name}</div>
              <div class="text-blue-800 font-mono text-[11px]">Type: ${node.type.toUpperCase()} · Inflow: ${node.currentInflowM3s} m³/s</div>
              <div class="text-slate-600 font-mono text-[10px]">Utilization: ${node.utilizationPct}% · Silt: ${node.blockagePct}%</div>
              ${node.isPumpingActive ? '<div class="text-emerald-700 text-[10px] font-bold">⚡ Pumping Running</div>' : ''}
            </div>`,
            { sticky: true }
          );

          marker.addTo(drainageLayerGroupRef.current!);
        });
      }
    }

    // 7. RENDER EMERGENCY FACILITIES
    if (facilityLayerGroupRef.current) {
      facilityLayerGroupRef.current.clearLayers();

      if (layerVisibility.criticalFacilities) {
        facilities.forEach((fac) => {
          const iconColor = fac.type === 'hospital' ? '#dc2626' : fac.type === 'fire_station' ? '#ea580c' : fac.type === 'shelter' ? '#059669' : '#1d4ed8';
          const label = fac.type === 'hospital' ? 'H' : fac.type === 'fire_station' ? 'F' : fac.type === 'shelter' ? 'S' : 'P';

          const icon = L.divIcon({
            className: 'facility-marker',
            html: `
              <div class="w-6 h-6 rounded shadow-md flex items-center justify-center text-white font-bold text-xs border border-white" style="background-color: ${iconColor};">
                ${label}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker(fac.coordinates, { icon: icon });
          marker.bindPopup(
            `<div class="font-sans p-1 text-xs">
              <div class="font-bold text-slate-900 text-sm mb-1">${fac.name}</div>
              <div class="text-slate-600 mb-1">${fac.address}</div>
              <div class="font-mono text-blue-700 font-bold">Water around facility: ${fac.surroundingFloodDepthCm} cm</div>
              <div class="font-mono text-slate-500 text-[11px]">Emergency Helpline: ${fac.contactNumber}</div>
              <div class="mt-1 text-[11px] font-semibold text-emerald-700">Status: OPERATIONAL</div>
            </div>`
          );

          marker.addTo(facilityLayerGroupRef.current!);
        });
      }
    }

    // 8. RENDER CITIZEN REPORTS
    if (citizenLayerGroupRef.current) {
      citizenLayerGroupRef.current.clearLayers();

      if (layerVisibility.citizenReports) {
        citizenReports.forEach((rep) => {
          const icon = L.divIcon({
            className: 'citizen-marker',
            html: `
              <div class="w-5 h-5 rounded-full bg-amber-500 border border-white shadow-md flex items-center justify-center text-slate-950 font-bold text-[10px]">
                !
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker([rep.latitude, rep.longitude], { icon: icon });
          marker.bindPopup(
            `<div class="font-sans p-1 text-xs max-w-xs">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="font-bold text-amber-800">Citizen Observation</span>
                <span class="text-[10px] text-slate-500 font-mono">${rep.timestamp}</span>
              </div>
              <div class="font-semibold text-slate-900">${rep.locationName}</div>
              <div class="text-blue-800 font-mono font-bold mb-1">Depth: ${rep.floodDepthCm} cm</div>
              <p class="text-slate-600 text-[11px] italic mb-1">"${rep.description}"</p>
              <div class="text-[10px] text-slate-500">Access: <strong>${rep.vehicleAccessibility.toUpperCase()}</strong></div>
            </div>`
          );

          marker.addTo(citizenLayerGroupRef.current!);
        });
      }
    }

    // 9. RENDER ACTIVE ROUTE
    if (routeLayerGroupRef.current) {
      routeLayerGroupRef.current.clearLayers();

      if (activeRoute && layerVisibility.safeRoutes) {
        const routeColor = activeRoute.riskLevel === 'safe' ? '#059669' : activeRoute.riskLevel === 'moderate_risk' ? '#d97706' : '#dc2626';

        const routeLine = L.polyline(activeRoute.pathCoordinates, {
          color: routeColor,
          weight: 6.5,
          opacity: 0.95
        });

        const startMarker = L.circleMarker(activeRoute.pathCoordinates[0], {
          radius: 7,
          color: '#059669',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 3
        });

        const endMarker = L.circleMarker(activeRoute.pathCoordinates[activeRoute.pathCoordinates.length - 1], {
          radius: 7,
          color: '#dc2626',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 3
        });

        routeLine.addTo(routeLayerGroupRef.current);
        startMarker.addTo(routeLayerGroupRef.current);
        endMarker.addTo(routeLayerGroupRef.current);
      }
    }

    // 0. RENDER NATIONAL FLOOD HAZARD HOTSPOTS (When in All-India / National view)
    if (nationalHotspotsGroupRef.current) {
      nationalHotspotsGroupRef.current.clearLayers();

      const isNationalZoom = map.getZoom() <= 8 || (cityCenter[0] > 20 && cityCenter[0] < 24 && cityCenter[1] > 77 && cityCenter[1] < 81);

      if (isNationalZoom && NATIONAL_FLOOD_HOTSPOTS.length > 0) {
        NATIONAL_FLOOD_HOTSPOTS.forEach((hotspot) => {
          const color =
            hotspot.riskLevel === 'CRITICAL' ? '#7e22ce' :
            hotspot.riskLevel === 'SEVERE' ? '#dc2626' :
            hotspot.riskLevel === 'WARNING' ? '#ea580c' :
            hotspot.riskLevel === 'WATCH' ? '#d97706' : '#059669';

          // Outer pulse ring
          const pulseCircle = L.circle(hotspot.coordinates, {
            radius: 40000,
            color: color,
            weight: 2,
            dashArray: '4, 6',
            fillColor: color,
            fillOpacity: 0.15
          });

          // Inner marker icon
          const markerIcon = L.divIcon({
            className: 'custom-national-hotspot-pin',
            html: `
              <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="background-color: ${color}; color: white; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2px solid white; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: white;"></span>
                  <span>${hotspot.cityName}</span>
                  <span style="font-size: 9px; opacity: 0.9; font-family: monospace;">${hotspot.peakDepthCm}cm</span>
                </div>
                <div style="width: 2px; height: 8px; background-color: ${color}; margin-top: 1px;"></div>
              </div>
            `,
            iconSize: [0, 0]
          });

          const marker = L.marker(hotspot.coordinates, { icon: markerIcon });

          const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 4px; min-width: 240px; color: #0f172a;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 13px;">${hotspot.cityName}, ${hotspot.state}</span>
                <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: ${color}20; color: ${color}; font-family: monospace;">${hotspot.riskLevel}</span>
              </div>
              <div style="margin-bottom: 6px; color: #475569; font-size: 11px;">${hotspot.riverBasin}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 6px; font-family: monospace; font-size: 11px;">
                <div>Depth: <strong style="color: #1e3a8a;">${hotspot.peakDepthCm} cm</strong></div>
                <div>Arrival: <strong style="color: #581c87;">+${hotspot.arrivalTimeMin} min</strong></div>
                <div>Rainfall: <strong style="color: #0369a1;">${hotspot.rainfallMmHr} mm/h</strong></div>
                <div>Radar: <strong style="color: #059669;">Operational</strong></div>
              </div>
              <div style="font-size: 11px; margin-bottom: 8px; color: #334155;"><strong>Advisory:</strong> ${hotspot.recommendedAction}</div>
              <button onclick="window.__onZoomToCity && window.__onZoomToCity('${hotspot.cityId}', [${hotspot.coordinates[0]}, ${hotspot.coordinates[1]}])" style="width: 100%; background: #1e3a8a; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
                Switch to ${hotspot.cityName} Flood GIS &rarr;
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          nationalHotspotsGroupRef.current?.addLayer(pulseCircle);
          nationalHotspotsGroupRef.current?.addLayer(marker);
        });
      }
    }
  }, [timeStep, roads, drainageNodes, drainageEdges, facilities, citizenReports, activeRoute, layerVisibility, arrivalZones, floodPolygons]);

  // Register global callback for popup actions
  useEffect(() => {
    (window as any).__onZoomToCity = (cityId: string, coords: [number, number]) => {
      if (onSelectCity) {
        onSelectCity(cityId);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(coords, 12, { duration: 1.5 });
      }
    };
    return () => {
      delete (window as any).__onZoomToCity;
    };
  }, [onSelectCity]);

  // Search & Pan
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const matchedRoad = roads.find(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.ward.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matchedRoad) {
      onSelectRoad(matchedRoad);
      mapInstanceRef.current.flyTo(matchedRoad.coordinates[0], 14, { duration: 1.2 });
      return;
    }

    const matchedZone = arrivalZones.find(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.basin.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matchedZone) {
      mapInstanceRef.current.flyTo(matchedZone.center, 14, { duration: 1.2 });
    }
  };

  // Dedicated Map Controls Actions
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([[7.5, 68.0], [36.0, 97.5]], { padding: [24, 24] });
      setProbeData(null);
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(cityCenter, zoom, { duration: 1 });
      setProbeData(null);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-0 ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen m-0 p-0 rounded-none' : 'rounded-none border-0 z-10'
      } isolate overflow-hidden bg-slate-900 ${className || ''}`}
    >
      {/* Top Search & GIS Toolbar (contained in map z-20 layer) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[calc(100%-24px)] sm:max-w-3xl pointer-events-auto">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
          <input
            type="text"
            placeholder={t('map.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-8 pr-3 py-2 rounded-lg border border-slate-300 shadow-md focus:outline-none focus:border-blue-700"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </form>

        {/* Dedicated Satellite Imagery Indicator (Streets option removed per requirement) */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 text-white rounded-lg border border-slate-700 shadow-md px-2.5 sm:px-3 py-1.5 text-xs font-semibold backdrop-blur-xs select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-amber-300 font-bold whitespace-nowrap">Satellite Orthophoto</span>
        </div>

        {/* Layer Visibility Toggle */}
        <button
          onClick={() => setShowLayerDrawer(!showLayerDrawer)}
          className={`p-2 rounded-lg bg-white border shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            showLayerDrawer ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          title="Toggle GIS Layers"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">{t('map.layers')}</span>
        </button>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`p-2 rounded-lg bg-white border shadow-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            showLegend ? 'text-blue-900 border-blue-400' : 'text-slate-600 border-slate-300'
          }`}
          title="Toggle Flood Depth Legend"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">{t('map.floodDepths')}</span>
        </button>

        {/* Fit India View */}
        <button
          onClick={handleFitIndia}
          className="px-2.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-blue-900 hover:bg-slate-50 shadow-md flex items-center gap-1 text-xs font-semibold cursor-pointer"
          title={t('map.allIndia')}
        >
          <Crosshair className="w-3.5 h-3.5 text-blue-900" />
          <span className="hidden sm:inline">{t('map.allIndia')}</span>
        </button>

        {/* Prominent Fullscreen Option */}
        <button
          onClick={handleToggleFullscreen}
          className={`px-2.5 py-2 rounded-lg border shadow-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            isFullscreen
              ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
              : 'bg-blue-900 hover:bg-blue-800 text-white border-blue-900'
          }`}
          title={isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
          aria-label={isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-300" />}
          <span className="hidden sm:inline">{isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}</span>
        </button>
      </div>

      {/* Obvious Exit Fullscreen control when in fullscreen mode */}
      {isFullscreen && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-2xl transition-all cursor-pointer border border-red-500 hover:scale-105 active:scale-95"
            title={t('map.exitFullscreen')}
            aria-label={t('map.exitFullscreen')}
          >
            <Minimize2 className="w-4 h-4 text-white" />
            <span>{t('map.exitFullscreen')}</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-red-800 px-1.5 py-0.5 rounded font-mono text-red-100 uppercase">
              Esc
            </kbd>
          </button>
        </div>
      )}

      {/* Dedicated Clean Map Controls (Right Side, contained in map z-20 layer) */}
      <div className="absolute right-3 bottom-[74px] sm:bottom-[78px] z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-slate-300 shadow-xl select-none">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-800 hover:text-blue-900 font-bold text-lg transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-800 hover:text-blue-900 font-bold text-lg transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>

        <div className="h-px bg-slate-200 my-0.5" />

        {/* Reset / Fit India */}
        <button
          onClick={handleFitIndia}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-800 hover:text-blue-900 transition-colors cursor-pointer group"
          title="Reset India View"
          aria-label="Reset India View"
        >
          <Crosshair className="w-4 h-4 text-blue-800 group-hover:scale-110 transition-transform" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isFullscreen ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'hover:bg-blue-50 text-slate-800 hover:text-blue-900'
          }`}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Map'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-red-600" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Layer Control Panel Drawer (Top Left) */}
      {showLayerDrawer && (
        <div className="absolute top-14 left-3 z-30 w-80 rounded-xl bg-white border border-slate-300 shadow-2xl p-3.5 text-xs text-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4 text-blue-900" /> GIS Map Layer Control
            </span>
            <button onClick={() => setShowLayerDrawer(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Flood Arrival Heatmap Layer */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-purple-50/70 border border-purple-200 cursor-pointer hover:bg-purple-100/70">
              <span className="text-slate-800 flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-full bg-purple-700" /> Flood Arrival Time Heatmap
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.arrivalHeatmap}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, arrivalHeatmap: e.target.checked })}
                className="rounded accent-purple-700 w-4 h-4"
              />
            </label>

            {/* Inundation Catchments */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500 opacity-60" /> 2D Basin Inundation Areas
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.floodPolygons}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, floodPolygons: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* Flooded Roads */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" /> Flooded Roads &amp; Underpasses
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.floodedRoads}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, floodedRoads: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* On-Map Hazard Callout Badges */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" /> Critical Bottleneck Labels
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.calloutBadges}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, calloutBadges: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* Drainage Network */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-600" /> Drains, Outfalls &amp; Pumps
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.drainageNetwork}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, drainageNetwork: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* Lowland DEM Depressions */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-300 opacity-60" /> Lowland Terrain (&lt; 4m MSL)
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.elevationLowlands}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, elevationLowlands: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* Critical Facilities */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600" /> Hospitals &amp; Emergency Shelters
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.criticalFacilities}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, criticalFacilities: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>

            {/* Safe Routes */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Safe Evacuation Corridors
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.safeRoutes}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, safeRoutes: e.target.checked })}
                className="rounded accent-blue-700 w-4 h-4"
              />
            </label>
          </div>
        </div>
      )}

      {/* Map Probe Inspector Card (Appears when clicking anywhere on the GIS map) */}
      {probeData && (
        <div className="absolute top-14 right-3 z-25 w-80 rounded-xl bg-white border border-blue-300 shadow-2xl p-3.5 text-xs text-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Crosshair className="w-4 h-4 text-blue-700" /> GIS Coordinate Inspector
            </div>
            <button onClick={() => setProbeData(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-900 text-sm">{probeData.locationLabel}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Coord: {probeData.lat}° N, {probeData.lng}° E · Elev: {probeData.elevationMsl}m MSL
            </div>

            <div className="grid grid-cols-2 gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-200 my-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Depth (+{timeStep}m)</span>
                <span className={`text-base font-bold font-mono ${probeData.depthCm >= 30 ? 'text-red-700' : 'text-blue-900'}`}>
                  {probeData.depthCm} cm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Flood Arrival</span>
                <span className="text-base font-bold font-mono text-purple-800">
                  {probeData.arrivalTimeMin === 0 ? 'Active Now' : `+${probeData.arrivalTimeMin} min`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              <strong>Advisory:</strong> {probeData.action}
            </p>
          </div>
        </div>
      )}

      {/* Complete Flood Depth & Inundation Legend (Bottom-Left, positioned cleanly ABOVE the bottom control bar) */}
      {showLegend && (
        <div
          className="absolute bottom-[74px] sm:bottom-[78px] left-3 sm:left-4 z-30 pointer-events-auto bg-[#0b1e36]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-white font-sans min-w-[215px] sm:min-w-[235px] max-w-[265px] transition-all animate-fadeIn"
          style={{
            boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Legend Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                {t('map.floodDepths')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-600/60">
                CWC SOP
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800/60 transition-colors"
                title="Hide Legend"
                aria-label="Hide Legend"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SOP Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 rounded-lg mb-2 text-[10px] font-semibold border border-slate-700/50">
            <button
              onClick={() => setLegendActiveTab('depth')}
              className={`flex-1 py-1 px-1.5 rounded text-center transition-all cursor-pointer ${
                legendActiveTab === 'depth'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('map.floodDepths')}
            </button>
            <button
              onClick={() => setLegendActiveTab('arrival')}
              className={`flex-1 py-1 px-1.5 rounded text-center transition-all cursor-pointer ${
                legendActiveTab === 'arrival'
                  ? 'bg-purple-700 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('map.arrivalTime')}
            </button>
          </div>

          {/* Legend Categories Container with clean internal scroll */}
          <div className="max-h-[min(240px,calc(100vh-210px))] overflow-y-auto space-y-1.5 text-xs pr-0.5 scrollbar-thin">
            {legendActiveTab === 'depth' ? (
              <>
                {/* Purple (Critical) */}
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#7c3aed] border border-purple-300 shadow-[0_0_6px_rgba(124,58,237,0.7)] shrink-0" />
                    <span className="text-slate-100 font-semibold text-[11px]">{t('status.critical')}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-purple-300">&gt; 60 {t('common.cm')}</span>
                </div>

                {/* Dark Blue */}
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#1e40af] border border-blue-400 shrink-0" />
                    <span className="text-slate-100 font-semibold text-[11px]">{t('status.severe')}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-blue-300">&gt; 50 {t('common.cm')}</span>
                </div>

                {/* Medium Blue */}
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#2563eb] border border-blue-300 shrink-0" />
                    <span className="text-slate-200 font-medium text-[11px]">{t('status.warning')}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-blue-200">10 – 50 {t('common.cm')}</span>
                </div>

                {/* Light Blue */}
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#38bdf8] border border-sky-200 shrink-0" />
                    <span className="text-slate-200 font-medium text-[11px]">{t('status.watch')}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-sky-200">&lt; 10 {t('common.cm')}</span>
                </div>
              </>
            ) : (
              <>
                {/* Arrival times */}
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4a044e] border border-purple-400 shrink-0" />
                    <span className="text-purple-200 font-semibold text-[11px]">{t('status.surcharged')}</span>
                  </div>
                  <span className="font-mono text-[10px] text-purple-300 font-bold">0–15 {t('common.mins')}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#7c3aed] border border-purple-300 shrink-0" />
                    <span className="text-purple-200 font-semibold text-[11px]">Rapid Ingress</span>
                  </div>
                  <span className="font-mono text-[10px] text-purple-300 font-bold">15–30 {t('common.mins')}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4338ca] border border-indigo-400 shrink-0" />
                    <span className="text-indigo-200 font-semibold text-[11px]">Runoff Crest</span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-300 font-bold">30–60 {t('common.mins')}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1d4ed8] border border-blue-400 shrink-0" />
                    <span className="text-blue-200 font-semibold text-[11px]">Secondary Wave</span>
                  </div>
                  <span className="font-mono text-[10px] text-blue-300 font-bold">1–2 h</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0284c7] border border-sky-400 shrink-0" />
                    <span className="text-sky-200 font-semibold text-[11px]">Basin Lag</span>
                  </div>
                  <span className="font-mono text-[10px] text-sky-300 font-bold">2–3 h</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Restore Legend Pill (if minimized/hidden) */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-[74px] sm:bottom-[78px] left-3 sm:left-4 z-30 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b1e36]/90 hover:bg-[#0b1e36] text-white border border-slate-700/80 shadow-lg text-xs font-semibold transition-all cursor-pointer hover:border-sky-400"
          title="Show Flood Depths Legend"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>{t('map.mapLegend')}</span>
        </button>
      )}

      {/* Floating 0-3H Time Horizon Scrub Bar (Bottom Center, in its own dedicated safe area with no overlap) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-25 max-w-[calc(100vw-24px)] sm:max-w-none bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl flex items-center gap-2 sm:gap-3.5 text-xs pointer-events-auto">
        {/* Play / Pause Animation */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 sm:p-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-colors flex items-center justify-center shrink-0 shadow cursor-pointer"
          title={isPlaying ? 'Pause animation' : 'Play 3-hour flood progression animation'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Step Buttons: Now, +30m, +60m, +90m, +120m, +150m, +180m */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto">
          {timeSteps.map((step) => {
            const isCurrent = timeStep === step;
            return (
              <button
                key={step}
                onClick={() => {
                  setTimeStep(step);
                  setIsPlaying(false);
                }}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                {step === 0 ? t('common.now') : `+${step}m`}
              </button>
            );
          })}
        </div>

        {/* Forecast Horizon Label: Always clearly visible, responsive text */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3 font-mono text-[11px] sm:text-xs text-blue-950 font-bold whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span className="hidden sm:inline">{t('map.timeHorizon')}: </span>
          <span>+{timeStep} {t('common.mins')}</span>
        </div>
      </div>

      {/* Selected Road Detail Modal Drawer (Right Side) */}
      {selectedRoad && (
        <div className="absolute top-14 right-3 bottom-16 z-30 w-80 sm:w-96 rounded-xl bg-white border border-slate-300 shadow-2xl p-4 overflow-y-auto text-xs text-slate-800 animate-fadeIn">
          <div className="flex items-start justify-between pb-2 border-b border-slate-200 mb-3">
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                selectedRoad.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-300' :
                selectedRoad.riskLevel === 'SEVERE' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                selectedRoad.riskLevel === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {selectedRoad.riskLevel} &middot; {selectedRoad.closureStatus.toUpperCase()}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{selectedRoad.name}</h3>
              <p className="text-slate-500 text-[11px]">{selectedRoad.ward}</p>
            </div>
            <button
              onClick={() => onSelectRoad(null as any)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Water Depth (+{timeStep}m)</span>
              <div className="text-xl font-bold font-mono text-blue-900 mt-0.5">
                {selectedRoad.predictedDepthCm[timeStep] ?? selectedRoad.currentFloodDepthCm} <span className="text-xs font-normal text-slate-500">cm</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Drain Capacity / Silt</span>
              <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                {selectedRoad.drainCapacityM3s} <span className="text-xs text-slate-500">m³/s</span>
              </div>
              <span className="text-[10px] text-amber-700 font-mono">Blockage: {selectedRoad.blockagePct}%</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Flood Arrival</span>
              <div className="text-base font-bold font-mono text-purple-900 mt-0.5">
                {selectedRoad.floodArrivalTimeMin === 0 ? 'Active Now' : `In ${selectedRoad.floodArrivalTimeMin} mins`}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Expected Duration</span>
              <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                ~{selectedRoad.expectedDurationMin} mins
              </div>
            </div>
          </div>

          {/* Official Travel Advisory */}
          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 mb-3">
            <div className="flex items-center gap-1.5 text-blue-900 font-semibold mb-1">
              <Info className="w-3.5 h-3.5" /> Official Traffic &amp; Travel Advisory
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">{selectedRoad.recommendedAction}</p>
          </div>

          {/* Hydrologic Cause Breakdown */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 text-[11px]">
            <span className="font-semibold text-slate-800 font-mono">Hydrologic Surcharge Cause Analysis</span>
            <div className="flex justify-between text-slate-600">
              <span>Rainfall Inflow Weight</span>
              <span className="text-blue-900 font-mono font-bold">{selectedRoad.modelExplanation.rainfallContributionPct}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Underground Drain Capacity Deficit</span>
              <span className="text-amber-800 font-mono font-bold">{selectedRoad.modelExplanation.drainageOverloadPct}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Manhole Silt &amp; Trash Obstruction</span>
              <span className="text-red-700 font-mono font-bold">{selectedRoad.modelExplanation.blockagePct}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Natural Topographic Depression Bowl</span>
              <span className="text-purple-800 font-mono font-bold">{selectedRoad.modelExplanation.terrainDepressionPct}%</span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Accuracy: {selectedRoad.confidenceScore}%</span>
            <span>Elevation: {selectedRoad.elevationMsl}m MSL</span>
            <span>Verified: {selectedRoad.lastUpdated}</span>
          </div>
        </div>
      )}

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
