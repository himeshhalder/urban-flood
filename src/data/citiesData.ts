import {
  CityConfig,
  RoadSegment,
  DrainageNode,
  DrainageEdge,
  CriticalFacility,
  RainfallNowcastPoint,
  AlertItem,
  FloodArrivalZone,
  FloodInundationPolygon,
  NationalFloodHotspot
} from '../types';

export interface ExtendedCityConfig extends CityConfig {
  basinName: string;
  isLiveTelemetry: boolean;
  telemetrySource: string;
  emergencyHelpline: string;
}

export const ALL_SUPPORTED_CITIES: ExtendedCityConfig[] = [
  {
    id: 'all_india',
    name: 'All India (National Overview)',
    state: 'National',
    center: [22.5, 79.5],
    zoom: 5,
    wards: ['National Flood Hotspots', 'Major River Basins', 'Doppler Radar Network', 'Coastal Catchments'],
    radarStation: 'IMD National Radar Network (37 Stations Operational)',
    tideStation: 'INCOIS National Coastal & Tidal Telemetry',
    basinName: 'National River & Catchment Basins (Ganga, Brahmaputra, Godavari, Krishna, Narmada, Coastal)',
    isLiveTelemetry: true,
    telemetrySource: 'IMD National Doppler Radar Grid & CWC Telemetry',
    emergencyHelpline: '112 / 1070 (NDMA National Emergency Operations Center)'
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    center: [28.6139, 77.2090],
    zoom: 12,
    wards: ['Central Delhi (ITO)', 'North Delhi (Kashmere Gate)', 'South Delhi (AIIMS / Moolchand)', 'West Delhi (Moti Nagar / Zakhira)', 'East Delhi (Mayur Vihar / Yamuna Bazar)'],
    radarStation: 'IMD Mausam Bhawan C-Band Doppler Radar',
    tideStation: 'Yamuna River Gauge (Old Railway Bridge: 205.33m Danger Level)',
    basinName: 'Yamuna River Floodplain & Barapullah Drainage Catchment',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Doppler Radar & Delhi Jal Board SCADA',
    emergencyHelpline: '1077 (Delhi Disaster Management Authority)'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [19.0178, 72.8478],
    zoom: 12,
    wards: [
      'F/South (Parel / Hindmata)',
      'F/North (Sion / Matunga)',
      'H/East (Bandra E / Milan Subway)',
      'K/West (Andheri W / Subway)',
      'L (Kurla / LBS Marg)',
      'G/North (Dharavi / Dadar)',
      'H/West (Bandra W / Linking Rd)',
      'G/South (Worli / Lower Parel)',
      'A (Colaba / Fort / CST)',
      'K/East (Andheri E / WEH)'
    ],
    radarStation: 'IMD Colaba S-Band Doppler Radar (19.00 N, 72.82 E)',
    tideStation: 'Apollo Bunder Tidal Gauge (High Tide: +4.48m MSL)',
    basinName: 'Mithi River, Mahim Creek & Coastal Catchments (BRIMSTOWAD)',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Colaba & MCGM Automated Weather Stations',
    emergencyHelpline: '1916 (MCGM Disaster Control Room)'
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: [22.5726, 88.3639],
    zoom: 12,
    wards: ['Borough VII (Park Circus / Topsia)', 'Borough IV (Thanthania / College St)', 'Borough IX (Alipore / Kalighat)', 'Borough XI (Tollygunge / Jadavpur)', 'Borough III (Kankurgachi / Ultadanga)'],
    radarStation: 'IMD Kolkata Doppler Weather Radar',
    tideStation: 'Hooghly River Lock Gates & Palmer Bridge Sump',
    basinName: 'Hooghly River & KMC Lock Gates Tidal Drainage Basin',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Kolkata & KMC Drainage Pumping Stations',
    emergencyHelpline: '1070 (WB State Disaster Management)'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0827, 80.2707],
    zoom: 12,
    wards: ['Zone 9 (T. Nagar / Usman Rd)', 'Zone 13 (Adyar / Velachery)', 'Zone 10 (Kodambakkam / Ashok Nagar)', 'Zone 5 (Royapuram / Central)', 'Zone 14 (Perungudi / OMR IT Corridor)'],
    radarStation: 'IMD Chennai Meenambakkam Doppler Radar',
    tideStation: 'Chennai Port & Adyar River Mouth Tidal Gauge',
    basinName: 'Adyar & Cooum River Basins & Buckingham Canal System',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Chennai & GCC Smart City Sensor Network',
    emergencyHelpline: '1913 (Greater Chennai Corporation Control Room)'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: [12.9716, 77.5946],
    zoom: 12,
    wards: ['Mahadevapura (Outer Ring Rd / Bellandur)', 'Bommanahalli (Silk Board / HSR Layout)', 'East Zone (Marathahalli / Varthur)', 'South Zone (Koramangala 4th Block)', 'West Zone (Majestic Underpass / Okalipuram)'],
    radarStation: 'Bengaluru IMD Weather Radar',
    tideStation: 'Bellandur & Varthur Lake Wetland Overflow Weirs',
    basinName: 'Vrishabhavathi, Koramangala-Challaghatta & Hebbal Valley Basins',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Bengaluru & KSNDMC Sensor Mesh',
    emergencyHelpline: '1533 (BBMP Disaster Control Room)'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    center: [17.3850, 78.4867],
    zoom: 12,
    wards: ['Khairatabad (Banjara Hills / Punjagutta)', 'Charminar (Malakpet Underpass / Dabeerpura)', 'Secunderabad (Begumpet / Patny Circle)', 'Serilingampally (Hitec City / Gachibowli)', 'Golconda (Tolichowki / Shaikpet)'],
    radarStation: 'IMD Begumpet Doppler Radar',
    tideStation: 'Hussain Sagar & Musi River Inundation Gauges',
    basinName: 'Musi River Basin & Hussain Sagar Surplus Nala Network',
    isLiveTelemetry: true,
    telemetrySource: 'IMD Begumpet & GHMC Disaster Response Force',
    emergencyHelpline: '040-21111111 (GHMC Monsoon Control Room)'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    center: [23.0225, 72.5714],
    zoom: 12,
    wards: ['West Zone (Mithakhali / Navrangpura)', 'Central Zone (Parimal Underpass / Ellisbridge)', 'North Zone (Akhbarnagar Underpass / Vadaj)', 'South Zone (Maninagar / Kankaria Lake)', 'East Zone (Naroda / Odhav)'],
    radarStation: 'IMD Ahmedabad Radar',
    tideStation: 'Sabarmati Riverfront Barrage & Vasna Sluice Gates',
    basinName: 'Sabarmati River Basin & Chandrabhaga Nala',
    isLiveTelemetry: false,
    telemetrySource: 'AMC Monsoon Hydraulic Model & SCADA Gates',
    emergencyHelpline: '155303 (AMC Emergency Operations Center)'
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    center: [18.5204, 73.8567],
    zoom: 12,
    wards: ['Kasba-Vishrambaug (Shaniwar Peth / Alka Talkies)', 'Shivajinagar (Deccan Gymkhana / Pulachi Wadi)', 'Kothrud (Karve Road / Paud Phata)', 'Sinhagad Road (Ekta Nagar / Vitthalwadi)', 'Hadapsar (Magarpatta / Malwadi)'],
    radarStation: 'IMD Pashan Doppler Radar',
    tideStation: 'Khadakwasla Dam Spillway & Bund Garden Weir',
    basinName: 'Mula-Mutha River Basin & Ambil Odha Stream Catchment',
    isLiveTelemetry: false,
    telemetrySource: 'PMC Disaster Management Cell & CWC Khadakwasla Telemetry',
    emergencyHelpline: '020-25501269 (PMC Disaster Management)'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    center: [26.9124, 75.7873],
    zoom: 12,
    wards: ['Moti Doongri (JLN Marg / Ram Niwas Bagh)', 'Kishanpole (MI Road / Ajmeri Gate)', 'Civil Lines (Sodala Elevated Corridor)', 'Vidyadhar Nagar (Sikar Road Underpass)', 'Sanganer (Tonk Road / Dravyavati Basin)'],
    radarStation: 'IMD Jaipur Doppler Weather Radar',
    tideStation: 'Dravyavati River Ecological Riverfront Gauges',
    basinName: 'Dravyavati (Amanishah Nullah) River Basin',
    isLiveTelemetry: false,
    telemetrySource: 'JDA Dravyavati SCADA & State Remote Sensing Center',
    emergencyHelpline: '0141-2742900 (Jaipur Disaster Cell)'
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    center: [26.8467, 80.9462],
    zoom: 12,
    wards: ['Hazratganj (Vidhan Sabha Marg / GPO)', 'Chowk (Old City / Gomti Riverfront)', 'Alambagh (Nahariya Chauraha / VIP Road)', 'Gomti Nagar (Vibhuti Khand / Kathauta Lake)', 'Charbagh (Station Railway Underpass)'],
    radarStation: 'IMD Amausi Doppler Weather Radar',
    tideStation: 'Gomti River Barrage & Gaughat Pumping Station',
    basinName: 'Gomti River Floodplain & Kukrail Nala Catchment',
    isLiveTelemetry: false,
    telemetrySource: 'LMC Smart City Center & UP State Relief Commissioner',
    emergencyHelpline: '1070 (UP State Relief Commissioner)'
  },
  {
    id: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    center: [21.1702, 72.8311],
    zoom: 12,
    wards: ['Athwa (Ghod Dod Road / Dumas)', 'Rander (Tapi River Basin / Causeway)', 'Central Zone (Chowk Bazar / Makkai Bridge)', 'Katargam (Gajera Circle / Singanpore)', 'Varachha (Hirabaug / Mini Bazar)'],
    radarStation: 'IMD Surat Coastal Weather Radar',
    tideStation: 'Ukai Dam Release Telemetry & Tapi River Weir-cum-Causeway',
    basinName: 'Tapi River Delta & Khadi Tidal Inundation Basin',
    isLiveTelemetry: false,
    telemetrySource: 'SMC Flood Early Warning System (Ukai SCADA)',
    emergencyHelpline: '1800-123-8000 (SMC Emergency Helpline)'
  },
  {
    id: 'kanpur',
    name: 'Kanpur',
    state: 'Uttar Pradesh',
    center: [26.4499, 80.3319],
    zoom: 12,
    wards: ['Civil Lines (Ganga Barrage Road)', 'Sisamau (Sisamau Nala Interception)', 'Govind Nagar (Railway Underpass)', 'Kidwai Nagar (South Kanpur Basin)', 'Kalyanpur (GT Road / IIT Kanpur Corridor)'],
    radarStation: 'IMD Lucknow Regional Doppler Radar',
    tideStation: 'Ganga Barrage Upstream & Downstream River Level Telemetry',
    basinName: 'Ganga River Basin & Pandu River Catchment',
    isLiveTelemetry: false,
    telemetrySource: 'KNN Monsoon Hydraulic Simulation Model',
    emergencyHelpline: '0512-2541258 (Kanpur Nagar Nigam Control Room)'
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    center: [21.1458, 79.0882],
    zoom: 12,
    wards: ['Dharampeth (Nag River / Ambazari Lake Outflow)', 'Sitabuldi (Manish Nagar Underpass)', 'Hanuman Nagar (Narendra Nagar Railway Underbridge)', 'Dhantoli (Congress Nagar / Pili Nadi)', 'Gandhibagh (Itwari / Mahal Lowlands)'],
    radarStation: 'IMD Nagpur S-Band Doppler Radar',
    tideStation: 'Ambazari Lake Overflow Weir & Pili River Gauges',
    basinName: 'Nag River, Pili River & Ambazari Catchment Basin',
    isLiveTelemetry: false,
    telemetrySource: 'NMC Smart City Integrated Command & Control Center',
    emergencyHelpline: '0712-2567011 (NMC Emergency Helpline)'
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    center: [25.5941, 85.1376],
    zoom: 12,
    wards: ['Kankarbagh (Tempo Stand / Shivaji Park)', 'Bankipur (Rajendra Nagar Drainage Sump)', 'New Capital (Boring Canal Road / Bailey Road)', 'Patna City (Saidpur Outfall / Gandhi Ghat)', 'Danapur (Khagaul Road Underpass)'],
    radarStation: 'IMD Patna Doppler Weather Radar',
    tideStation: 'Ganga & Punpun Confluence Gauges (Digha Ghat)',
    basinName: 'Ganga, Son & Punpun River Confluence Lowland Basin',
    isLiveTelemetry: false,
    telemetrySource: 'Bihar State Disaster Management Authority (BSDMA)',
    emergencyHelpline: '1070 / 0612-2547232 (Patna Disaster Control)'
  },
  {
    id: 'indore',
    name: 'Indore',
    state: 'Madhya Pradesh',
    center: [22.7196, 75.8577],
    zoom: 12,
    wards: ['Zone 3 (Rajwada / Kahn River Bank)', 'Zone 7 (Bhawarkua / BRTS Corridor)', 'Zone 9 (Vijay Nagar / Bombay Hospital Ring Rd)', 'Zone 4 (Chhotigwaltoli Railway Underpass)', 'Zone 11 (Palsikar Colony / Saraswati River)'],
    radarStation: 'IMD Bhopal Regional Doppler Radar',
    tideStation: 'Bilawali & Yashwant Sagar Dam Water Level Telemetry',
    basinName: 'Kahn & Saraswati River Urban Catchment Basin',
    isLiveTelemetry: false,
    telemetrySource: 'IMC Smart City Command Center & MP State Disaster Relief',
    emergencyHelpline: '0731-2535555 (Indore Municipal Control Room)'
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    center: [23.2599, 77.4126],
    zoom: 12,
    wards: ['Zone 1 (Upper Lake / VIP Road)', 'Zone 6 (MP Nagar / Chetak Bridge Underpass)', 'Zone 10 (Kolar Road / Kaliyasot Spillway)', 'Zone 3 (Hamidia Hospital / Old City Basin)', 'Zone 8 (Habibganj / BHEL Lowland)'],
    radarStation: 'IMD Bhopal Doppler Weather Radar',
    tideStation: 'Bhadbhada Dam Sluice Gates & Kaliyasot Dam Overflow',
    basinName: 'Upper & Lower Lake Catchment & Kaliyasot River Basin',
    isLiveTelemetry: false,
    telemetrySource: 'BMC Disaster Management & State Hydrology Project',
    emergencyHelpline: '1079 (Bhopal Municipal Corporation Helpline)'
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    state: 'Chandigarh',
    center: [30.7333, 76.7794],
    zoom: 12,
    wards: ['Sector 17 (City Center Underpass)', 'Sector 35 (Madhya Marg / Roundabout)', 'Sector 26 (Grain Market Underpass)', 'Sector 43 (ISBT / Sukhna Choe Corridor)', 'Manimajra (Housing Board / Railway Underbridge)'],
    radarStation: 'IMD Chandigarh Doppler Weather Radar',
    tideStation: 'Sukhna Lake Regulator Floodgates Telemetry',
    basinName: 'Sukhna Choe & Patiala Ki Rao Seasonal Torrent Basins',
    isLiveTelemetry: false,
    telemetrySource: 'Chandigarh Administration Smart City Operations',
    emergencyHelpline: '112 / 0172-2704048 (UT Disaster Control Room)'
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    state: 'Odisha',
    center: [20.2961, 85.8245],
    zoom: 12,
    wards: ['Zone 1 (Jayadev Vihar / Nayapalli Overbridge)', 'Zone 2 (Acharya Vihar / NH-16 Underpass)', 'Zone 3 (Old Town / Daya West Canal)', 'Zone 4 (Patia / Infocity Drainage Corridor)', 'Zone 5 (Rasulgarh / Bomikhal Drain #4)'],
    radarStation: 'IMD Paradip Coastal Doppler Radar',
    tideStation: 'Kuakhai & Daya River Flood Telemetry',
    basinName: 'Mahanadi Delta & Gangua Nallah Primary Drainage Channel',
    isLiveTelemetry: false,
    telemetrySource: 'BMC Integrated Command Center & OSDMA Telemetry',
    emergencyHelpline: '1929 (Bhubaneswar Municipal Corporation Control)'
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    state: 'Assam',
    center: [26.1445, 91.7362],
    zoom: 12,
    wards: ['Ward 20 (Rukminigaon / GS Road)', 'Ward 14 (Zoo Road Tiniali / Bharalu River)', 'Ward 19 (Anil Nagar / Nabin Nagar)', 'Ward 31 (Hatigaon / Basistha River)', 'Ward 8 (Bharalumukh Sluice Gate Outfall)'],
    radarStation: 'IMD Guwahati Doppler Weather Radar',
    tideStation: 'Brahmaputra River Level Gauge (DC Court: 49.68m Danger Mark)',
    basinName: 'Brahmaputra Valley & Bharalu, Mora Bharalu & Basistha Urban Basins',
    isLiveTelemetry: true,
    telemetrySource: 'ASDMA Flash Flood Telemetry & IMD Guwahati Radar',
    emergencyHelpline: '1077 (Guwahati Disaster Management Authority)'
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    center: [9.9312, 76.2673],
    zoom: 12,
    wards: ['Central (MG Road / Ernakulam South)', 'West Kochi (Mattancherry / Fort Kochi)', 'Edappally (Toll Junction / Lulu Mall Corridor)', 'Kaloor (JLN Stadium / Perandoor Canal)', 'Vyttila (Mobility Hub / Sahodaran Ayyappan Rd)'],
    radarStation: 'IMD Kochi Doppler Weather Radar',
    tideStation: 'Vembanad Lake & Cochin Port Tidal Gauge',
    basinName: 'Vembanad Estuary, Perandoor & Mullassery Canal Basins',
    isLiveTelemetry: false,
    telemetrySource: 'Kochi Corporation CSML Smart City & KSDMA Sensor Grid',
    emergencyHelpline: '1077 (Ernakulam District Disaster Management)'
  }
];

