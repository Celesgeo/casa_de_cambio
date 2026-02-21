import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { useThemeStore } from './state/themeStore';
import { createAppTheme } from './theme';

const Root = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  const isProduction = import.meta.env.PROD;
  const app = <Root />;
  ReactDOM.createRoot(rootEl).render(
    isProduction ? app : <React.StrictMode>{app}</React.StrictMode>
  );
}

