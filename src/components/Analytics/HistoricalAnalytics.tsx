import React, { useState } from 'react';
import {
  History,
  Calendar,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { HISTORICAL_FLOOD_EVENTS } from '../../data/mockData';

export const HistoricalAnalytics: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('hist-02');

  const selectedEvent =
    HISTORICAL_FLOOD_EVENTS.find((e) => e.id === selectedEventId) || HISTORICAL_FLOOD_EVENTS[0];

  return (
    <div className="space-y-6 text-xs">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-700" /> Past Mumbai Monsoon Floods &amp; System Accuracy Records
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Historical Records
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Reviewing how past extreme rainfall events (2005 Deluge, 2017 Floods, Cyclone Tauktae) performed against our flood models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-700" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
          >
            {HISTORICAL_FLOOD_EVENTS.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.name} ({evt.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Accuracy</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
            {selectedEvent.modelAccuracyPct}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Correctly predicted passability</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Precision</span>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">
            {selectedEvent.precisionPct}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Low false alert rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Recall Rate</span>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">
            {selectedEvent.recallPct}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Flooded roads detected</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">F1 Score</span>
          <span className="text-2xl font-bold font-mono text-purple-700 mt-1 block">
            {selectedEvent.f1Score}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Balanced metric</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Depth Error Margin</span>
          <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">
            &plusmn;{selectedEvent.maeCm} <span className="text-xs font-normal text-slate-500">cm</span>
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Error vs ground gauges</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Area Match (IoU)</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
            {selectedEvent.iouFloodArea}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Spatial overlap</span>
        </div>
      </div>

      {/* Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Event Overview: {selectedEvent.name}
              </h3>
              <span className="text-slate-500 text-xs font-bold">{selectedEvent.date}</span>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs">
              {selectedEvent.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Peak Rain Intensity</span>
                <span className="text-base font-bold text-red-700 font-mono">{selectedEvent.peakRainfallMmHr} mm/hr</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">24h Total Rain</span>
                <span className="text-base font-bold text-blue-900 font-mono">{selectedEvent.total24hRainfallMm} mm</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Observed Flooded Roads</span>
                <span className="text-base font-bold text-slate-800 font-mono">{selectedEvent.observedFloodedRoads}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Model Predicted Roads</span>
                <span className="text-base font-bold text-emerald-700 font-mono">{selectedEvent.predictedFloodedRoads}</span>
              </div>
            </div>
          </div>

          {/* Validation Chart */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Observed vs Predicted Water Depth (cm)</h3>
                <p className="text-slate-500 text-xs">Comparing actual water depth measured by municipal gauges with model estimates</p>
              </div>
            </div>

            <div className="h-52 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="60" x2="580" y2="60" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="100" x2="580" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="40" y1="140" x2="580" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />

                <text x="5" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">120cm</text>
                <text x="10" y="64" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">80cm</text>
                <text x="10" y="104" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">40cm</text>
                <text x="15" y="144" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">0cm</text>

                {[
                  { name: 'Hindmata', obs: 68, pred: 65, x: 70 },
                  { name: "King's Cir", obs: 58, pred: 54, x: 170 },
                  { name: 'Milan Sub', obs: 85, pred: 82, x: 270 },
                  { name: 'Andheri Sub', obs: 95, pred: 92, x: 370 },
                  { name: 'Kurla LBS', obs: 71, pred: 68, x: 470 }
                ].map((item, i) => {
                  const yObs = 140 - (item.obs / 120) * 120;
                  const yPred = 140 - (item.pred / 120) * 120;
                  return (
                    <g key={i}>
                      {/* Actual Observed Bar (Blue) */}
                      <rect x={item.x} y={yObs} width="16" height={140 - yObs} fill="#1d4ed8" rx="2" />
                      {/* Predicted Bar (Sky Blue) */}
                      <rect x={item.x + 20} y={yPred} width="16" height={140 - yPred} fill="#38bdf8" rx="2" />

                      <text x={item.x + 18} y="160" fill="#475569" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {item.name}
                      </text>
                      <text x={item.x + 8} y={yObs - 4} fill="#1e3a8a" fontSize="9" textAnchor="middle" fontWeight="bold">
                        {item.obs}
                      </text>
                      <text x={item.x + 28} y={yPred - 4} fill="#0369a1" fontSize="9" textAnchor="middle" fontWeight="bold">
                        {item.pred}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-900">
                <span className="w-3 h-3 rounded bg-[#1d4ed8]" /> Actual Observed Depth (cm)
              </span>
              <span className="flex items-center gap-1.5 text-sky-700">
                <span className="w-3 h-3 rounded bg-[#38bdf8]" /> Model Predicted Depth (cm)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Validation Summary */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Roadway Prediction Results</h3>
            <p className="text-slate-500 text-xs">Verification across Mumbai streets</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-emerald-800 block font-bold">Correct Flood Warnings</span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">64 Roads</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Accurately detected</span>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <span className="text-[10px] text-red-800 block font-bold">False Alarms</span>
              <span className="text-xl font-bold text-red-900 mt-1 block">6 Roads</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Over-predicted</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] text-amber-800 block font-bold">Unpredicted Spots</span>
              <span className="text-xl font-bold text-amber-900 mt-1 block">4 Roads</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Missed puddles</span>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <span className="text-[10px] text-blue-800 block font-bold">Correct Safe Roads</span>
              <span className="text-xl font-bold text-blue-900 mt-1 block">182 Roads</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Correctly kept open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