// Helper to generate realistic city-specific roads with real hotspots
export function generateCityRoads(city: ExtendedCityConfig): RoadSegment[] {
  const [cLat, cLng] = city.center;
  
  // City-specific notorious flood points
  const cityRoadTemplates: Record<string, { name: string; ward: string; latOffset: number; lngOffset: number; baseDepth: number; elevation: number }[]> = {
    delhi: [
      { name: 'ITO Intersection & Tilak Bridge Underpass', ward: 'Central Delhi (ITO)', latOffset: 0.016, lngOffset: 0.032, baseDepth: 55, elevation: 206.5 },
      { name: 'Minto Bridge Railway Underpass', ward: 'Central Delhi (ITO)', latOffset: 0.021, lngOffset: 0.014, baseDepth: 78, elevation: 204.2 },
      { name: 'Kashmere Gate ISBT & Ring Road', ward: 'North Delhi (Kashmere Gate)', latOffset: 0.052, lngOffset: 0.019, baseDepth: 42, elevation: 207.1 },
      { name: 'AIIMS Flyover Underpass & Ring Road', ward: 'South Delhi (AIIMS / Moolchand)', latOffset: -0.045, lngOffset: -0.005, baseDepth: 28, elevation: 215.4 },
      { name: 'Zakhira Underpass & Rohtak Road', ward: 'West Delhi (Moti Nagar / Zakhira)', latOffset: 0.048, lngOffset: -0.058, baseDepth: 64, elevation: 208.0 },
      { name: 'Pragati Maidan Tunnel & Mathura Road', ward: 'Central Delhi (ITO)', latOffset: 0.005, lngOffset: 0.035, baseDepth: 35, elevation: 208.5 },
      { name: 'Delhi-Noida Direct (DND) Flyway (Safe Corridor)', ward: 'East Delhi (Mayur Vihar / Yamuna Bazar)', latOffset: -0.038, lngOffset: 0.082, baseDepth: 0, elevation: 222.0 }
    ],
    bengaluru: [
      { name: 'Silk Board Junction & Hosur Road Ramp', ward: 'Bommanahalli (Silk Board / HSR Layout)', latOffset: -0.054, lngOffset: 0.032, baseDepth: 48, elevation: 890.0 },
      { name: 'Bellandur EcoSpace Outer Ring Road', ward: 'Mahadevapura (Outer Ring Rd / Bellandur)', latOffset: -0.042, lngOffset: 0.088, baseDepth: 72, elevation: 875.0 },
      { name: 'Koramangala 4th Block 80 Feet Road', ward: 'South Zone (Koramangala 4th Block)', latOffset: -0.038, lngOffset: 0.024, baseDepth: 38, elevation: 885.0 },
      { name: 'Marathahalli Underpass & HAL Airport Road', ward: 'East Zone (Marathahalli / Varthur)', latOffset: -0.015, lngOffset: 0.102, baseDepth: 52, elevation: 882.0 },
      { name: 'Okalipuram 8-Lane Corridor (Safe Route)', ward: 'West Zone (Majestic Underpass / Okalipuram)', latOffset: 0.015, lngOffset: -0.022, baseDepth: 5, elevation: 915.0 },
      { name: 'Hebbal Flyover Elevated Deck (Safe Corridor)', ward: 'North Zone (Hebbal)', latOffset: 0.062, lngOffset: -0.005, baseDepth: 0, elevation: 930.0 }
    ],
    kolkata: [
      { name: 'Thanthania Kalibari & College Street', ward: 'Borough IV (Thanthania / College St)', latOffset: 0.024, lngOffset: -0.008, baseDepth: 65, elevation: 4.5 },
      { name: 'Park Circus 7-Point Crossing', ward: 'Borough VII (Park Circus / Topsia)', latOffset: -0.032, lngOffset: 0.012, baseDepth: 46, elevation: 5.2 },
      { name: 'Ultadanga Underpass & VIP Road', ward: 'Borough III (Kankurgachi / Ultadanga)', latOffset: 0.045, lngOffset: 0.025, baseDepth: 58, elevation: 4.8 },
      { name: 'Tollygunge Circular Road Canal Corridor', ward: 'Borough XI (Tollygunge / Jadavpur)', latOffset: -0.078, lngOffset: -0.015, baseDepth: 34, elevation: 5.8 },
      { name: 'Maa Flyover Elevated Expressway (Safe Corridor)', ward: 'Borough VII (Park Circus / Topsia)', latOffset: -0.022, lngOffset: 0.035, baseDepth: 0, elevation: 18.0 }
    ],
    chennai: [
      { name: 'T. Nagar Usman Road & Ranganathan Street', ward: 'Zone 9 (T. Nagar / Usman Rd)', latOffset: -0.042, lngOffset: -0.038, baseDepth: 62, elevation: 6.2 },
      { name: 'Velachery Main Road & Lake Approach', ward: 'Zone 13 (Adyar / Velachery)', latOffset: -0.105, lngOffset: -0.048, baseDepth: 75, elevation: 4.1 },
      { name: 'Vyasarpadi Ganesapuram Subway', ward: 'Zone 5 (Royapuram / Central)', latOffset: 0.048, lngOffset: -0.025, baseDepth: 84, elevation: 3.8 },
      { name: 'Kodambakkam High Road Underpass', ward: 'Zone 10 (Kodambakkam / Ashok Nagar)', latOffset: -0.035, lngOffset: -0.045, baseDepth: 32, elevation: 7.5 },
      { name: 'Kathipara Grade Separator (Safe Corridor)', ward: 'Zone 12 (Alandur)', latOffset: -0.078, lngOffset: -0.070, baseDepth: 0, elevation: 22.0 }
    ],
    hyderabad: [
      { name: 'Malakpet Railway Underbridge', ward: 'Charminar (Malakpet Underpass / Dabeerpura)', latOffset: -0.018, lngOffset: 0.038, baseDepth: 68, elevation: 495.0 },
      { name: 'Tolichowki Al-Hasnath Colony Main Road', ward: 'Golconda (Tolichowki / Shaikpet)', latOffset: -0.015, lngOffset: -0.082, baseDepth: 54, elevation: 510.0 },
      { name: 'Begumpet Airport Road Underpass', ward: 'Secunderabad (Begumpet / Patny Circle)', latOffset: 0.052, lngOffset: -0.015, baseDepth: 38, elevation: 525.0 },
      { name: 'PVNR Elevated Expressway (Safe Corridor)', ward: 'Mehdipatnam to Airport', latOffset: -0.035, lngOffset: -0.045, baseDepth: 0, elevation: 545.0 }
    ],
    guwahati: [
      { name: 'Rukminigaon GS Road Underpass', ward: 'Ward 20 (Rukminigaon / GS Road)', latOffset: -0.018, lngOffset: 0.045, baseDepth: 82, elevation: 52.0 },
      { name: 'Zoo Road Tiniali & Bharalu Channel', ward: 'Ward 14 (Zoo Road Tiniali / Bharalu River)', latOffset: 0.015, lngOffset: 0.032, baseDepth: 64, elevation: 53.5 },
      { name: 'Anil Nagar & Nabin Nagar Link Road', ward: 'Ward 19 (Anil Nagar / Nabin Nagar)', latOffset: 0.028, lngOffset: 0.015, baseDepth: 90, elevation: 50.8 },
      { name: 'GS Road Supermarket Flyover (Safe Corridor)', ward: 'Dispur Capital Complex', latOffset: -0.025, lngOffset: 0.055, baseDepth: 0, elevation: 75.0 }
    ]
  };

  // Use defined templates or generate balanced city roads around the center
  const templates = cityRoadTemplates[city.id] || [
    { name: `${city.name} Central Railway Underpass`, ward: city.wards[0] || 'Central Area', latOffset: 0.012, lngOffset: 0.015, baseDepth: 58, elevation: 12.0 },
    { name: `${city.name} Old City Canal Corridor`, ward: city.wards[1] || 'Old Basin', latOffset: -0.018, lngOffset: -0.022, baseDepth: 44, elevation: 9.5 },
    { name: `${city.name} Arterial Ring Road Underbridge`, ward: city.wards[2] || 'Ring Road', latOffset: 0.035, lngOffset: -0.025, baseDepth: 32, elevation: 15.0 },
    { name: `${city.name} Transit Station Approach`, ward: city.wards[3] || 'Transit Zone', latOffset: -0.025, lngOffset: 0.035, baseDepth: 22, elevation: 14.2 },
    { name: `${city.name} Elevated Expressway Bypass (Safe Corridor)`, ward: 'Elevated Corridor', latOffset: 0.005, lngOffset: -0.045, baseDepth: 0, elevation: 32.0 }
  ];

  return templates.map((tmpl, idx) => {
    const lat = cLat + tmpl.latOffset;
    const lng = cLng + tmpl.lngOffset;
    const depth = tmpl.baseDepth;
    const riskLevel = depth > 60 ? 'CRITICAL' : depth > 30 ? 'SEVERE' : depth > 15 ? 'WARNING' : 'NORMAL';
    const closureStatus = depth > 50 ? 'closed' : depth > 20 ? 'caution' : 'open';

    return {
      id: `road-${city.id}-${idx + 1}`,
      name: tmpl.name,
      ward: tmpl.ward,
      lengthMeters: 850 + idx * 250,
      widthMeters: 24,
      coordinates: [
        [lat - 0.003, lng - 0.003],
        [lat, lng],
        [lat + 0.003, lng + 0.003]
      ],
      elevationMsl: tmpl.elevation,
      imperviousRatio: 0.90,
      catchmentAreaSqM: 95000,
      drainCapacityM3s: 2.2,
      currentFloodDepthCm: depth,
      predictedDepthCm: {
        0: depth,
        30: Math.round(depth * 1.2),
        60: Math.round(depth * 1.4),
        90: Math.round(depth * 1.3),
        120: Math.round(depth * 0.9),
        150: Math.round(depth * 0.5),
        180: Math.round(depth * 0.2)
      },
      floodArrivalTimeMin: depth > 40 ? 0 : 20 + idx * 10,
      expectedDurationMin: 120 + idx * 15,
      blockagePct: depth > 50 ? 70 : 35,
      riskLevel,
      confidenceScore: 92,
      rainfallMmHr: 45.0,
      connectedNodeId: `node-${city.id}-${idx + 1}`,
      recommendedAction: depth > 50
        ? 'Underpass closed. Divert traffic to elevated flyover corridor. Dewatering pumps active.'
        : depth > 20
        ? 'Exercise caution. Wading depth restricted to heavy transit and emergency vehicles.'
        : 'Passable for all vehicular transit.',
      closureStatus,
      lastUpdated: '1 min ago',
      modelExplanation: {
        rainfallContributionPct: 45,
        drainageOverloadPct: 30,
        blockagePct: 15,
        terrainDepressionPct: 10,
        tidalLockPct: city.state === 'Maharashtra' || city.state === 'Tamil Nadu' || city.state === 'West Bengal' ? 12 : 0
      }
    };
  });
}

