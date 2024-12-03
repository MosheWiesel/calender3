import { Close as CloseIcon, Google as GoogleIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onSuccess }) => {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          התחברות
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            fullWidth
            sx={{
              bgcolor: '#fff',
              color: '#757575',
              border: '1px solid #ddd',
              '&:hover': {
                bgcolor: '#f5f5f5',
                border: '1px solid #bbb'
              },
              py: 1
            }}
          >
            התחבר עם Google
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog; 