import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OperationsPage } from './features/operations/OperationsPage';
import { LoginPage } from './features/auth/LoginPage';
import { safeStorage } from './lib/storage';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div>{title} (to be implemented)</div>
);

function ProtectedLayout() {
  const location = useLocation();
  const token = safeStorage.getItem('ga_token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="operations" element={<OperationsPage />} />
      <Route path="employees" element={<Placeholder title="Employee management" />} />
      <Route path="reports" element={<Placeholder title="Reports & cash closing" />} />
      <Route path="settings" element={<Placeholder title="System settings" />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