// Generate compact non-overlapping arrival zones with REDUCED radii (150-250m) to prevent dark spot overlays!
export function generateCityArrivalZones(city: ExtendedCityConfig): FloodArrivalZone[] {
  const [cLat, cLng] = city.center;
  
  if (city.id === 'all_india') return [];

  return [
    {
      id: `arr-${city.id}-01`,
      name: `${city.name} Central Underpass Basin`,
      basin: `${city.name} Primary Depression`,
      center: [cLat + 0.015, cLng + 0.018],
      radiusMeters: 220, // REDUCED from 1500m to 220m!
      arrivalTimeMin: 0,
      expectedDurationMin: 140,
      peakDepthCm: 68,
      riskDescription: 'Immediate localized underpass accumulation. Automatic floodgates engaged.'
    },
    {
      id: `arr-${city.id}-02`,
      name: `${city.name} Lowland Rail Crossway`,
      basin: `${city.name} Railway Sump`,
      center: [cLat - 0.022, cLng - 0.015],
      radiusMeters: 180, // REDUCED from 1200m to 180m!
      arrivalTimeMin: 15,
      expectedDurationMin: 120,
      peakDepthCm: 52,
      riskDescription: 'Runoff convergence within 15 minutes. High-volume dewatering sump operating.'
    },
    {
      id: `arr-${city.id}-03`,
      name: `${city.name} Riverside Outfall Sump`,
      basin: city.basinName.split('&')[0] || `${city.name} River Basin`,
      center: [cLat + 0.032, cLng - 0.025],
      radiusMeters: 240, // REDUCED from 1500m to 240m!
      arrivalTimeMin: 35,
      expectedDurationMin: 160,
      peakDepthCm: 45,
      riskDescription: 'River backwater lag creates surface ponding after 35 minutes.'
    }
  ];
}

