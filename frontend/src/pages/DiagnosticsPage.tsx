import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { simulatePing, simulateTraceroute, simulatePortScan } from '@/store/slices/simulationSlice';
import { Loader2, CheckCircle, XCircle, Activity, Radio, Shield } from 'lucide-react';

export default function DiagnosticsPage() {
  const dispatch = useAppDispatch();
  const { currentTopology } = useAppSelector((state) => state.topology);
  const { pingResult, tracerouteResult, portScanResult, isSimulating } = useAppSelector((state) => state.simulation);
  const topologies = useAppSelector((state) => state.topology.topologies);

  const [selectedTopology, setSelectedTopology] = useState('');
  const [sourceDevice, setSourceDevice] = useState('');
  const [destDevice, setDestDevice] = useState('');
  const [targetDevice, setTargetDevice] = useState('');
  const [ports, setPorts] = useState('22,80,443,8080,3306,5432');
  const [activeTab, setActiveTab] = useState<'ping' | 'traceroute' | 'portscan'>('ping');

  const topology = topologies.find((t) => t.id === selectedTopology) || currentTopology;

  const devices = topology?.devices || [];

  const handlePing = () => {
    if (!selectedTopology || !sourceDevice || !destDevice) return;
    dispatch(simulatePing({ topologyId: selectedTopology, sourceId: sourceDevice, destinationId: destDevice }));
  };

  const handleTraceroute = () => {
    if (!selectedTopology || !sourceDevice || !destDevice) return;
    dispatch(simulateTraceroute({ topologyId: selectedTopology, sourceId: sourceDevice, destinationId: destDevice }));
  };

  const handlePortScan = () => {
    if (!selectedTopology || !targetDevice) return;
    const portList = ports.split(',').map((p) => parseInt(p.trim())).filter((p) => !isNaN(p));
    dispatch(simulatePortScan({ topologyId: selectedTopology, targetId: targetDevice, ports: portList }));
  };

  return (
    <div className="space-y-6">
      {/* Topology Selector */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Topology</label>
            <select className="input" value={selectedTopology} onChange={(e) => setSelectedTopology(e.target.value)}>
              <option value="">Select topology...</option>
              {topologies.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Source Device</label>
            <select className="input" value={sourceDevice} onChange={(e) => setSourceDevice(e.target.value)} disabled={!selectedTopology}>
              <option value="">Select source...</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.config.interfaces[0]?.ipAddress || 'no IP'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Destination / Target</label>
            <select className="input" value={destDevice || targetDevice} onChange={(e) => {
              setDestDevice(e.target.value); setTargetDevice(e.target.value);
            }} disabled={!selectedTopology}>
              <option value="">Select destination...</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.config.interfaces[0]?.ipAddress || 'no IP'})</option>
              ))}
            </select>
          </div>
          {activeTab === 'portscan' && (
            <div>
              <label className="label">Ports (comma separated)</label>
              <input className="input" value={ports} onChange={(e) => setPorts(e.target.value)} placeholder="22,80,443" />
            </div>
          )}
        </div>
      </div>

      {/* Tool tabs */}
      <div className="flex gap-2">
        {(['ping', 'traceroute', 'portscan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {tab === 'ping' ? 'Ping' : tab === 'traceroute' ? 'Traceroute' : 'Port Scan'}
          </button>
        ))}
        <button
          onClick={activeTab === 'ping' ? handlePing : activeTab === 'traceroute' ? handleTraceroute : handlePortScan}
          disabled={isSimulating || !selectedTopology}
          className="btn-primary flex items-center gap-2 ml-auto"
        >
          {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {isSimulating ? 'Running...' : `Run ${activeTab === 'ping' ? 'Ping' : activeTab === 'traceroute' ? 'Traceroute' : 'Port Scan'}`}
        </button>
      </div>

      {/* Results */}
      {activeTab === 'ping' && pingResult && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ping Results</h3>
            <span className={`flex items-center gap-1 text-sm ${pingResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {pingResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {pingResult.success ? 'Reachable' : 'Unreachable'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">Source:</span> <span className="font-mono text-gray-900 dark:text-gray-100">{pingResult.source}</span></div>
            <div><span className="text-gray-500">Destination:</span> <span className="font-mono text-gray-900 dark:text-gray-100">{pingResult.destination}</span></div>
            <div><span className="text-gray-500">RTT:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{pingResult.roundTripTime.toFixed(2)} ms</span></div>
            <div><span className="text-gray-500">Loss:</span> <span className={`font-medium ${pingResult.packetLoss > 0 ? 'text-red-600' : 'text-green-600'}`}>{pingResult.packetLoss.toFixed(0)}%</span></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hops ({pingResult.hops.length})</p>
            <div className="space-y-1">
              {pingResult.hops.map((hop) => (
                <div key={hop.hop} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-400 w-6">{hop.hop}.</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{hop.ip}</span>
                  <span className="text-gray-500">{hop.hostname}</span>
                  <span className="ml-auto font-mono">{hop.rtt.toFixed(2)} ms</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    hop.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{hop.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'traceroute' && tracerouteResult && (
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Traceroute Results</h3>
          <div className="text-sm text-gray-500">
            <span className="font-mono text-gray-900 dark:text-gray-100">{tracerouteResult.source}</span> to{' '}
            <span className="font-mono text-gray-900 dark:text-gray-100">{tracerouteResult.destination}</span>
            {' '}— Total: {tracerouteResult.totalTime.toFixed(2)} ms
          </div>
          <div className="space-y-1">
            {tracerouteResult.hops.map((hop) => (
              <div key={hop.hop} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-gray-400 w-6">{hop.hop}.</span>
                <span className="font-mono text-gray-900 dark:text-gray-100 w-32">{hop.ip}</span>
                <span className="text-gray-500 flex-1">{hop.hostname}</span>
                <span className="font-mono text-gray-500">
                  {hop.rtt.map((r) => r < 0 ? '*' : `${r.toFixed(1)}`).join('  ')} ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'portscan' && portScanResult && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Port Scan Results</h3>
            <span className="text-sm text-gray-500">{portScanResult.totalPortsScanned} ports scanned in {portScanResult.scanTime}ms</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {portScanResult.openPorts} open
            </span>
            <span className="text-sm px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {portScanResult.totalPortsScanned - portScanResult.openPorts} closed/filtered
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 font-medium">Port</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Protocol</th>
                  <th className="text-left py-2 text-gray-500 font-medium">State</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Service</th>
                </tr>
              </thead>
              <tbody>
                {portScanResult.ports.map((p) => (
                  <tr key={p.port} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-mono text-gray-900 dark:text-gray-100">{p.port}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{p.protocol}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.state === 'OPEN' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        p.state === 'CLOSED' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>{p.state}</span>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{p.service}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
