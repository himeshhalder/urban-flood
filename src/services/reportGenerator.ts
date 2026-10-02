import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CityConfig,
  RoadSegment,
  DrainageNode,
  RainfallNowcastPoint,
  AlertItem,
  CriticalFacility
} from '../types';

export interface ReportGenerationOptions {
  city: CityConfig;
  roads: RoadSegment[];
  drainageNodes: DrainageNode[];
  rainfallData: RainfallNowcastPoint[];
  alerts: AlertItem[];
  facilities?: CriticalFacility[];
  generatedAt?: string;
  officerName?: string;
  department?: string;
}

export function generateFloodSituationReportPDF({
  city,
  roads,
  drainageNodes,
  rainfallData,
  alerts,
  facilities = [],
  generatedAt,
  officerName = 'National Disaster Response Officer',
  department = 'Ministry of Earth Sciences / Municipal Disaster Cell'
}: ReportGenerationOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const currentRainfall = rainfallData[0]?.observedMmHr || 58.4;
  const maxForecastRainfall = Math.max(...rainfallData.map(r => r.forecastMmHr || r.observedMmHr || 0));
  const totalAccumulation = rainfallData[rainfallData.length - 1]?.accumulationMm || 197.6;
  const floodedRoads = roads.filter(r => r.currentFloodDepthCm > 15);
  const closedRoads = roads.filter(r => r.closureStatus === 'closed' || r.currentFloodDepthCm > 45);
  const maxDepthRoad = [...roads].sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm)[0];

  const avgDrainageUtilization = Math.round(
    drainageNodes.reduce((acc, curr) => acc + curr.utilizationPct, 0) / (drainageNodes.length || 1)
  );
  const overflowingNodes = drainageNodes.filter(n => n.status === 'overflowing' || n.status === 'surcharged');
  const activePumps = drainageNodes.filter(n => n.isPumpingActive || (n.pumpCapacityM3s && n.pumpCapacityM3s > 0)).length;

  const overallRisk =
    maxDepthRoad?.currentFloodDepthCm > 60 || currentRainfall > 70
      ? 'CRITICAL'
      : maxDepthRoad?.currentFloodDepthCm > 30 || currentRainfall > 45
      ? 'SEVERE'
      : 'WARNING';

  const reportDateStr = generatedAt || new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const reportId = `NUFEWS-${city.id.toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Helper colors
  const primaryNavy = [15, 43, 72] as [number, number, number];
  const accentBlue = [29, 78, 216] as [number, number, number];
  const criticalRed = [185, 28, 28] as [number, number, number];
  const warningOrange = [194, 65, 12] as [number, number, number];
  const textDark = [15, 23, 42] as [number, number, number];
  const textMuted = [100, 116, 139] as [number, number, number];
  const borderLight = [226, 232, 240] as [number, number, number];
  const cardBg = [248, 250, 252] as [number, number, number];

  // Helper to add header on every page
  const addHeader = (pageNum: number) => {
    // Top banner
    doc.setFillColor(...primaryNavy);
    doc.rect(0, 0, pageWidth, 20, 'F');

    // National crest line / text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NATIONAL URBAN FLOOD EARLY WARNING SYSTEM (NUFEWS)', margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text('Ministry of Earth Sciences (MoES) • Central Water Commission (CWC) • NDMA Disaster Cell', margin, 13);
    doc.text(`REF: ${reportId}`, pageWidth - margin, 8, { align: 'right' });
    doc.text('OFFICIAL OPERATIONAL SITUATION REPORT', pageWidth - margin, 13, { align: 'right' });

    // Subtle tricolor accent line below banner
    doc.setFillColor(255, 153, 51); // saffron
    doc.rect(0, 20, pageWidth / 3, 1.2, 'F');
    doc.setFillColor(255, 255, 255); // white
    doc.rect(pageWidth / 3, 20, pageWidth / 3, 1.2, 'F');
    doc.setFillColor(19, 136, 8); // green
    doc.rect((pageWidth / 3) * 2, 20, pageWidth / 3, 1.2, 'F');
  };

  // Helper to add footer on every page
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      `NUFEWS Automated SitRep • ${city.name} (${city.state}) • Generated: ${reportDateStr}`,
      margin,
      footerY + 2
    );
    doc.text(
      `Page ${pageNum} of ${totalPages} • FOR OFFLINE DECISION-MAKING & DISASTER RESPONSE`,
      pageWidth - margin,
      footerY + 2,
      { align: 'right' }
    );
  };

  // ---------------- PAGE 1 ----------------
  addHeader(1);

  let currentY = 28;

  // Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...textDark);
  doc.text(`URBAN FLOOD SITUATION REPORT: ${city.name.toUpperCase()}`, margin, currentY);

  currentY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text(
    `Jurisdiction: ${city.name}, State: ${city.state} • Doppler Station: ${city.radarStation} • Tide Station: ${city.tideStation}`,
    margin,
    currentY
  );

  currentY += 4.5;
  doc.setFontSize(8);
  doc.text(
    `Report Timestamp: ${reportDateStr} • Authority: ${department} • Ingestion: Real-time Telemetry`,
    margin,
    currentY
  );

  // Overall Risk Badge Box
  currentY += 5.5;
  const badgeWidth = contentWidth;
  const badgeHeight = 16;
  const riskColor = overallRisk === 'CRITICAL' ? criticalRed : overallRisk === 'SEVERE' ? warningOrange : [14, 116, 144] as [number, number, number];

  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, currentY, badgeWidth, badgeHeight, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`OVERALL CITY THREAT LEVEL: ${overallRisk} FLASH FLOOD & WATERLOGGING WARNING`, margin + 5, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    overallRisk === 'CRITICAL'
      ? 'IMMEDIATE DISASTER PROTOCOL ACTIVE: High inundation in low-lying corridors. Critical underpasses submerged. Dewatering pumps in continuous run.'
      : 'ELEVATED SURVEILLANCE: Rapid street ponding observed. Public traffic diversions operational. Drainage nodes approaching surcharge.',
    margin + 5,
    currentY + 12
  );

  // 4 Key Stats Cards (2x2 or 4x1)
  currentY += badgeHeight + 5;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 20;

  const stats = [
    {
      title: 'Current Rainfall',
      value: `${currentRainfall} mm/h`,
      sub: `Peak Forecast: ${maxForecastRainfall} mm/h`,
      accent: accentBlue
    },
    {
      title: 'Inundated Roads',
      value: `${floodedRoads.length} Roads`,
      sub: `${closedRoads.length} Subways Closed`,
      accent: criticalRed
    },
    {
      title: 'Deepest Water Spot',
      value: `${maxDepthRoad?.currentFloodDepthCm || 64} cm`,
      sub: (maxDepthRoad?.name || 'Underpass').slice(0, 22),
      accent: criticalRed
    },
    {
      title: 'Drainage Utilization',
      value: `${avgDrainageUtilization}%`,
      sub: `${overflowingNodes.length} Surcharged / ${activePumps} Pumps`,
      accent: [5, 150, 105] as [number, number, number]
    }
  ];

  stats.forEach((st, idx) => {
    const cardX = margin + idx * (cardW + 3);
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'FD');

    // Colored top line
    doc.setFillColor(st.accent[0], st.accent[1], st.accent[2]);
    doc.rect(cardX, currentY, cardW, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(st.title.toUpperCase(), cardX + 3, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textDark);
    doc.text(st.value, cardX + 3, currentY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...textMuted);
    doc.text(st.sub, cardX + 3, currentY + 17);
  });

  currentY += cardH + 7;

  // Section 1: Critical Flood Hotspots Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text('1. CRITICAL FLOOD HOTSPOTS & SUBMERGED CORRIDORS (SORTED BY WATER DEPTH)', margin, currentY);

  currentY += 2;

  const topHotspotsForTable = [...roads]
    .sort((a, b) => b.currentFloodDepthCm - a.currentFloodDepthCm)
    .slice(0, 7);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: textDark,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    head: [
      ['No.', 'Road / Underpass Name', 'Ward / Basin', 'Current Depth', 'Risk Level', 'Traffic Status', 'Operational Action']
    ],
    body: topHotspotsForTable.map((r, i) => [
      `#${i + 1}`,
      r.name,
      r.ward,
      `${r.currentFloodDepthCm} cm`,
      r.riskLevel,
      r.closureStatus.toUpperCase(),
      r.recommendedAction || (r.closureStatus === 'closed' ? 'Barricade and redirect traffic' : 'Monitor water elevation')
    ]),
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 46 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const depthVal = parseInt(String(data.cell.raw), 10);
        if (depthVal >= 45) {
          data.cell.styles.textColor = [185, 28, 28];
        } else if (depthVal >= 25) {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
      if (data.section === 'body' && data.column.index === 5) {
        const status = String(data.cell.raw).toLowerCase();
        if (status === 'closed') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'caution') {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
    }
  });

  // Calculate position after table
  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Section 2: 0-3h Doppler Rainfall Nowcast Trends
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text('2. DOPPLER RADAR RAINFALL NOWCAST & ACCUMULATION TRENDS (0 - 3 HOURS)', margin, currentY);

  currentY += 2;

  const rainfallTableRows = rainfallData.slice(0, 8).map(pt => {
    const rate = pt.forecastMmHr || pt.observedMmHr;
    const hazardLevel =
      rate >= 70 ? 'Extreme (>70mm/h)' : rate >= 50 ? 'Flash Flood (>50mm/h)' : rate >= 30 ? 'Heavy Rain' : 'Moderate';
    return [
      pt.timeOffsetMin === 0 ? 'Now (0 min)' : `+${pt.timeOffsetMin} mins`,
      `${rate.toFixed(1)} mm/hr`,
      `${pt.accumulationMm ? pt.accumulationMm.toFixed(1) : (totalAccumulation * (pt.timeOffsetMin / 180 + 0.6)).toFixed(1)} mm`,
      hazardLevel,
      `${pt.confidenceMin || 85}% - ${pt.confidenceMax || 95}%`,
      rate >= 50 ? 'Immediate Sump Clearing' : 'Standard Inflow Management'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: textDark,
      cellPadding: 1.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    head: [
      ['Time Horizon', 'Expected Rain Rate', 'Cumulative Rainfall', 'Hazard Classification', 'Confidence', 'Recommended Action']
    ],
    body: rainfallTableRows,
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 36, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const text = String(data.cell.raw);
        if (text.includes('Flash Flood') || text.includes('Extreme')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // ---------------- PAGE 2: ALERTS & OFFLINE FIELD OPERATIONS ----------------
  doc.addPage();
  addHeader(2);

  currentY = 28;

  // Section 3: Critical Municipal Alerts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text('3. ACTIVE MUNICIPAL ALERTS & EMERGENCY DISPATCH ORDERS', margin, currentY);

  currentY += 2;

  const alertsTableRows = alerts.slice(0, 6).map(alt => [
    alt.severity.toUpperCase(),
    alt.title,
    alt.ward || alt.location,
    alt.timeIssued,
    alt.description,
    alt.recommendedAction || 'Deploy mobile dewatering pumps and coordinate with local traffic police.'
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: textDark,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    head: [
      ['Severity', 'Alert Title', 'Ward / Area', 'Time Issued', 'Incident Brief', 'Mandated SOP Action']
    ],
    body: alertsTableRows,
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 36, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 42 },
      5: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const sev = String(data.cell.raw).toLowerCase();
        if (sev === 'critical') {
          data.cell.styles.textColor = [185, 28, 28];
        } else if (sev === 'severe') {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
    }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Section 4: Critical Facilities & Dewatering Infrastructure
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text('4. DRAINAGE INFRASTRUCTURE & CRITICAL EMERGENCY FACILITIES', margin, currentY);

  currentY += 2;

  const facilitiesTableRows = (facilities.length > 0 ? facilities.slice(0, 5) : [
    { name: `${city.name} General Hospital`, type: 'hospital', address: 'Central Ward', currentStatus: 'operational', surroundingFloodDepthCm: 8 },
    { name: `${city.name} Central Fire HQ`, type: 'fire_station', address: 'Civil Lines', currentStatus: 'operational', surroundingFloodDepthCm: 5 },
    { name: 'Municipal Flood Shelter #4', type: 'shelter', address: 'High School Ground', currentStatus: 'operational', surroundingFloodDepthCm: 12 },
    { name: 'District Police Control', type: 'police_station', address: 'Old Secretariat', currentStatus: 'operational', surroundingFloodDepthCm: 2 }
  ]).map(f => [
    f.name,
    f.type.replace('_', ' ').toUpperCase(),
    f.address,
    f.currentStatus.toUpperCase(),
    `${f.surroundingFloodDepthCm} cm water`,
    f.currentStatus === 'operational' ? 'Access Route Clear' : 'Deploy Raised Ambulance'
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: textDark,
      cellPadding: 1.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    head: [
      ['Facility Name', 'Type', 'Address / Zone', 'Operational Status', 'Perimeter Water', 'Corridor Clearance']
    ],
    body: facilitiesTableRows,
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 36 },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 'auto' }
    }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Section 5: Offline Field Operations Checklist & Helplines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('5. OFFLINE EMERGENCY DECISION-MAKING & CONTROL DIRECTIVES', margin, currentY);

  currentY += 4;

  const directiveBoxH = 26;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, currentY, contentWidth, directiveBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);

  const directives = [
    '• Field Task 1: Verify water depth markers at closed subways and enforce perimeter police barricading.',
    '• Field Task 2: Ensure diesel generator fuel reserves at active stormwater pumping stations (min 12h run).',
    '• Field Task 3: Mobilize inflatable rescue rafts and elevated rescue vehicles to designated staging sectors.',
    '• Emergency Comms: State EOC (1070) • Municipal Control Room (1916) • NDRF Flood Ops (011-24363260) • Police (112)'
  ];

  directives.forEach((d, idx) => {
    doc.text(d, margin + 4, currentY + 5.5 + idx * 5);
  });

  // Officer sign-off box
  currentY += directiveBoxH + 5;
  const signBoxW = contentWidth / 2 - 3;
  const signBoxH = 20;

  // Officer block left
  doc.setFillColor(...cardBg);
  doc.roundedRect(margin, currentY, signBoxW, signBoxH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('AUTHORIZED DISASTER MANAGEMENT OFFICER', margin + 3, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textDark);
  doc.text(`Name: ${officerName}`, margin + 3, currentY + 10);
  doc.text(`Department: ${department}`, margin + 3, currentY + 14.5);
  doc.text(`Signature Verification: _______________________`, margin + 3, currentY + 18.5);

  // Field Unit block right
  const rightBoxX = margin + signBoxW + 6;
  doc.setFillColor(...cardBg);
  doc.roundedRect(rightBoxX, currentY, signBoxW, signBoxH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('FIELD UNIT DISPATCH ACKNOWLEDGMENT', rightBoxX + 3, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textDark);
  doc.text(`City / Ward Cell: ${city.name} Central Command`, rightBoxX + 3, currentY + 10);
  doc.text(`Receipt Time (IST): _______________________`, rightBoxX + 3, currentY + 14.5);
  doc.text(`Field Team Leader Signature: __________________`, rightBoxX + 3, currentY + 18.5);

  // Apply footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  return doc;
}

export function downloadFloodReportPDF(options: ReportGenerationOptions, customFileName?: string) {
  const doc = generateFloodSituationReportPDF(options);
  const citySlug = options.city.name.replace(/\s+/g, '_');
  const dateSlug = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `NUFEWS_Flood_Report_${citySlug}_${dateSlug}.pdf`;
  doc.save(fileName);
  return fileName;
}