// Generate realistic 2D underpass depression polygons for the city
export function generateCityFloodPolygons(city: ExtendedCityConfig): FloodInundationPolygon[] {
  const [cLat, cLng] = city.center;
  
  if (city.id === 'all_india') return [];

  return [
    {
      id: `poly-${city.id}-01`,
      name: `${city.name} Underpass Holding Basin`,
      ward: city.wards[0] || 'Central',
      polygon: [
        [cLat + 0.013, cLng + 0.015],
        [cLat + 0.017, cLng + 0.016],
        [cLat + 0.018, cLng + 0.021],
        [cLat + 0.014, cLng + 0.020]
      ],
      elevationMsl: 6.2,
      depthCmByTime: { 0: 45, 30: 62, 60: 75, 90: 60, 120: 38, 150: 18, 180: 5 },
      maxDepthCm: 75,
      criticalUnderpass: true,
      basinType: 'underpass_sump',
      description: `Critical low-point underpass basin in ${city.name}. SCADA automated flood barriers and pump sump.`
    },
    {
      id: `poly-${city.id}-02`,
      name: `${city.name} Natural Drainage Floodplain`,
      ward: city.wards[1] || 'Riverside',
      polygon: [
        [cLat - 0.020, cLng - 0.018],
        [cLat - 0.016, cLng - 0.010],
        [cLat - 0.023, cLng - 0.007],
        [cLat - 0.026, cLng - 0.014]
      ],
      elevationMsl: 4.8,
      depthCmByTime: { 0: 25, 30: 42, 60: 55, 90: 48, 120: 30, 150: 12, 180: 0 },
      maxDepthCm: 55,
      criticalUnderpass: false,
      basinType: 'river_floodplain',
      description: `Secondary floodplain retention zone along the ${city.basinName.split('&')[0]}.`
    }
  ];
}

