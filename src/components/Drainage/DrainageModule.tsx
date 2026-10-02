import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Play,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Info,
  Filter
} from 'lucide-react';
import { DrainageNode, DrainageEdge, RoadSegment, CityConfig } from '../../types';
import { HydrologyEngine } from '../../services/hydrologyEngine';
import { useTranslation } from '../../i18n/LanguageContext';

interface DrainageModuleProps {
  nodes: DrainageNode[];
  edges: DrainageEdge[];
  roads: RoadSegment[];
  onApplySimulatedNode: (node: DrainageNode, updatedRoads: RoadSegment[]) => void;
  onFocusOnMap: (coords: [number, number]) => void;
  currentCity?: CityConfig;
  selectedWard?: string;
}

export const DrainageModule: React.FC<DrainageModuleProps> = ({
  nodes,
  edges,
  roads,
  onApplySimulatedNode,
  onFocusOnMap,
  currentCity,
  selectedWard = 'ALL'
}) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-01');
  const [simulatedBlockage, setSimulatedBlockage] = useState<number>(65);
  const [simulatedRainfall, setSimulatedRainfall] = useState<number>(60);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'pipes'>('nodes');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const cityName = currentCity?.name || 'Mumbai';
  const isWardFiltered = selectedWard && selectedWard !== 'ALL' && selectedWard !== 'Entire City';

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      if (!selectedNode) return;
      const result = HydrologyEngine.simulateNodeBlockage(
        selectedNode,
        roads,
        simulatedBlockage,
        simulatedRainfall
      );
      setSimulationResult(result);
      setIsSimulating(false);
    }, 300);
  };

  const handleApplyToSystem = () => {
    if (simulationResult) {
      onApplySimulatedNode(simulationResult.updatedNode, simulationResult.affectedRoads);
    }
  };

  const filteredNodes = nodes.filter(n => {
    if (statusFilter === 'all') return true;
    return n.status === statusFilter;
  });

  const surchargedCount = nodes.filter(n => n.status === 'surcharged' || n.status === 'overflowing').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-700" /> {t('drainage.title')}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              {t('nav.drainage')}
            </span>
            {isWardFiltered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-700" />
                {selectedWard}
              </span>
            )}
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            {t('drainage.subtitle')} ({cityName})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-right">
            <span className="text-[10px] text-red-600 font-bold block">{t('drainage.surchargedLocations')}</span>
            <span className="font-mono text-red-700 font-bold text-sm">
              {surchargedCount} {t('common.surcharged', { fallback: 'Surcharged' }) || 'Surcharged'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700" /> {t('drainage.simulationTitle')}
            </h3>
            <p className="text-slate-500 text-xs">
              {t('drainage.simulationSubtitle')}
            </p>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Municipal Hydraulic Model
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Target Sump / Pumping Node</label>
              <select
                value={selectedNodeId}
                onChange={(e) => {
                  setSelectedNodeId(e.target.value);
                  const node = nodes.find(n => n.id === e.target.value);
                  if (node) setSimulatedBlockage(node.blockagePct);
                  setSimulationResult(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-800 font-medium mb-1">
                <span>{t('drainage.simulateBlockage')}:</span>
                <span className="font-bold font-mono text-amber-700">{simulatedBlockage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedBlockage}
                onChange={(e) => setSimulatedBlockage(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-800 font-medium mb-1">
                <span>{t('drainage.simulateRain')}:</span>
                <span className="font-bold font-mono text-blue-800">{simulatedRainfall} mm/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={simulatedRainfall}
                onChange={(e) => setSimulatedRainfall(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? t('common.loading') : t('drainage.runSimulation')}</span>
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700" />
                    Hydraulic Simulation Forecast: {simulationResult.updatedNode.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 text-[10px] block">{t('drainage.utilization')}</span>
                      <span className="font-bold font-mono text-base text-red-700">
                        {simulationResult.updatedNode.utilizationPct}%
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 text-[10px] block">{t('drainage.waterLevel')}</span>
                      <span className="font-bold font-mono text-base text-slate-800">
                        {simulationResult.updatedNode.currentWaterLevelM} m
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 text-[10px] block">Pump Status</span>
                      <span className="font-bold text-xs text-blue-900">
                        {simulationResult.updatedNode.isPumpingActive ? 'Max Flow Active' : 'Gravity Drain'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 text-[10px] block">Forecast Status</span>
                      <span className="font-bold text-xs uppercase text-red-700">
                        {t(`status.${simulationResult.updatedNode.status}`) || simulationResult.updatedNode.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {simulationResult.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600 text-xs">
                    Impact: <strong>{simulationResult.affectedRoads.length}</strong> street segments experience waterlogging changes.
                  </span>
                  <button
                    onClick={handleApplyToSystem}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{t('drainage.applyToSystem')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Sliders className="w-8 h-8 text-slate-400 mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">Hydraulic Simulator Ready</h4>
                <p className="text-xs max-w-sm mt-1">
                  Adjust the silt blockage slider and rain rate above, then click "{t('drainage.runSimulation')}" to predict backwater ponding.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'nodes'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Drainage Sumps &amp; Pumps ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab('pipes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'pipes'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Primary Stormwater Trunk Mains ({edges.length})
            </button>
          </div>

          {activeTab === 'nodes' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Drainage Statuses</option>
              <option value="normal">{t('status.normal')}</option>
              <option value="surcharged">{t('status.surcharged')}</option>
              <option value="overflowing">{t('status.overflowing')}</option>
            </select>
          )}
        </div>

        {/* Nodes Table */}
        {activeTab === 'nodes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2">Location &amp; Type</th>
                  <th className="pb-2">Elevation</th>
                  <th className="pb-2">Inflow / Capacity</th>
                  <th className="pb-2">Utilization</th>
                  <th className="pb-2">Pumps</th>
                  <th className="pb-2 text-right">{t('alerts.alertStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node) => {
                  const statusBadge = t(`status.${node.status}`) || node.status;
                  return (
                    <tr key={node.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">
                        <div>{node.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal uppercase">{node.type}</div>
                      </td>
                      <td className="py-2.5 text-slate-600 font-mono">
                        {node.groundElevationMsl} m MSL
                      </td>
                      <td className="py-2.5 font-mono text-blue-900">
                        {node.currentInflowM3s} / {node.inletCapacityM3s} m³/s
                      </td>
                      <td className="py-2.5 font-bold font-mono">
                        {node.utilizationPct}%
                      </td>
                      <td className="py-2.5">
                        {node.pumpCapacityM3s ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            node.isPumpingActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {node.isPumpingActive ? 'Running' : 'Standby'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Gravity Flow</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          node.status === 'overflowing' ? 'bg-red-100 text-red-800' :
                          node.status === 'surcharged' ? 'bg-orange-100 text-orange-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {statusBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pipes Table */}
        {activeTab === 'pipes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2">Trunk Main Name</th>
                  <th className="pb-2">Length &amp; Size</th>
                  <th className="pb-2">Current Flow</th>
                  <th className="pb-2">Outfall Direction</th>
                  <th className="pb-2 text-right">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {edges.map((edge) => (
                  <tr key={edge.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">
                      {edge.name}
                    </td>
                    <td className="py-2.5 text-slate-600 font-mono">
                      {edge.lengthMeters}m · Ø{edge.diameterMm}mm
                    </td>
                    <td className="py-2.5 font-mono text-blue-900">
                      {edge.currentFlowM3s} / {edge.maxCapacityM3s} m³/s
                    </td>
                    <td className="py-2.5 text-slate-700">
                      {edge.flowDirection}
                    </td>
                    <td className="py-2.5 text-right font-bold uppercase text-[10px]">
                      <span className={edge.status === 'overflowing' ? 'text-red-700' : 'text-blue-800'}>
                        {t(`status.${edge.status}`) || edge.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
