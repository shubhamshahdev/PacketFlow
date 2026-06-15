import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchTopologies } from '@/store/slices/topologySlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Network, Server, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const chartData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}s`,
  packets: Math.floor(Math.random() * 1000 + 500),
  latency: Math.round((Math.random() * 40 + 10) * 100) / 100,
  bandwidth: Math.round(Math.random() * 100 * 100) / 100,
}));

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { topologies } = useAppSelector((state) => state.topology);
  const { statistics } = useAppSelector((state) => state.simulation);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTopologies());
  }, [dispatch]);

  const statsCards = [
    { label: 'Topologies', value: topologies.length, icon: Network, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Devices', value: topologies.reduce((acc, t) => acc + t.devices.length, 0), icon: Server, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Connections', value: topologies.reduce((acc, t) => acc + t.connections.length, 0), icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Active Simulations', value: statistics?.activeDevices || 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.username}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your network simulation environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{value}</p>
              </div>
              <div className={`p-3 rounded-lg ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Network Traffic</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="packetsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="packets" stroke="#3b82f6" fill="url(#packetsGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Latency (ms)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Topologies</h3>
          <Link to="/topology" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {topologies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No topologies yet. Create your first one!</p>
            <Link to="/topology" className="btn-primary inline-block mt-3">Create Topology</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topologies.slice(0, 6).map((t) => (
              <Link key={t.id} to={`/topology/${t.id}`} className="card p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors block">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{t.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.devices.length} devices, {t.connections.length} connections
                </p>
                <p className="text-xs text-gray-400 mt-2">Updated {new Date(t.updatedAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
