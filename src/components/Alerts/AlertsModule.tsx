import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  Clock,
  Send,
  Share2,
  Volume2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { AlertItem, AlertStatus, CityConfig } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface AlertsModuleProps {
  alerts: AlertItem[];
  onUpdateAlertStatus: (alertId: string, newStatus: AlertStatus) => void;
  onBroadcastAlert: (alertTitle: string, channel: 'sms' | 'push' | 'siren') => void;
  selectedWard?: string;
  currentCity?: CityConfig;
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({
  alerts,
  onUpdateAlertStatus,
  onBroadcastAlert,
  selectedWard = 'ALL',
  currentCity
}) => {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  const isWardFiltered = selectedWard && selectedWard !== 'ALL' && selectedWard !== 'Entire City';

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
    setBroadcastMessage(`${t('alerts.broadcastSuccess')}: ${channel.toUpperCase()} ("${alert.title}")`);
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
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-600" /> {t('alerts.title')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase">
              {t('common.officialPortal')}
            </span>
            {isWardFiltered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-700" />
                {selectedWard}
              </span>
            )}
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            {t('alerts.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg border border-red-200">
            {alerts.filter(a => a.severity === 'critical').length} {t('alerts.criticalWarnings')}
          </span>
          <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg border border-orange-200">
            {alerts.filter(a => a.severity === 'severe').length} {t('alerts.severeWarnings')}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={t('map.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 w-56 font-medium"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-medium cursor-pointer"
          >
            <option value="all">{t('alerts.allSeverities')}</option>
            <option value="critical">{t('status.critical')} ({t('common.highest', { fallback: 'Highest' }) || 'Highest'})</option>
            <option value="severe">{t('status.severe')}</option>
            <option value="warning">{t('status.warning')}</option>
            <option value="watch">{t('status.watch')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-medium cursor-pointer"
          >
            <option value="all">{t('alerts.allStatus')}</option>
            <option value="new">{t('status.submitted')}</option>
            <option value="acknowledged">{t('status.verified')}</option>
            <option value="in_progress">{t('common.inProgress', { fallback: 'In Progress' }) || 'Action Underway'}</option>
            <option value="resolved">{t('status.resolved')}</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium text-xs">
          {filteredAlerts.length} / {alerts.length} {t('common.alerts', { fallback: 'alerts' }) || 'alerts'}
        </span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isSevere = alert.severity === 'severe';
          const severityLabel = t(`status.${alert.severity}`) || alert.severity;
          const statusLabel = t(`status.${alert.status}`) || alert.status;

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
                    {severityLabel}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t('alerts.timeIssued')}: {alert.timeIssued}
                  </span>
                  <span>·</span>
                  <span className="font-bold uppercase text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {statusLabel}
                  </span>
                </div>
              </div>

              <p className="text-slate-700 text-xs mb-3 leading-relaxed">
                {alert.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">{t('common.loc', { fallback: 'Location' }) || 'Location'}</span>
                  <span className="text-slate-900 font-bold truncate block">{alert.location}</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">{t('routes.maxDepth')}</span>
                  <span className="text-red-700 font-bold font-mono text-sm">{alert.predictedDepthCm} {t('common.cm')}</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">{t('alerts.expectedTime')}</span>
                  <span className="text-slate-800 font-bold">{alert.expectedTime}</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-medium">{t('alerts.confidence')}</span>
                  <span className="text-blue-800 font-bold font-mono">{alert.confidence}%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-3 text-slate-800 text-xs">
                <strong>{t('alerts.recommendedAction')}: </strong>
                {alert.recommendedAction}
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 text-xs font-medium">Control Room:</span>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    {t('status.verified')}
                  </button>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'in_progress')}
                    className="px-2.5 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 text-xs font-bold cursor-pointer"
                  >
                    Deploy Staff
                  </button>
                  <button
                    onClick={() => onUpdateAlertStatus(alert.id, 'resolved')}
                    className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold cursor-pointer"
                  >
                    {t('status.resolved')}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 text-xs font-medium">{t('alerts.broadcastChannel')}:</span>
                  <button
                    onClick={() => handleBroadcast(alert, 'push')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-blue-700" /> Web Push
                  </button>
                  <button
                    onClick={() => handleBroadcast(alert, 'sms')}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 text-blue-700" /> Area SMS
                  </button>
                  <button
                    onClick={() => handleBroadcast(alert, 'siren')}
                    className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 text-xs flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3 text-red-700" /> Siren
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
