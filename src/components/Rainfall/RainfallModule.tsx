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
  Filter
} from 'lucide-react';
import { RainfallNowcastPoint, CityConfig } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface RainfallModuleProps {
  rainfallSeries: RainfallNowcastPoint[];
  onTriggerRainUpdate: () => void;
  currentCity?: CityConfig;
  selectedWard?: string;
}

export const RainfallModule: React.FC<RainfallModuleProps> = ({
  rainfallSeries,
  onTriggerRainUpdate,
  currentCity,
  selectedWard = 'ALL'
}) => {
  const { t } = useTranslation();
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [secondsUntilNextSweep, setSecondsUntilNextSweep] = useState(30);

  const cityName = currentCity?.name || 'Mumbai';
  const radarStationName = currentCity?.radarStation || 'IMD Doppler Weather Radar';
  const isWardFiltered = selectedWard && selectedWard !== 'ALL' && selectedWard !== 'Entire City';

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

  const currentRain = rainfallSeries[0]?.observedMmHr || rainfallSeries[0]?.forecastMmHr || 58.4;
  const peakForecast = Math.max(...rainfallSeries.map(r => r.forecastMmHr || 0));

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-700" /> {t('rainfall.title')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              {t('common.liveRadarConnected')}
            </span>
            {isWardFiltered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-700" />
                {selectedWard}
              </span>
            )}
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            {t('rainfall.subtitle')} ({cityName})
          </p>
        </div>

        {/* Live Radar Auto-Sweep Control */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right">
            <span className="text-[10px] text-slate-500 font-medium block">{t('rainfall.nextSweep')}</span>
            <span className="font-mono text-blue-900 font-bold text-sm">
              {autoUpdateEnabled ? `00:${secondsUntilNextSweep.toString().padStart(2, '0')}` : t('rainfall.paused')}
            </span>
          </div>

          <button
            onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
            className={`px-3 py-2 rounded-lg font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              autoUpdateEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{autoUpdateEnabled ? t('rainfall.autoRefreshOn') : t('rainfall.paused')}</span>
          </button>

          <button
            onClick={onTriggerRainUpdate}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            title={t('rainfall.scanNow')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">{t('rainfall.intensity')}</span>
            <Wind className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {currentRain} <span className="text-xs font-normal text-slate-500">{t('common.mmHr')}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-600" /> {t('overview.veryHeavyRain')}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">{t('rainfall.peakForecast')}</span>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold font-mono text-red-700 mt-1">
            {peakForecast} <span className="text-xs font-normal text-slate-500">{t('common.mmHr')}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2">
            Peak expected in +45 {t('common.mins')}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">{t('rainfall.cumulativeRain')}</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-800 mt-1">
            +135 <span className="text-xs font-normal text-slate-500">mm total</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2">
            Warning: Over 100mm causes severe ponding
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-700">{t('rainfall.reflectivity')}</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            52 dBZ
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Reflectivity Detected
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Forecast Times */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('overview.expectedRainfallTitle')}</h3>
              <p className="text-slate-500 text-xs">{t('overview.expectedRainfallSubtitle')}</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">{radarStationName}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2">{t('rainfall.timeOffset')}</th>
                  <th className="pb-2">{t('rainfall.forecast')}</th>
                  <th className="pb-2">Confidence Range</th>
                  <th className="pb-2">{t('rainfall.cumulativeRain')}</th>
                  <th className="pb-2 text-right">{t('overview.officialWarning')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rainfallSeries.map((step) => {
                  const isCritical = step.forecastMmHr >= 65;
                  const isSevere = step.forecastMmHr >= 45;
                  const warningBadge = isCritical
                    ? t('status.critical')
                    : isSevere
                    ? t('status.severe')
                    : t('status.watch');

                  return (
                    <tr key={step.timeOffsetMin} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-800">
                        {step.timestamp} ({step.timeOffsetMin === 0 ? t('common.now') : `+${step.timeOffsetMin}m`})
                      </td>
                      <td className="py-2.5 font-bold text-blue-900 font-mono">
                        {step.forecastMmHr} {t('common.mmHr')}
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
                          {warningBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source Feeds */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Meteorological Telemetry Sources</h3>
            <p className="text-slate-500 text-xs">Official real-time sensor streams</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-800">Doppler Weather Radar</div>
                  <div className="text-[11px] text-slate-500">{radarStationName}</div>
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
                  <div className="font-bold text-slate-800">Municipal Rain Gauges</div>
                  <div className="text-[11px] text-slate-500">{cityName} Basin Sensor Mesh</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                ONLINE
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Satellite className="w-4 h-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-800">Satellite Imagery</div>
                  <div className="text-[11px] text-slate-500">INSAT-3D Rapid Scan</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-slate-800">
            <span className="font-bold text-blue-950 flex items-center gap-1.5 mb-1.5 text-xs">
              <History className="w-3.5 h-3.5 text-blue-700" /> Hydrological Cloudburst Reference
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Severe Cloudburst Threshold:</span>
                <strong className="text-red-700 font-mono">100 mm/hr</strong>
              </div>
              <div className="flex justify-between">
                <span>Heavy Monsoon Threshold:</span>
                <strong className="text-orange-700 font-mono">50 mm/hr</strong>
              </div>
              <div className="flex justify-between">
                <span>Current Peak Reading:</span>
                <strong className="text-blue-900 font-mono">{peakForecast} mm/hr</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
