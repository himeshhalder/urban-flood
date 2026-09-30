import React from 'react';
import {
  ShieldAlert,
  Waves,
  PhoneCall,
  MapPin,
  Users,
  Lock,
  ArrowRight,
  CloudRain,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Building2,
  ExternalLink,
  Info
} from 'lucide-react';
import { CityConfig, NationalFloodHotspot } from '../../types';
import { NATIONAL_FLOOD_HOTSPOTS } from '../../data/mockData';

interface LandingPageProps {
  onEnterPublic: (cityId?: string) => void;
  onEnterControlRoom: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPublic,
  onEnterControlRoom
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top National Strip */}
      <header className="bg-[#08182f] border-b border-blue-900/60 px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {/* National Tricolor Badge */}
            <span className="flex h-3 w-4.5 rounded-xs overflow-hidden shadow-xs ring-1 ring-white/20">
              <span className="bg-[#ff9933] w-1/3 h-full" />
              <span className="bg-[#ffffff] w-1/3 h-full" />
              <span className="bg-[#128807] w-1/3 h-full" />
            </span>
            <span className="font-semibold text-slate-200 tracking-wide uppercase text-[11px]">
              Ministry of Earth Sciences &middot; Government of India
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/50">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>National Disaster Helpline: 112 / 1070 / 1916</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Doppler Radar Network Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Portal Gateway */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {/* Ministry Official Emblem & Title Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-mono font-medium shadow-inner">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>National Early Warning &amp; Hydraulic Nowcast Service</span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl flex items-center justify-center border-2 border-amber-400/80">
              <Waves className="w-9 h-9 text-blue-900" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-widest text-amber-400 font-bold font-mono">
                Ministry of Earth Sciences
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Urban Flood Nowcasting System
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Disaster Early Warning &middot; 0–3 Hour Rain &amp; Street Flood Forecast across Indian Cities
          </p>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            High-resolution rainfall telemetry, 2D stormwater catchment inundation modeling, street waterlogging depths, and life-safety evacuation corridors.
          </p>
        </div>

        {/* Dual Portal Entry Cards (Citizen vs Ministry) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full mb-12">
          {/* Card 1: Public / Citizen View (NO LOGIN REQUIRED) */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-800/50 border-2 border-emerald-500/40 hover:border-emerald-400 shadow-2xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-emerald-950/40 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider font-mono">
                  No Login Required
                </span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Public Flood Dashboard</h2>
                  <p className="text-xs text-emerald-300 font-medium">For Citizens, Motorists &amp; General Public</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Check immediate flood risks, expected water arrival times, flooded roads &amp; subways, open safe routes, and public safety alerts. Designed for instant public comprehension: <strong className="text-white">View &rarr; Understand &rarr; Act</strong>.
              </p>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Public Features Included:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>0–3h Flood Arrival Map</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Safe Route Navigation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Street Waterlogging Depths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Report Flooding with Photo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Emergency Alerts &amp; SMS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>24/7 Helpline 112 / 1070</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onEnterPublic('all_india')}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all cursor-pointer group-hover:scale-[1.01]"
              >
                <span>Enter Public Flood Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-center mt-2 text-[11px] text-slate-400">
                Direct access &bull; Open for all residents
              </div>
            </div>
          </div>

          {/* Card 2: Ministry Control Room (LOGIN REQUIRED) */}
          <div className="relative group rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-800/50 border-2 border-blue-500/40 hover:border-blue-400 shadow-2xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-blue-950/40 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Authorized Access Only
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-blue-950 text-[10px] font-bold uppercase">
                  MoES Secure
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ministry Control Room</h2>
                  <p className="text-xs text-blue-300 font-medium">For MoES, IMD, CWC &amp; Municipal Command</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Full-featured operations command center with 25 hydrological tools, SCADA pump telemetry, drainage surcharge simulation, radar ingestion, hospital accessibility, and emergency broadcast dispatch.
              </p>

              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">Control Room Operations:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>National Radar Telemetry</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Sump &amp; Lift Pump SCADA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>2D Inundation Basin Polygons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>AI Risk Analysis &amp; Surcharge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Emergency High-Alert Siren</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Critical Infrastructure Triage</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onEnterControlRoom}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-900/50 hover:shadow-blue-900/80 transition-all cursor-pointer group-hover:scale-[1.01]"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Ministry Control Room Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-center mt-2 text-[11px] text-slate-400">
                Official credentials required &bull; 2FA protected
              </div>
            </div>
          </div>
        </div>

        {/* National Flood Situation Snapshot Across Major Urban Basins */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 sm:p-6 mb-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>All India Live Flood Hazard Hotspots &middot; 0–3 Hour Horizon</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time hydrological monitoring by Ministry of Earth Sciences across major metropolitan drainage basins
              </p>
            </div>
            <button
              onClick={() => onEnterPublic('all_india')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <span>View Full National Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {NATIONAL_FLOOD_HOTSPOTS.map((hotspot) => {
              const badgeClass =
                hotspot.riskLevel === 'CRITICAL'
                  ? 'bg-purple-900/60 text-purple-200 border-purple-600'
                  : hotspot.riskLevel === 'SEVERE'
                  ? 'bg-red-900/60 text-red-200 border-red-600'
                  : hotspot.riskLevel === 'WARNING'
                  ? 'bg-orange-900/60 text-orange-200 border-orange-600'
                  : hotspot.riskLevel === 'WATCH'
                  ? 'bg-amber-900/60 text-amber-200 border-amber-600'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-600';

              return (
                <div
                  key={hotspot.id}
                  onClick={() => onEnterPublic(hotspot.cityId)}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/80 transition-all cursor-pointer hover:bg-slate-900 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white group-hover:text-blue-300 transition-colors">
                      {hotspot.cityName}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${badgeClass}`}>
                      {hotspot.riskLevel}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    {hotspot.riverBasin}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1.5 border-t border-slate-800">
                    <div>
                      Depth: <strong className="text-white font-mono">{hotspot.peakDepthCm}cm</strong>
                    </div>
                    <div>
                      Arrival: <strong className="text-purple-300 font-mono">+{hotspot.arrivalTimeMin}m</strong>
                    </div>
                    <div>
                      Rain: <strong className="text-blue-300 font-mono">{hotspot.rainfallMmHr}mm/h</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 24/7 National Emergency & Rescue Helpline Directory */}
        <div className="bg-gradient-to-r from-red-950/60 via-amber-950/40 to-slate-900 rounded-2xl border border-red-600/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-400/50 text-red-400">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Emergency Flood &amp; Rescue Contacts (Toll-Free 24/7)</div>
              <div className="text-xs text-slate-300">
                Direct integration with National Emergency Response System (NERS) &amp; NDRF
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
              National Emergency: <span className="text-white text-sm">112</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
              NDMA Disaster: <span className="text-white text-sm">1070</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
              State Control Room: <span className="text-white text-sm">1077</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
              Municipal Flood Ops: <span className="text-white text-sm">1916</span>
            </div>
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="bg-[#050f1e] border-t border-slate-800 text-slate-400 text-xs py-5 px-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-slate-300">
              Ministry of Earth Sciences (MoES) &middot; Government of India
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Developed in coordination with India Meteorological Department (IMD) &middot; Central Water Commission (CWC) &middot; NDMA
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            National Urban Flood Nowcasting Portal &bull; Version 4.2-Release
          </div>
        </div>
      </footer>
    </div>
  );
};
