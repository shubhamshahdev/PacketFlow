import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { toggleTheme } from '@/store/slices/themeSlice';
import { logout } from '@/store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, Save } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/topology': 'Topology Builder',
  '/diagnostics': 'Network Diagnostics',
  '/packets': 'Packet Inspector',
  '/logs': 'Event Logs',
};

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useAppSelector((state) => state.theme);
  const { currentTopology } = useAppSelector((state) => state.topology);

  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] || 'PacketFlow';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>

      <div className="flex items-center gap-3">
        {currentTopology && location.pathname.includes('topology') && (
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" /> Save
          </button>
        )}

        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
