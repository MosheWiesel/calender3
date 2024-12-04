import { ThemeProvider, createTheme } from '@mui/material';
import { heIL } from '@mui/material/locale';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Calendar from './components/Calendar';
import Login from './components/Login';
import { auth } from './firebase/config';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: "'Rubik', 'Heebo', sans-serif",
  },
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    secondary: {
      main: '#7c3aed',
    }
  }
}, heIL);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // או תציג מסך טעינה
  }

  return (
    <ThemeProvider theme={theme}>
      {!user ? (
        <Login />
      ) : (
        <Routes>
          <Route path="/" element={<Calendar />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}

export default App;
