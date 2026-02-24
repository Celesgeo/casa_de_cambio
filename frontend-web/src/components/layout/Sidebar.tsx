import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';

export const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const items = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Operations', icon: <CurrencyExchangeIcon />, path: '/operations' },
  { label: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  { label: 'Reports', icon: <ReceiptLongIcon />, path: '/reports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' }
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Toolbar />
      <List sx={{ flexGrow: 1, mt: 1 }}>
        {items.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, #4C8DFF, #00E0B8)'
                      : 'linear-gradient(90deg, #0047FF, #00C9A7)',
                  color: '#ffffff'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? '#ffffff' : 'text.secondary',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: false,
          disableAutoFocus: false
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            marginTop: '64px', // below AppBar
            height: 'calc(100% - 64px)',
            borderRight: 1,
            borderColor: 'divider'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

