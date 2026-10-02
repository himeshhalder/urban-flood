import React, { useState } from 'react';
import {
  Settings,
  Server,
  Radio,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  Info,
  PhoneCall,
  Languages
} from 'lucide-react';
import { CityConfig, UserRole } from '../../types';
import { SUPPORTED_CITIES } from '../../data/mockData';
import { useTranslation, SupportedLanguage } from '../../i18n/LanguageContext';

interface SettingsModuleProps {
  currentCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentCity,
  onCityChange,
  userRole,
  onRoleChange
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [watchRainThreshold, setWatchRainThreshold] = useState(30);
  const [warningRainThreshold, setWarningRainThreshold] = useState(50);
  const [criticalRainThreshold, setCriticalRainThreshold] = useState(75);

  const [watchDepthThreshold, setWatchDepthThreshold] = useState(15);
  const [warningDepthThreshold, setWarningDepthThreshold] = useState(30);
  const [criticalDepthThreshold, setCriticalDepthThreshold] = useState(60);

  const [enableAudioAlarms, setEnableAudioAlarms] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-700" /> {t('settings.title')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Configuration
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            {t('settings.subtitle')}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t('common.save')}</span>
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{t('common.saved')}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & City */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-700" /> {t('settings.language')}
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { code: 'mr', label: 'Marathi', native: 'मराठी' }
            ].map(item => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code as SupportedLanguage)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  language === item.code
                    ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{item.native}</div>
                <div className="text-[10px] text-slate-500">{item.label}</div>
              </button>
            ))}
          </div>

          <h3 className="font-bold text-slate-900 text-sm pt-2 pb-2 border-b border-slate-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-700" /> {t('common.city')} &amp; Role
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">{t('common.city')}</label>
            <select
              value={currentCity.id}
              onChange={(e) => {
                const found = SUPPORTED_CITIES.find(c => c.id === e.target.value);
                if (found) onCityChange(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              {SUPPORTED_CITIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state} ({c.wards.length} Wards)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-slate-600 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div><strong>{t('overview.radar')}:</strong> {currentCity.radarStation}</div>
            <div><strong>Tidal Reference:</strong> {currentCity.tideStation}</div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Operational Role</label>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              <option value="citizen">Public Citizen (Standard Safe Corridors)</option>
              <option value="operator">Municipal Operator (Control Room Command)</option>
              <option value="emergency_responder">Emergency Responder (Priority Vehicle Clearance)</option>
              <option value="analyst">Hydrology Analyst (Doppler Radar &amp; Models)</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Rain Thresholds */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-700" /> {t('settings.thresholds')}
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>{t('settings.watchThreshold')}:</span>
                <span className="font-bold font-mono text-amber-700">{watchRainThreshold} {t('common.mmHr')}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={watchRainThreshold}
                onChange={(e) => setWatchRainThreshold(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>{t('settings.warningThreshold')}:</span>
                <span className="font-bold font-mono text-orange-700">{warningRainThreshold} {t('common.mmHr')}</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={warningRainThreshold}
                onChange={(e) => setWarningRainThreshold(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>{t('settings.criticalThreshold')}:</span>
                <span className="font-bold font-mono text-red-700">{criticalRainThreshold} {t('common.mmHr')}</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                value={criticalRainThreshold}
                onChange={(e) => setCriticalRainThreshold(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                <input
                  type="checkbox"
                  checked={enableAudioAlarms}
                  onChange={(e) => setEnableAudioAlarms(e.target.checked)}
                  className="rounded accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <span>{t('settings.audioAlarms')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
