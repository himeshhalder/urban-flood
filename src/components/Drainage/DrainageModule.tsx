import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Play,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Info
} from 'lucide-react';
import { DrainageNode, DrainageEdge, RoadSegment } from '../../types';
import { HydrologyEngine } from '../../services/hydrologyEngine';

interface DrainageModuleProps {
  nodes: DrainageNode[];
  edges: DrainageEdge[];
  roads: RoadSegment[];
  onApplySimulatedNode: (node: DrainageNode, updatedRoads: RoadSegment[]) => void;
  onFocusOnMap: (coords: [number, number]) => void;
}

export const DrainageModule: React.FC<DrainageModuleProps> = ({
  nodes,
  edges,
  roads,
  onApplySimulatedNode,
  onFocusOnMap
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-01');
  const [simulatedBlockage, setSimulatedBlockage] = useState<number>(65);
  const [simulatedRainfall, setSimulatedRainfall] = useState<number>(60);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'pipes'>('nodes');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-700" /> City Stormwater Drains, Holding Basins &amp; Pumping Stations
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Drainage Network
            </span>
          </div>
          <p className="text-slate-600 mt-1 text-xs">
            Overview of Mumbai's underground drains, holding tanks (Hindmata, Gandhi Market), and coastal pumping stations (Love Grove, Britannia, Irla).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-right">
            <span className="text-[10px] text-red-600 font-bold block">Drains Currently Overflowing / Full</span>
            <span className="font-mono text-red-700 font-bold text-sm">
              {surchargedCount} Locations Surcharged
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700" /> Drain Blockage &amp; Rainfall Test Tool
            </h3>
            <p className="text-slate-500 text-xs">
              Test what happens when trash or silt blocks a drain during heavy rain
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
              <label className="font-bold text-slate-800 block mb-1">Choose Drain or Pumping Station</label>
              <select
                value={selectedNodeId}
                onChange={(e) => {
                  setSelectedNodeId(e.target.value);
                  const node = nodes.find(n => n.id === e.target.value);
                  if (node) setSimulatedBlockage(node.blockagePct);
                  setSimulationResult(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
                <span>Drain Choke / Silt Blockage:</span>
                <span className="font-bold font-mono text-amber-700">{simulatedBlockage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simulatedBlockage}
                onChange={(e) => setSimulatedBlockage(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0% (Clean)</span>
                <span>50% (Half Full)</span>
                <span>100% (Completely Blocked)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-800 font-medium mb-1">
                <span>Rainfall Intensity:</span>
                <span className="font-bold font-mono text-blue-800">{simulatedRainfall} mm/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={simulatedRainfall}
                onChange={(e) => setSimulatedRainfall(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10 mm (Light)</span>
                <span>60 mm (Heavy)</span>
                <span>120 mm (Extreme)</span>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Calculating Water Flow...' : 'Calculate Water Overflow'}</span>
            </button>
          </div>

          {/* Output */}
          <div className="lg:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Calculation Completed
                  </span>
                  <button
                    onClick={handleApplyToSystem}
                    className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
                  >
                    Apply to Live Map
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Drain Status</span>
                    <div className="text-base font-bold font-mono mt-0.5 uppercase text-red-700">
                      {simulationResult.updatedNode.status}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Drain Capacity Used</span>
                    <div className="text-base font-bold font-mono text-blue-900 mt-0.5">
                      {simulationResult.updatedNode.utilizationPct}%
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Road Flood Depth</span>
                    <div className="text-base font-bold font-mono text-red-700 mt-0.5">
                      {simulationResult.surchargeDepthCm} cm
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Time to Drain</span>
                    <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                      ~{simulationResult.estimatedRecoveryTimeMin} mins
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900 text-xs">Impacted Roads:</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {simulationResult.affectedRoads.map((road: RoadSegment) => (
                      <span
                        key={road.id}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium"
                      >
                        {road.name} &rarr; <strong className="text-red-700">{road.currentFloodDepthCm} cm</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sliders className="w-8 h-8 mb-2 text-slate-400" />
                <p className="font-bold text-slate-800">Ready to run simulation</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Move the blockage and rainfall sliders on the left, then click "Calculate Water Overflow".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'nodes' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drainage Nodes ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab('pipes')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'pipes' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drainage Pipes &amp; Canals ({edges.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs"
            >
              <option value="all">All</option>
              <option value="surcharged">Surcharged / Full</option>
              <option value="overflowing">Overflowing</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Nodes Table */}
        {activeTab === 'nodes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="pb-2">Location &amp; Type</th>
                  <th className="pb-2">Elevation Above Sea</th>
                  <th className="pb-2">Inflow / Capacity</th>
                  <th className="pb-2">Capacity Used</th>
                  <th className="pb-2">Pumps</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node) => (
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
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                  <th className="pb-2">Pipe / Canal Name</th>
                  <th className="pb-2">Length &amp; Size</th>
                  <th className="pb-2">Current Flow</th>
                  <th className="pb-2">Flows Towards</th>
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
                        {edge.status}
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
