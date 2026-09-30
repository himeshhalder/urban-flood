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
  PhoneCall
} from 'lucide-react';
import { CityConfig, UserRole } from '../../types';
import { SUPPORTED_CITIES } from '../../data/mockData';

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
              <Settings className="w-5 h-5 text-blue-700" /> Portal Settings &amp; Public Emergency Information
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Configuration
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Manage city selections, rainfall alert levels, warning thresholds, and emergency helplines.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors text-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City & Role */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-700" /> City &amp; User View
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select City</label>
            <select
              value={currentCity.id}
              onChange={(e) => {
                const found = SUPPORTED_CITIES.find(c => c.id === e.target.value);
                if (found) onCityChange(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              {SUPPORTED_CITIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state} ({c.wards.length} Wards)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-slate-600 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div><strong>Radar Station:</strong> {currentCity.radarStation}</div>
            <div><strong>Tidal Reference:</strong> {currentCity.tideStation}</div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">User Operational Role</label>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="citizen">Public Citizen (Standard View)</option>
              <option value="operator">Municipal Operator (Control Room - BMC)</option>
              <option value="emergency_responder">Emergency Services (Fire / Police / NDRF)</option>
              <option value="analyst">Hydrology Analyst (Model Inspection)</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Rain Thresholds */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-700" /> Rainfall Warning Levels (mm/hr)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Watch Alert Level:</span>
                <span className="font-bold font-mono text-amber-700">{watchRainThreshold} mm/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={watchRainThreshold}
                onChange={(e) => setWatchRainThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Warning Alert Level:</span>
                <span className="font-bold font-mono text-orange-700">{warningRainThreshold} mm/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                value={warningRainThreshold}
                onChange={(e) => setWarningRainThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Critical Cloudburst Alert:</span>
                <span className="font-bold font-mono text-red-700">{criticalRainThreshold} mm/hr</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                value={criticalRainThreshold}
                onChange={(e) => setCriticalRainThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>
          </div>
        </div>

        {/* Water Depth Thresholds */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700" /> Road Water Depth Thresholds (cm)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Puddles (Curbside Water):</span>
                <span className="font-bold font-mono text-amber-700">{watchDepthThreshold} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={watchDepthThreshold}
                onChange={(e) => setWatchDepthThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Caution (Small Cars Stall):</span>
                <span className="font-bold font-mono text-orange-700">{warningDepthThreshold} cm</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={warningDepthThreshold}
                onChange={(e) => setWarningDepthThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Danger (Underpass Barrier Closed):</span>
                <span className="font-bold font-mono text-red-700">{criticalDepthThreshold} cm</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={criticalDepthThreshold}
                onChange={(e) => setCriticalDepthThreshold(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>
          </div>
        </div>

        {/* Audio Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-700" /> Notifications &amp; Sound
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={enableAudioAlarms}
                onChange={(e) => setEnableAudioAlarms(e.target.checked)}
                className="rounded accent-blue-700 w-4 h-4"
              />
              <span>Play audible chime when a Critical Flood Alert is issued</span>
            </label>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-slate-700 text-xs">
              <strong>Need Immediate Assistance?</strong>
              <div className="mt-1">
                Call the Municipal Disaster Management Room directly at <span className="font-bold text-blue-900">1916</span> (toll-free, 24/7).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Government Disclaimer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 text-slate-600 leading-relaxed text-xs shadow-xs">
        <div className="text-slate-900 font-bold flex items-center gap-1.5 text-xs mb-1">
          <Info className="w-4 h-4 text-blue-700" /> Official Public Notice
        </div>
        <p>
          &bull; <strong>Decision Support System:</strong> This portal provides simulated nowcasting estimations for urban flooding and is designed for disaster monitoring and public decision-support.
        </p>
        <p>
          &bull; <strong>Official Verification:</strong> Always verify critical ground conditions with local traffic police and BMC Disaster Control (1916).
        </p>
        <p>
          &bull; <strong>Hackathon Demo Data:</strong> Demonstration data is calibrated on historical Mumbai monsoon records and simulated radar sweeps.
        </p>
      </div>
    </div>
  );
};
