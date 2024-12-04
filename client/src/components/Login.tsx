import { Alert, Box, Button, Container, Paper, Snackbar, Typography } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../firebase/config';

const GoogleLogoSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setError('הדומיין של האתר לא מורשה. אנא פנה למנהל המערכת.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('החלון נסגר לפני השלמת ההתחברות.');
      } else {
        setError('אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 4, md: 8 },
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.2rem' },
              mb: 3,
              background: 'linear-gradient(45deg, #1a73e8 30%, #174ea6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            לוח שנה אישי
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            התחבר כדי לצפות ולנהל את האירועים שלך
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="large"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          sx={{
            borderRadius: 50,
            py: 2,
            px: 6,
            textTransform: 'none',
            fontSize: '1.1rem',
            borderColor: '#dadce0',
            backgroundColor: '#fff',
            color: '#3c4043',
            display: 'flex',
            gap: 3,
            minWidth: '280px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#dadce0',
              backgroundColor: '#f8f9fa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              טוען...
            </Box>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '24px',
                height: '24px',
                mr: 1
              }}>
                <GoogleLogoSvg />
              </Box>
              <Box component="span" sx={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                '& .google-text': {
                  fontFamily: 'Google Sans, Roboto, sans-serif',
                  fontWeight: 500
                }
              }}>
                <span className="google-text">
                  התחבר עם{' '}
                  <span style={{ 
                    background: `linear-gradient(
                      45deg,
                      #4285F4 0%,
                      #4285F4 25%,
                      #34A853 25%,
                      #34A853 50%,
                      #FBBC05 50%,
                      #FBBC05 75%,
                      #EA4335 75%,
                      #EA4335 100%
                    )`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    paddingLeft: '4px'
                  }}>
                    Google
                  </span>
                </span>
              </Box>
            </>
          )}
        </Button>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 