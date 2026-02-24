import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../state/themeStore';
import { safeStorage } from '../../lib/storage';
import { Sidebar, drawerWidth } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const mode = useThemeStore((state) => state.mode);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    safeStorage.removeItem('ga_token');
    navigate('/login', { replace: true });
  };

  const handleDrawerToggle = () => {
    if (!mobileOpen && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backdropFilter: 'blur(12px)',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(5,8,22,0.9)'
              : 'rgba(243,246,251,0.9)'
        }}
        color="transparent"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}
          >
            GRUPO ALVAREZ EXCHANGE
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 2, opacity: 0.2 }} />
          <IconButton color="inherit" onClick={toggleMode} title="Cambiar tema">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} title="Cerrar sesión">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main content: margin-left on desktop so fixed permanent drawer never covers it */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          pt: 10,
          pb: 4,
          px: { xs: 2, sm: 3, md: 4 },
          ml: { xs: 0, md: drawerWidth },
          transition: 'margin 0.2s ease-out'
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto', width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

