import { ThemeProvider, createTheme } from '@mui/material';
import { heIL } from '@mui/material/locale';
import AdminDashboard from 'components/AdminDashboard';
import AdminLogin from 'components/AdminLogin';
import Calendar from 'components/Calendar';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: "'Rubik', 'Heebo', sans-serif",
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.3px'
    }
  },
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
          padding: '6px 16px'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
}, heIL);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App" dir="rtl">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
