'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TomoEVMKitProvider, darkTheme } from '@tomo-inc/tomo-evm-kit';
import { tomoConfig } from '../config/tomoConfig';
import { MetaMaskProvider } from '../components/MetaMaskProvider';
import { Toaster } from 'react-hot-toast';
import '@tomo-inc/tomo-evm-kit/styles.css';

// Modern Dark Theme Configuration
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#8b87ff',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4',
      light: '#67e8f9',
      dark: '#0891b2',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
    },
    divider: '#374151',
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#374151 #0a0a0a',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0a0a0a',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#374151',
            borderRadius: '4px',
            '&:hover': {
              background: '#4b5563',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
        contained: {
          backgroundColor: '#6366f1',
          color: 'white',
          '&:hover': {
            backgroundColor: '#4f46e5',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          },
        },
        outlined: {
          borderColor: '#374151',
          color: '#6366f1',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          border: '1px solid #374151',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            borderColor: '#6366f1',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          border: '1px solid #374151',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #374151',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8rem',
        },
        filled: {
          backgroundColor: '#374151',
          color: '#fff',
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#6366f1',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: '#06b6d4',
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#10b981',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#ef4444',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#f59e0b',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#111111',
            '& fieldset': {
              borderColor: '#374151',
            },
            '&:hover fieldset': {
              borderColor: '#6366f1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#111111',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#6366f1',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#6366f1',
          height: 3,
          borderRadius: 2,
        },
      },
    },
  },
});

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering placeholder on server
  if (!mounted) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
          {children}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <MetaMaskProvider>
      <WagmiProvider config={tomoConfig}>
        <QueryClientProvider client={queryClient}>
          <TomoEVMKitProvider
            theme={darkTheme({
              accentColor: "#7b61ff",
              accentColorForeground: "white",
              borderRadius: "medium",
            })}
            socialsFirst={false}
          >
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              {children}
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #374151'
                  },
                  success: {
                    style: {
                      background: '#059669',
                      color: '#ffffff'
                    }
                  },
                  error: {
                    style: {
                      background: '#dc2626',
                      color: '#ffffff'
                    }
                  }
                }}
              />
            </ThemeProvider>
          </TomoEVMKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MetaMaskProvider>
  );
}