// Generate drainage nodes (pumps, sumps, outfalls)
export function generateCityDrainage(city: ExtendedCityConfig): { nodes: DrainageNode[]; edges: DrainageEdge[] } {
  const [cLat, cLng] = city.center;
  
  if (city.id === 'all_india') return { nodes: [], edges: [] };

  const nodes: DrainageNode[] = [
    {
      id: `node-${city.id}-01`,
      name: `${city.name} Central Heavy Sump Station`,
      type: 'pump_station',
      coordinates: [cLat + 0.015, cLng + 0.018],
      groundElevationMsl: 8.5,
      invertElevationMsl: 2.2,
      currentWaterLevelM: 4.1,
      maxStorageM3: 65000,
      inletCapacityM3s: 14.5,
      currentInflowM3s: 12.8,
      utilizationPct: 88,
      blockagePct: 15,
      status: 'high_utilization',
      connectedRoadId: `road-${city.id}-1`,
      pumpCapacityM3s: 16.0,
      isPumpingActive: true,
      lastInspection: '45 mins ago'
    },
    {
      id: `node-${city.id}-02`,
      name: `${city.name} River Lock & Outfall Sluice`,
      type: 'outfall',
      coordinates: [cLat + 0.032, cLng - 0.025],
      groundElevationMsl: 6.0,
      invertElevationMsl: 1.5,
      currentWaterLevelM: 3.2,
      maxStorageM3: 45000,
      inletCapacityM3s: 18.0,
      currentInflowM3s: 14.2,
      utilizationPct: 79,
      blockagePct: 20,
      status: 'normal',
      connectedRoadId: `road-${city.id}-2`,
      pumpCapacityM3s: 20.0,
      isPumpingActive: true,
      lastInspection: '2 hours ago'
    },
    {
      id: `node-${city.id}-03`,
      name: `${city.name} Rail Crossway Detention Tank`,
      type: 'storage_tank',
      coordinates: [cLat - 0.022, cLng - 0.015],
      groundElevationMsl: 7.2,
      invertElevationMsl: 0.8,
      currentWaterLevelM: 4.8,
      maxStorageM3: 85000,
      inletCapacityM3s: 12.0,
      currentInflowM3s: 11.5,
      utilizationPct: 95,
      blockagePct: 30,
      status: 'surcharged',
      connectedRoadId: `road-${city.id}-3`,
      pumpCapacityM3s: 14.0,
      isPumpingActive: true,
      lastInspection: '1 hour ago'
    }
  ];

  const edges: DrainageEdge[] = [
    {
      id: `edge-${city.id}-01`,
      name: `${city.name} Primary Storm Culvert #1`,
      fromNodeId: `node-${city.id}-01`,
      toNodeId: `node-${city.id}-02`,
      coordinates: [
        [cLat + 0.015, cLng + 0.018],
        [cLat + 0.024, cLng - 0.005],
        [cLat + 0.032, cLng - 0.025]
      ],
      lengthMeters: 1850,
      diameterMm: 2400,
      slopePct: 0.45,
      maxCapacityM3s: 16.0,
      currentFlowM3s: 13.5,
      flowDirection: 'Outfall Gravity Flow',
      blockagePct: 15,
      status: 'normal'
    }
  ];

  return { nodes, edges };
}

