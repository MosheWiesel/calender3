import { Google as GoogleIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ADMIN_EMAIL = "mw6701964@gmail.com";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      if (user.email === ADMIN_EMAIL) {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('אין לך הרשאות מנהל');
        setShowError(true);
        localStorage.removeItem('isAdmin');
      }
    } catch (err) {
      setError('שגיאה בהתחברות');
      setShowError(true);
      localStorage.removeItem('isAdmin');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            כניסת מנהל
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                bgcolor: '#fff',
                color: '#757575',
                border: '1px solid #ddd',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  border: '1px solid #bbb'
                }
              }}
            >
              התחבר עם Google
            </Button>
          </Box>
        </Paper>
      </Box>
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminLogin; 