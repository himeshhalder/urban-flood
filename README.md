# Urban Flood Nowcasting System (0–3 Hour Prediction)

A high-resolution urban flood nowcasting and disaster decision-support platform that couples precipitation radar extrapolation, high-resolution Digital Elevation Models (DEM), surface runoff hydrology (Rational & Kinematic Wave), underground drainage network graph surcharge (1D Saint-Venant pipe conveyance), and dynamic flood-safe emergency routing.

Built as an operational prototype for municipal disaster management command centers (BMC Mumbai default; configurable for Delhi NCR, Chennai, etc.).

---

## 1. System Architecture

```
                                    +-----------------------------------------+
                                    |     IMD S-Band Doppler Weather Radar    |
                                    |     48x Automated Rain Gauges (AWS)     |
                                    |     INSAT-3D Thermal IR Satellite       |
                                    +-----------------------------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    |     Precipitation Extrapolation (QPN)   |
                                    |     Lagrangian Advection + Z-R Law      |
                                    +-----------------------------------------+
                                                         |
                                                         v
+-----------------------+           +-----------------------------------------+
| High-Res Urban DEM    | --------> | Surface Runoff & Infiltration Engine    |
| (1m LiDAR MSL Grids)  |           | Q = 0.278 * C * I * A (Rational Method) |
+-----------------------+           +-----------------------------------------+
                                                         |
                                                         v
+-----------------------+           +-----------------------------------------+
| 1D Drainage Network   | <-------> | Hydraulic Inlet Capture & Pipe Solver   |
| (Graph Nodes & Edges) |           | Excess Water -> Street Ponding (cm)     |
+-----------------------+           +-----------------------------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    | Disaster Control Room Dashboard (Vite)  |
                                    | GIS Leaflet Vector Map (0-3h Horizon)   |
                                    | Dynamic Wading-Clearance Safe Routing   |
                                    | Crowdsourced Citizen Ground Validation  |
                                    +-----------------------------------------+
```

---

## 2. Directory Structure

```
.
├── backend/
│   ├── graph.py                 # NetworkX drainage directed graph & road routing
│   ├── hydrology.py             # Hydrologic equations & street ponding solver
│   ├── main.py                  # FastAPI REST endpoints & WebSocket /ws/live-updates
│   ├── models.py                # Pydantic schemas for roads, nodes, alerts, reports
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── components/
│   │   ├── Analytics/
│   │   │   └── HistoricalAnalytics.tsx # Validation metrics (MAE, IoU, Accuracy)
│   │   ├── Alerts/
│   │   │   └── AlertsModule.tsx        # Multi-channel alert dispatch (SMS/Push/Siren)
│   │   ├── Citizen/
│   │   │   └── CitizenReporting.tsx    # Crowdsourced photo & depth reports
│   │   ├── Drainage/
│   │   │   └── DrainageModule.tsx      # Surcharge & pipe blockage simulator
│   │   ├── Map/
│   │   │   └── FloodMap.tsx            # Leaflet GIS vector map with 0-3h slider
│   │   ├── Navbar.tsx                  # Emergency toggle, city/ward selectors
│   │   ├── Overview/
│   │   │   └── OverviewDashboard.tsx   # 6 KPI cards & 3h rainfall hyetograph
│   │   ├── Rainfall/
│   │   │   └── RainfallModule.tsx      # 15m intervals & radar sweep telemetry
│   │   ├── Routing/
│   │   │   └── RoutingPlanner.tsx      # Vehicle wading clearance route finder
│   │   ├── Settings/
│   │   │   └── SettingsModule.tsx      # Threshold adjustments & safety notices
│   │   └── Sidebar.tsx                 # Navigation links & system telemetry
│   ├── data/
│   │   └── mockData.ts          # Mumbai road geometries, drainage nodes, alerts
│   ├── services/
│   │   ├── hydrologyEngine.ts   # Client-side coupled hydraulic engine
│   │   └── routingEngine.ts     # Dijkstra routing with flood depth penalty
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── App.tsx                  # Master application container
│   ├── index.css                # Control-room dark styling & Tailwind
│   └── main.tsx                 # Entrypoint
├── docker-compose.yml           # Full-stack orchestrator
├── Dockerfile                   # Multi-stage production container
├── index.html                   # HTML entry with Leaflet styles & Google Fonts
├── metadata.json                # AI Studio application metadata
└── package.json                 # Node dependencies
```

---

## 3. Hydrology & Surcharge Physics Equations

1. **Rational Surface Runoff Calculation:**
   $$Q_{\text{peak}} = 0.278 \times C \times I \times A$$
   where:
   - $Q_{\text{peak}}$ is peak discharge rate ($m^3/s$)
   - $C$ is runoff coefficient (Concrete: 0.90, Asphalt: 0.85, Soil: 0.35, Parks: 0.25)
   - $I$ is rainfall intensity ($mm/hr$)
   - $A$ is catchment basin area ($km^2$)

