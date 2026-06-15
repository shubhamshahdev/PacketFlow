import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  LayoutDashboard, Network, Activity, Search, Package, ScrollText,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/topology', icon: Network, label: 'Topology Builder' },
  { to: '/diagnostics', icon: Search, label: 'Diagnostics' },
  { to: '/packets', icon: Package, label: 'Packet Inspector' },
  { to: '/logs', icon: ScrollText, label: 'Event Logs' },
];

export default function Sidebar() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">PacketFlow</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