// Generate prominent city facilities (Hospitals, Emergency Control Centers)
export function generateCityFacilities(city: ExtendedCityConfig): CriticalFacility[] {
  const [cLat, cLng] = city.center;
  
  if (city.id === 'all_india') return [];

  const facilityNames: Record<string, { name: string; type: 'hospital' | 'fire_station' | 'police_station' | 'shelter'; latOff: number; lngOff: number }[]> = {
    delhi: [
      { name: 'AIIMS New Delhi Emergency Trauma Center', type: 'hospital', latOff: -0.045, lngOff: -0.002 },
      { name: 'Safdarjung Hospital Emergency Wing', type: 'hospital', latOff: -0.048, lngOff: -0.008 },
      { name: 'Delhi Fire Services Headquarters (Connaught Place)', type: 'fire_station', latOff: 0.018, lngOff: 0.012 },
      { name: 'NDMC Community Evacuation Relief Camp (Lodhi Rd)', type: 'shelter', latOff: -0.028, lngOff: 0.025 }
    ],
    bengaluru: [
      { name: 'Manipal Hospital HAL Old Airport Road', type: 'hospital', latOff: -0.018, lngOff: 0.075 },
      { name: 'Victoria Hospital Emergency Complex (KR Market)', type: 'hospital', latOff: -0.005, lngOff: -0.035 },
      { name: 'BBMP Disaster Management Relief Center (Koramangala)', type: 'shelter', latOff: -0.042, lngOff: 0.032 },
      { name: 'Karnataka Fire & Emergency Services HQ', type: 'fire_station', latOff: 0.025, lngOff: 0.015 }
    ],
    kolkata: [
      { name: 'SSKM Medical College & Hospital (IPGMER)', type: 'hospital', latOff: -0.038, lngOff: -0.018 },
      { name: 'Calcutta National Medical College (Park Circus)', type: 'hospital', latOff: -0.030, lngOff: 0.018 },
      { name: 'WB Fire & Emergency Services HQ (Free School St)', type: 'fire_station', latOff: -0.012, lngOff: -0.005 },
      { name: 'Netaji Indoor Stadium Emergency Shelter', type: 'shelter', latOff: -0.008, lngOff: -0.022 }
    ],
    chennai: [
      { name: 'Rajiv Gandhi Government General Hospital (Central)', type: 'hospital', latOff: 0.002, lngOff: 0.015 },
      { name: 'Government Multi Super Speciality Hospital (Omandurar)', type: 'hospital', latOff: -0.015, lngOff: 0.005 },
      { name: 'Tamil Nadu Fire & Rescue Services HQ (Egmore)', type: 'fire_station', latOff: -0.008, lngOff: -0.012 },
      { name: 'Adyar Community Hall Relief Center', type: 'shelter', latOff: -0.078, lngOff: -0.025 }
    ]
  };

  const defaultTemplates = facilityNames[city.id] || [
    { name: `${city.name} Government Civil & Medical Hospital`, type: 'hospital', latOff: 0.008, lngOff: -0.015 },
    { name: `${city.name} Central Fire & Rescue Command Station`, type: 'fire_station', latOff: -0.012, lngOff: 0.018 },
    { name: `${city.name} District Disaster Evacuation Relief Shelter`, type: 'shelter', latOff: -0.025, lngOff: -0.010 }
  ];

  return defaultTemplates.map((fac, idx) => ({
    id: `fac-${city.id}-${idx + 1}`,
    name: fac.name,
    type: fac.type,
    coordinates: [cLat + fac.latOff, cLng + fac.lngOff],
    address: `${fac.name}, ${city.name}, ${city.state}`,
    contactNumber: idx === 0 ? '108 / 102' : idx === 1 ? '101' : '1070',
    capacity: fac.type === 'hospital' ? 850 : 400,
    currentStatus: 'operational',
    surroundingFloodDepthCm: 4 + idx * 3
  }));
}

