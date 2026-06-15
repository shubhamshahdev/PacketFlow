import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchEvents } from '@/store/slices/simulationSlice';
import { ScrollText, AlertTriangle, Info, AlertCircle, XCircle, Filter } from 'lucide-react';

const severityIcons: Record<string, React.ElementType> = {
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  CRITICAL: AlertCircle,
};

const severityColors: Record<string, string> = {
  INFO: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  WARNING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const typeColors: Record<string, string> = {
  PACKET_SENT: 'text-green-600',
  PACKET_RECEIVED: 'text-blue-600',
  PACKET_DROPPED: 'text-red-600',
  CONNECTION_UP: 'text-green-600',
  CONNECTION_DOWN: 'text-red-600',
  DEVICE_ONLINE: 'text-green-600',
  DEVICE_OFFLINE: 'text-red-600',
  ERROR: 'text-red-600',
  INFO: 'text-gray-600',
};

export default function LogsPage() {
  const dispatch = useAppDispatch();
  const { events } = useAppSelector((state) => state.simulation);
  const { topologies, currentTopology } = useAppSelector((state) => state.topology);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (currentTopology?.id) {
      dispatch(fetchEvents({ topologyId: currentTopology.id, limit: 200 }));
    } else if (topologies.length > 0 && topologies[0]?.id) {
      dispatch(fetchEvents({ topologyId: topologies[0].id, limit: 200 }));
    }
  }, [dispatch, currentTopology?.id, topologies]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="card flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> Network Event Logs
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{events.length} events</span>
            <button className="btn-secondary text-sm flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events recorded yet</p>
              <p className="text-sm mt-1">Run simulations to generate events</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map((event) => {
                const SevIcon = severityIcons[event.severity] || Info;
                return (
                  <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${severityColors[event.severity] || severityColors.INFO}`}>
                        <SevIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${typeColors[event.type] || 'text-gray-600'}`}>
                            {event.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{formatTimestamp(event.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{event.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>From: <span className="font-mono">{event.source}</span></span>
                          <span>To: <span className="font-mono">{event.destination}</span></span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        severityColors[event.severity] || severityColors.INFO
                      }`}>
                        {event.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