2. **Drain Inlet Capture & Effective Capacity:**
   $$Q_{\text{effective}} = Q_{\text{pipe}} \times \left(1 - \frac{\text{Blockage}\%}{100}\right)$$

3. **Street Ponding Depth (cm):**
   $$Q_{\text{excess}} = \max(0, Q_{\text{peak}} - Q_{\text{effective}})$$
   $$V_{\text{excess}} = Q_{\text{excess}} \times \Delta t \times \kappa_{\text{dispersion}}$$
   $$\text{Depth} (\text{cm}) = \left(\frac{V_{\text{excess}}}{\text{Road Length} \times \text{Road Width}}\right) \times 100 \times \gamma_{\text{depression}}$$
   where $\gamma_{\text{depression}} = 1.35$ for low-elevation underpass sumps ($< 4.0\text{m MSL}$).

4. **Dynamic Flood-Penalized Safe Routing Weight:**
   $$\text{Weight} = \text{Length} \times \left(1 + \left(\frac{\text{Depth}}{\text{Wading Limit}}\right)^2\right) + \text{Closure Penalty}$$
   Vehicle clearance thresholds:
   - Pedestrian / Walking: 12 cm
   - Sedan / Hatchback: 20 cm
   - Police Interceptor / SUV: 35 cm
   - Municipal Transit Bus: 40 cm
   - Emergency Ambulance: 45 cm
   - Heavy Fire Engine: 60 cm

---

## 4. PostgreSQL / PostGIS Schema

```sql
-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Roads Table
CREATE TABLE roads (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ward VARCHAR(128) NOT NULL,
    length_m NUMERIC(10, 2),
    width_m NUMERIC(6, 2),
    elevation_msl NUMERIC(6, 2),
    impervious_ratio NUMERIC(4, 2) DEFAULT 0.90,
    catchment_area_sqm NUMERIC(12, 2),
    drain_capacity_m3s NUMERIC(8, 2),
    geom GEOMETRY(LineString, 4326) NOT NULL
);

-- 2. Drainage Nodes Table
CREATE TABLE drainage_nodes (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL, -- manhole, pump_station, outfall, etc.
    ground_elevation_msl NUMERIC(6, 2),
    invert_elevation_msl NUMERIC(6, 2),
    max_storage_m3 NUMERIC(12, 2),
    inlet_capacity_m3s NUMERIC(8, 2),
    pump_capacity_m3s NUMERIC(8, 2) DEFAULT 0.0,
    geom GEOMETRY(Point, 4326) NOT NULL
);

-- 3. Drainage Conduits (Edges)
CREATE TABLE drainage_edges (
    id VARCHAR(32) PRIMARY KEY,
    from_node_id VARCHAR(32) REFERENCES drainage_nodes(id),
    to_node_id VARCHAR(32) REFERENCES drainage_nodes(id),
    length_m NUMERIC(10, 2),
    diameter_mm NUMERIC(8, 2),
    slope_pct NUMERIC(6, 3),
    max_capacity_m3s NUMERIC(8, 2),
    geom GEOMETRY(LineString, 4326) NOT NULL
);

-- Spatial Indices
CREATE INDEX idx_roads_geom ON roads USING GIST(geom);
CREATE INDEX idx_nodes_geom ON drainage_nodes USING GIST(geom);
CREATE INDEX idx_edges_geom ON drainage_edges USING GIST(geom);
```

---

## 5. Quickstart & Local Installation

### Prerequisites
- Node.js 18+ and npm
- (Optional for full backend) Python 3.11+, PostgreSQL 16 with PostGIS, and Redis

### Run Frontend Applet
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run with Docker Compose (Full Stack)
```bash
docker-compose up --build
```

---

## 6. Real Sensor & Radar API Integration Guide

To replace mock telemetry with production data streams:
1. **Doppler Radar (IMD / NOAA Nexrad):**
   Connect radar polarimetric reflectivity ($Z_{H}$, $Z_{DR}$) via NetCDF4/HDF5 format in `backend/main.py` using `xarray` and `arm-pyart`.
2. **DEM Elevation:**
   Replace the elevation constant with a GeoTIFF raster lookup using `rasterio` sampled at road coordinates.
3. **SCADA Pump Telemetry:**
   Wire Love Grove, Britannia, and Irla pumping stations to an MQTT or Modbus TCP polling agent that updates `currentInflowM3s` and `isPumpingActive`.
4. **IoT Ultrasonic Depth Gauges:**
   Deploy ultrasonic sensors over bridge culverts and manholes posting to `/api/reports` with high-frequency water level measurements.
