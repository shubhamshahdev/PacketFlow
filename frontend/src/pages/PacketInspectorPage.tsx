import { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Packet } from '@/types';
import { Package, Layers, ArrowRight, Search, Filter } from 'lucide-react';

const protocolColors: Record<string, string> = {
  ICMP: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  TCP: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  UDP: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  DNS: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  DHCP: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
};

export default function PacketInspectorPage() {
  const { packets } = useAppSelector((state) => state.simulation);
  const { currentTopology } = useAppSelector((state) => state.topology);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [searchIp, setSearchIp] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');

  const filtered = packets.filter((p) => {
    if (searchIp && !p.sourceIp.includes(searchIp) && !p.destinationIp.includes(searchIp)) return false;
    if (protocolFilter && p.protocol !== protocolFilter) return false;
    return true;
  });

  const protocols = [...new Set(packets.map((p) => p.protocol))];

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Packet list */}
      <div className="flex-1 card p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Filter by IP..." value={searchIp} onChange={(e) => setSearchIp(e.target.value)} />
          </div>
          <select className="input w-40" value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)}>
            <option value="">All Protocols</option>
            {protocols.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No packets captured</p>
              <p className="text-xs mt-1">Run a simulation to see packets</p>
            </div>
          ) : (
            filtered.map((pkt) => (
              <div
                key={pkt.id}
                onClick={() => setSelectedPacket(pkt)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPacket?.id === pkt.id
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${protocolColors[pkt.protocol] || 'bg-gray-100 text-gray-700'}`}>
                      {pkt.protocol}
                    </span>
                    <span className="text-xs text-gray-500">{pkt.size} bytes</span>
                  </div>
                  <span className="text-xs text-gray-400">TTL: {pkt.ttl}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="text-gray-900 dark:text-gray-100">{pkt.sourceIp}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">{pkt.destinationIp}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Hop {pkt.hopCount} — {pkt.currentHop}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Packet detail */}
      <div className="w-96 card p-4 overflow-auto custom-scrollbar">
        {selectedPacket ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Packet Details
            </h3>

            {/* OSI Layers */}
            {Object.entries(selectedPacket.layerInfo).map(([layer, info]) => (
              <div key={layer} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-700 pb-1">
                  {layer} Layer
                </h4>
                <div className="text-xs space-y-1">
                  {Object.entries(info as Record<string, unknown>).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 truncate ml-2 text-right">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raw Payload</h4>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg overflow-x-auto text-gray-600 dark:text-gray-400">
                {selectedPacket.payload}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a packet to inspect</p>
          </div>
        )}
      </div>
    </div>
  );
}
