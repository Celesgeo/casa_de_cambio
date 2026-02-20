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
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const token = safeStorage.getItem('ga_token');
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Cargando…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <div style={{ minHeight: '100vh' }}>{children}</div>;
}

// Con HashRouter, si el usuario entró por /login (rewrite), poner #/login para que coincida la ruta
const App: React.FC = () => {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login' && !window.location.hash) {
      window.location.hash = '#/login';
    }
  }, []);

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