// Generate tailored city alerts
export function generateCityAlerts(city: ExtendedCityConfig): AlertItem[] {
  if (city.id === 'all_india') {
    return [
      {
        id: 'alt-nat-01',
        severity: 'critical',
        title: 'National Flash Flood Warning: Western Coast & Brahmaputra Catchment',
        location: 'Guwahati, Mumbai, Konkan & Assam Basins',
        ward: 'Multi-State Monsoon Corridor',
        description: 'Severe monsoon surge. Doppler radar indicates 55-80 mm/hr cloudburst convective cells. Automated sluice gates opened across major river barrages.',
        timeIssued: '10 mins ago',
        expectedTime: 'Next 0–3 hours',
        predictedDepthCm: 75,
        recommendedAction: 'NDRF state battalions on high alert. Avoid underpasses and riverfront lowlands. Public advised to monitor safe route corridors.',
        confidence: 96,
        status: 'new',
        alertType: 'flash_flood'
      },
      {
        id: 'alt-nat-02',
        severity: 'warning',
        title: 'Yamuna & Gangetic Plain Watch Bulletin',
        location: 'Delhi NCR, Kanpur, Patna',
        ward: 'Yamuna & Ganga River Basins',
        description: 'Hathnikund barrage discharges approaching Delhi territory. CWC water levels at Old Railway Bridge monitoring active.',
        timeIssued: '35 mins ago',
        expectedTime: 'Next 2–6 hours',
        predictedDepthCm: 45,
        recommendedAction: 'Evacuation teams on alert in low-lying floodplain hutments. Sump pump stations operating at full speed.',
        confidence: 91,
        status: 'new',
        alertType: 'heavy_rainfall'
      }
    ];
  }

  return [
    {
      id: `alt-${city.id}-01`,
      severity: 'critical',
      title: `${city.name}: Flash Flood Warning for Arterial Underpasses`,
      location: `${city.name} Central Depression & Rail Underpasses`,
      ward: city.wards[0] || 'Central Basin',
      description: `Intense localized rainfall detected by ${city.radarStation}. Projected water depth exceeding 50cm in key underpasses. SCADA pumps running at 100% capacity.`,
      timeIssued: '5 mins ago',
      expectedTime: 'Next 0–45 mins',
      predictedDepthCm: 62,
      recommendedAction: `Avoid submerged underpasses. Use designated elevated corridors. Dial ${city.emergencyHelpline} for emergency rescue.`,
      confidence: 95,
      status: 'new',
      alertType: 'road_flooding'
    },
    {
      id: `alt-${city.id}-02`,
      severity: 'warning',
      title: `${city.name}: Drainage Outfall High Water Advisory`,
      location: city.basinName,
      ward: city.wards[1] || 'Catchment Zone',
      description: `Runoff crest approaching primary stormwater canals. Gravity discharge restricted due to high basin water levels.`,
      timeIssued: '20 mins ago',
      expectedTime: 'Next 1–2 hours',
      predictedDepthCm: 35,
      recommendedAction: 'Municipal mobile auxiliary dewatering trucks deployed to low-lying residential clusters.',
      confidence: 88,
      status: 'new',
      alertType: 'drain_surcharge'
    }
  ];
}

