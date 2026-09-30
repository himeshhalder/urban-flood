import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  Clock,
  Send,
  Share2,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { AlertItem, AlertStatus } from '../../types';

interface AlertsModuleProps {
  alerts: AlertItem[];
  onUpdateAlertStatus: (alertId: string, newStatus: AlertStatus) => void;
  onBroadcastAlert: (alertTitle: string, channel: 'sms' | 'push' | 'siren') => void;
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({
  alerts,
  onUpdateAlertStatus,
  onBroadcastAlert
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleBroadcast = (alert: AlertItem, channel: 'sms' | 'push' | 'siren') => {
    onBroadcastAlert(alert.title, channel);
    setBroadcastMessage(`Emergency message sent via ${channel.toUpperCase()} for "${alert.title}"`);
    setTimeout(() => setBroadcastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 text-xs">
      {broadcastMessage && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {broadcastMessage}
          </span>
          <button onClick={() => setBroadcastMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-600" /> Municipal Disaster Management Warnings &amp; Alerts
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
              Official Bulletins
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Real-time disaster and public warnings issued by the Ministry of Earth Sciences (MoES) & National Disaster Management Control Room.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg border border-red-200">
            {alerts.filter(a => a.severity === 'critical').length} Critical Warnings
          </span>
          <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg border border-orange-200">
            {alerts.filter(a => a.severity === 'severe').length} Severe Warnings
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search alerts by road or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 w-56 font-medium"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-medium"
          >
            <option value="all">All Warning Levels</option>
            <option value="critical">Critical (Highest)</option>
            <option value="severe">Severe</option>
            <option value="warning">Warning</option>
            <option value="watch">Watch / Advisory</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="new">New (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">Action Underway</option>
            <option value="resolved">Resolved / Cleared</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium text-xs">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isSevere = alert.severity === 'severe';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border shadow-xs transition-all ${
                isCritical
                  ? 'bg-red-50/60 border-red-300'
                  : isSevere
                  ? 'bg-orange-50/60 border-orange-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    isCritical ? 'bg-red-600 text-white' :
                    isSevere ? 'bg-orange-600 text-white' :
                    'bg-amber-600 text-white'
                  }`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Issued: {alert.timeIssued}
                  </span>
                  <span>·</span>
                  <span className="font-bold uppercase text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-slate-700 text-xs mb-3 leading-relaxed">
                {alert.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">Location</span>
                  <span className="text-slate-900 font-bold truncate block">{alert.location}</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">Expected Water Depth</span>
                  <span className="text-red-700 font-bold font-mono text-sm">{alert.predictedDepthCm} cm</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">Time Window</span>
                  <span className="text-slate-800 font-bold">{alert.expectedTime}</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">Model Confidence</span>
                  <span className="text-blue-800 font-bold font-mono">{alert.confidence}%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-3 text-slate-800 text-xs">
                <strong>Public Action Advice: </strong>
                {alert.recommendedAction}
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-xs font-medium">Control Room Action:</span>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'in_progress')}
                    className="px-2.5 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 text-xs font-bold"
                  >
                    Deploy Pump Staff
                  </button>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'resolved')}
                    className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold"
                  >
                    Mark Water Cleared
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-xs font-medium">Citizen Broadcast:</span>
                  <button
                    onClick={() => handleBroadcast(alert, 'push')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Send className="w-3 h-3 text-blue-700" /> Web Push
                  </button>
                  <button
                    onClick={() => handleBroadcast(alert, 'sms')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Share2 className="w-3 h-3 text-blue-700" /> Area SMS
                  </button>
                  <button
                    onClick={() => handleBroadcast(alert, 'siren')}
                    className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 text-xs flex items-center gap-1 font-bold"
                  >
                    <Volume2 className="w-3 h-3 text-red-700" /> Municipal Siren
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
