import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TopologyBuilderPage from '@/pages/TopologyBuilderPage';
import DiagnosticsPage from '@/pages/DiagnosticsPage';
import PacketInspectorPage from '@/pages/PacketInspectorPage';
import LogsPage from '@/pages/LogsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="topology" element={<TopologyBuilderPage />} />
        <Route path="topology/:id" element={<TopologyBuilderPage />} />
        <Route path="diagnostics" element={<DiagnosticsPage />} />
        <Route path="packets" element={<PacketInspectorPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>
    </Routes>
  );
}
