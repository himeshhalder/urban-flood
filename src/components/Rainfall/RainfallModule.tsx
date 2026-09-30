import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Radio,
  Satellite,
  Compass,
  TrendingUp,
  History,
  Activity,
  CheckCircle2,
  RefreshCw,
  Wind,
  Info
} from 'lucide-react';
import { RainfallNowcastPoint } from '../../types';

interface RainfallModuleProps {
  rainfallSeries: RainfallNowcastPoint[];
  onTriggerRainUpdate: () => void;
}

export const RainfallModule: React.FC<RainfallModuleProps> = ({
  rainfallSeries,
  onTriggerRainUpdate
}) => {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [secondsUntilNextSweep, setSecondsUntilNextSweep] = useState(30);

  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const interval = setInterval(() => {
      setSecondsUntilNextSweep((prev) => {
        if (prev <= 1) {
          onTriggerRainUpdate();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoUpdateEnabled, onTriggerRainUpdate]);

  const currentRain = rainfallSeries[0]?.observedMmHr || 58.4;
  const peakForecast = Math.max(...rainfallSeries.map(r => r.forecastMmHr));

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-700" /> Rainfall Nowcast & Rain-Cloud Radar (Next 3 Hours)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              IMD Radar Connected
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Minute-by-minute rainfall forecast for Mumbai using Doppler weather radar and 48 municipal ward rain gauges.
          </p>
        </div>

        {/* Live Radar Auto-Sweep Control */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right">
            <span className="text-[10px] text-slate-500 font-medium block">Next Radar Sweep</span>
            <span className="font-mono text-blue-900 font-bold text-sm">
              {autoUpdateEnabled ? `00:${secondsUntilNextSweep.toString().padStart(2, '0')}` : 'Paused'}
            </span>
          </div>

          <button
            onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
            className={`px-3 py-2 rounded-lg font-bold border transition-colors flex items-center gap-1.5 ${
              autoUpdateEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{autoUpdateEnabled ? 'Auto-Refresh ON' : 'Paused'}</span>
          </button>

          <button
            onClick={onTriggerRainUpdate}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            title="Scan Radar Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">Cloud Movement</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            18.5 <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-600" /> Moving East-Northeast from Arabian Sea
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">Highest Expected Rain</span>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold font-mono text-red-700 mt-1">
            {peakForecast} <span className="text-xs font-normal text-slate-500">mm/hr</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2">
            Peak expected around 15:15 IST (+45 min)
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">Expected 3-Hour Rain</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-800 mt-1">
            +135 <span className="text-xs font-normal text-slate-500">mm total</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2">
            Warning: Over 100mm causes severe waterlogging
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">Doppler Radar Status</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            Active (52 dBZ)
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Intensity Rain Detected
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Forecast Times */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Step-by-Step Rainfall Forecast</h3>
              <p className="text-slate-500 text-xs">Forecast breakdown for each time window</p>
            </div>
            <span className="text-xs text-slate-500">Weather Stations: Santacruz &amp; Colaba AWS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2">Time Window</th>
                  <th className="pb-2">Expected Rain</th>
                  <th className="pb-2">Rain Range</th>
                  <th className="pb-2">Total Accumulated</th>
                  <th className="pb-2 text-right">Warning Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rainfallSeries.map((step) => {
                  const isCritical = step.forecastMmHr >= 65;
                  const isSevere = step.forecastMmHr >= 45;
                  return (
                    <tr key={step.timeOffsetMin} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-800">
                        {step.timestamp}
                      </td>
                      <td className="py-2.5 font-bold text-blue-900 font-mono">
                        {step.forecastMmHr} mm/hr
                      </td>
                      <td className="py-2.5 text-slate-600 font-mono">
                        {step.confidenceMin} – {step.confidenceMax} mm/hr
                      </td>
                      <td className="py-2.5 text-slate-800 font-mono">
                        {step.accumulationMm} mm
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCritical ? 'bg-red-100 text-red-800 border border-red-200' :
                          isSevere ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isCritical ? 'VERY HEAVY' : isSevere ? 'HEAVY' : 'MODERATE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source & Past Cloudbursts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Where Does This Rain Data Come From?</h3>
            <p className="text-slate-500 text-xs">Official meteorological feeds</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-800">Doppler Weather Radar</div>
                  <div className="text-[11px] text-slate-500">IMD Colaba Coastal Radar</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                CONNECTED
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-800">Ground Rain Gauges</div>
                  <div className="text-[11px] text-slate-500">48 Municipal Ward Sensors</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                48/50 SYNCED
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Satellite className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-800">Weather Satellite</div>
                  <div className="text-[11px] text-slate-500">INSAT-3D Cloud Monitoring</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-slate-800">
            <span className="font-bold text-blue-950 flex items-center gap-1.5 mb-1.5 text-xs">
              <History className="w-3.5 h-3.5 text-blue-700" /> Comparison with Past Mumbai Floods
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>July 26, 2005 (Disaster Cloudburst):</span>
                <strong className="text-red-700 font-mono">125 mm/hr</strong>
              </div>
              <div className="flex justify-between">
                <span>August 29, 2017 (City Floods):</span>
                <strong className="text-orange-700 font-mono">84 mm/hr</strong>
              </div>
              <div className="flex justify-between">
                <span>Today's Peak Forecast:</span>
                <strong className="text-blue-900 font-mono">{peakForecast} mm/hr</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
