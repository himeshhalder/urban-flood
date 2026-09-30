import React, { useState } from 'react';
import {
  FileText,
  Camera,
  CheckCircle2,
  ThumbsUp,
  User,
  AlertCircle
} from 'lucide-react';
import { CitizenReportItem, ReportStatus } from '../../types';

interface CitizenReportingProps {
  reports: CitizenReportItem[];
  onSubmitReport: (newReport: CitizenReportItem) => void;
  onUpdateReportStatus: (reportId: string, status: ReportStatus) => void;
  onUpvoteReport: (reportId: string) => void;
}

export const CitizenReporting: React.FC<CitizenReportingProps> = ({
  reports,
  onSubmitReport,
  onUpdateReportStatus,
  onUpvoteReport
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [roadName, setRoadName] = useState('Hindmata Junction');
  const [locationName, setLocationName] = useState('Opposite Dadar Fire Station');
  const [ward, setWard] = useState('F/South (Parel)');
  const [floodDepth, setFloodDepth] = useState<number>(35);
  const [description, setDescription] = useState('');
  const [flowDirection, setFlowDirection] = useState<'north' | 'south' | 'east' | 'west' | 'standing'>('west');
  const [vehicleAccessibility, setVehicleAccessibility] = useState<'all' | 'suv_only' | 'emergency_only' | 'impassable'>('suv_only');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('Sunil Patil');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport: CitizenReportItem = {
      id: `rep-${Date.now()}`,
      latitude: 19.0150 + (Math.random() - 0.5) * 0.04,
      longitude: 72.8425 + (Math.random() - 0.5) * 0.04,
      locationName: locationName || roadName,
      ward: ward,
      floodDepthCm: floodDepth,
      description: description,
      roadName: roadName,
      waterFlowDirection: flowDirection,
      vehicleAccessibility: vehicleAccessibility,
      isAnonymous: isAnonymous,
      reporterName: isAnonymous ? undefined : reporterName,
      timestamp: 'Just now',
      status: 'submitted',
      upvotes: 1
    };

    onSubmitReport(newReport);
    setShowFormModal(false);
    setDescription('');
  };

  const totalReports = reports.length;
  const verifiedReports = reports.filter(r => r.status === 'verified').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" /> Citizen Flood Reporting Portal
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Crowdsourced Field Reports
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Help your fellow citizens and BMC emergency teams by reporting street waterlogging depth, vehicle passability, and stuck cars.
          </p>
        </div>

        <button
          onClick={() => setShowFormModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors text-xs"
        >
          <Camera className="w-4 h-4" />
          <span>Report Waterlogging Now</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Reports Submitted Today</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{totalReports}</span>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">Live across Mumbai</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Verified by Ward Engineers</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">{verifiedReports}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Confirmed with rain gauges</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Average Verification Time</span>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">3.2 mins</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Fast control room review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Community Confirmations</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">348 Upvotes</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Trusted ground truth</span>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3.5">
        <h3 className="font-bold text-slate-900 text-sm">Recent Citizen Waterlogging Reports</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => {
            const isVerified = rep.status === 'verified';
            return (
              <div
                key={rep.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold uppercase">{rep.ward}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{rep.locationName}</h4>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {rep.status === 'verified' ? 'Verified by BMC' : 'Under Review'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-medium">Water Depth</span>
                      <span className="text-red-700 font-bold font-mono text-sm">{rep.floodDepthCm} cm</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block font-medium">Flow Direction</span>
                      <span className="text-slate-800 font-bold uppercase">{rep.waterFlowDirection}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block font-medium">Can Vehicles Pass?</span>
                      <span className="text-blue-900 font-bold uppercase">{rep.vehicleAccessibility.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 text-xs italic mb-3">"{rep.description}"</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>{rep.isAnonymous ? 'Anonymous Citizen' : rep.reporterName}</span>
                    <span>·</span>
                    <span>{rep.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpvoteReport(rep.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-700" />
                      <span>{rep.upvotes} Confirm</span>
                    </button>

                    {!isVerified && (
                      <button
                        onClick={() => onUpdateReportStatus(rep.id, 'verified')}
                        className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold"
                      >
                        Verify Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-700" /> Submit Flood Report
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Road / Landmark Name</label>
                <input
                  type="text"
                  required
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  placeholder="e.g. Near Hindmata Cinema, Dadar TT"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium"
                  >
                    <option value="F/South (Parel)">F/South (Parel)</option>
                    <option value="F/North (Sion-Matunga)">F/North (Sion-Matunga)</option>
                    <option value="G/North (Dharavi-Dadar)">G/North (Dharavi-Dadar)</option>
                    <option value="L (Kurla)">L (Kurla)</option>
                    <option value="K/West (Andheri W)">K/West (Andheri W)</option>
                    <option value="H/East (Bandra E)">H/East (Bandra E)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Estimated Water Depth (cm)</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={floodDepth}
                    onChange={(e) => setFloodDepth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Water Flow</label>
                  <select
                    value={flowDirection}
                    onChange={(e) => setFlowDirection(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium"
                  >
                    <option value="west">Flowing West towards Sea</option>
                    <option value="east">Flowing East</option>
                    <option value="south">Flowing South</option>
                    <option value="standing">Stagnant / Standing Water</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Vehicle Accessibility</label>
                  <select
                    value={vehicleAccessibility}
                    onChange={(e) => setVehicleAccessibility(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium"
                  >
                    <option value="all">All Vehicles Moving</option>
                    <option value="suv_only">High-Axle / Buses Only</option>
                    <option value="emergency_only">Emergency Vehicles Only</option>
                    <option value="impassable">Road Impassable / Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">What did you observe?</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe stalled vehicles, open drains, or impassable stretches..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded accent-blue-700"
                  />
                  <span>Submit as Anonymous</span>
                </label>
                {!isAnonymous && (
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs w-44"
                  />
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
