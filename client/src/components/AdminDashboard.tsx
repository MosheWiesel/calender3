import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../models/Event';
import { authService } from '../services/authService';
import { eventService } from '../services/eventService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const userEvents = await eventService.getUserEvents(user.uid);
        setEvents(userEvents as Event[]);
      }
    } catch (error) {
      console.error('שגיאה בטעינת אירועים:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!selectedEvent?.id) return;

    try {
      await eventService.updateEvent(selectedEvent.id, {
        title: eventTitle,
        description: eventDescription
      });
      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('שגיאה בעדכון האירוע:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      fetchEvents();
    } catch (error) {
      console.error('שגיאה במחיקת האירוע:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            ניהול אירועים
          </Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            התנתק
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>כותרת</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell>תאריך התחלה</TableCell>
                <TableCell>תאריך סיום</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    {new Date(event.startDate).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    {new Date(event.endDate).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditEvent(event)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteEvent(event.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>עריכת אירוע</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="כותרת"
              type="text"
              fullWidth
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="תיאור"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleSaveEvent}>שמור</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 