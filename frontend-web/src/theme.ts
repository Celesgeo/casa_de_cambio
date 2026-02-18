import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { ThemeMode } from './state/themeStore';

export const createAppTheme = (mode: ThemeMode) => {
  const commonOptions: ThemeOptions = {
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          elevation: 0
        }
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
          variant: 'outlined'
        }
      }
    }
  };

  if (mode === 'light') {
    return createTheme({
      ...commonOptions,
      palette: {
        mode: 'light',
        primary: {
          main: '#0047FF'
        },
        secondary: {
          main: '#00C9A7'
        },
        background: {
          default: '#F3F6FB',
          paper: '#FFFFFF'
        }
      }
    });
  }

  return createTheme({
    ...commonOptions,
    palette: {
      mode: 'dark',
      primary: {
        main: '#4C8DFF'
      },
      secondary: {
        main: '#00E0B8'
      },
      background: {
        default: '#050816',
        paper: '#0B1020'
      }
    }
  });
};

