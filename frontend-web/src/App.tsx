import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OperationsPage } from './features/operations/OperationsPage';
import { LoginPage } from './features/auth/LoginPage';
import { safeStorage } from './lib/storage';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div>{title} (to be implemented)</div>
);

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = (() => {
    try {
      return safeStorage.getItem('ga_token');
    } catch {
      return null;
    }
  })();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/employees" element={<Placeholder title="Employee management" />} />
              <Route path="/reports" element={<Placeholder title="Reports & cash closing" />} />
              <Route path="/settings" element={<Placeholder title="System settings" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
          </ProtectedLayout>
        }
      />
    </Routes>
  );
};

export default App;