// Generate rainfall nowcast series for city
export function generateCityRainfall(city: ExtendedCityConfig): RainfallNowcastPoint[] {
  const isHighRain = city.id === 'mumbai' || city.id === 'guwahati' || city.id === 'kochi';
  const baseRate = isHighRain ? 52.0 : city.id === 'jaipur' || city.id === 'ahmedabad' ? 18.0 : 38.0;

  const steps = [0, 15, 30, 45, 60, 90, 120, 150, 180];
  let acc = 0;

  return steps.map((offset) => {
    const factor = offset === 30 || offset === 45 ? 1.35 : offset > 100 ? 0.6 : 1.0;
    const forecastMmHr = Math.round(baseRate * factor * 10) / 10;
    const observedMmHr = offset === 0 ? forecastMmHr : Math.max(0, forecastMmHr + (Math.random() - 0.5) * 4);
    acc += (forecastMmHr / 60) * (offset === 0 ? 15 : offset - (steps[steps.indexOf(offset) - 1] || 0));

    return {
      timeOffsetMin: offset,
      timestamp: `+${offset} min`,
      observedMmHr: Math.round(observedMmHr * 10) / 10,
      forecastMmHr,
      confidenceMin: Math.max(5, Math.round(forecastMmHr * 0.8)),
      confidenceMax: Math.round(forecastMmHr * 1.25),
      accumulationMm: Math.round(acc * 10) / 10,
      thresholdCriticalMmHr: 40.0
    };
  });
}
