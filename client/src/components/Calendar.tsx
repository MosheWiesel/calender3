import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import FullCalendar from '@fullcalendar/react';
import {
    AccountCircle,
    Add as AddIcon,
    ChevronLeft,
    ChevronRight,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExitToApp,
    Public as PublicIcon,
    Today as TodayIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../models/Event';
import { authService } from '../services/authService';
import { eventService } from '../services/eventService';
import AuthDialog from './AuthDialog';

const Calendar: React.FC = () => {
  const theme = useTheme();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGlobalAdminEvent, setIsGlobalAdminEvent] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const isAdmin = () => {
    const currentUser = authService.getCurrentUser();
    return currentUser?.email === 'mw6701964@gmail.com';
  };

  useEffect(() => {
    fetchEvents();
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        fetchEvents();
      } else {
        fetchPublicEvents();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const [userEvents, publicEvents] = await Promise.all([
          eventService.getUserEvents(user.uid),
          eventService.getPublicEvents()
        ]);
        const allEvents = [...userEvents, ...publicEvents.filter(e => e.createdBy !== user.uid)];
        setEvents(allEvents as Event[]);
      } else {
        await fetchPublicEvents();
      }
    } catch (error) {
      console.error('שגיאה בטעינת אירועים:', error);
      showSnackbar('שגיאה בטעינת אירועים', 'error');
    }
  };

  const fetchPublicEvents = async () => {
    try {
      const publicEvents = await eventService.getPublicEvents();
      setEvents(publicEvents as Event[]);
    } catch (error) {
      console.error('שגיאה בטעינת אירועים ציבוריים:', error);
      showSnackbar('שגיאה בטעינת אירועים', 'error');
    }
  };

  const handleDateClick = (arg: any) => {
    if (!authService.getCurrentUser()) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedDate(arg.date);
    setSelectedEvent(null);
    setEventTitle('');
    setEventDescription('');
    setIsGlobalAdminEvent(false);
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      const currentUser = authService.getCurrentUser();
      const canEdit = currentUser && (
        event.createdBy === currentUser.uid || 
        (isAdmin() && event.isGlobalAdminEvent)
      );
      
      if (canEdit) {
        setSelectedEvent(event);
        setEventTitle(event.title);
        setEventDescription(event.description);
        setIsGlobalAdminEvent(event.isGlobalAdminEvent || false);
        setSelectedDate(new Date(event.startDate));
        setIsEventDialogOpen(true);
      }
    }
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      showSnackbar('נא להזין כותרת לאירוע', 'error');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      showSnackbar('יש להתחבר תחילה', 'error');
      return;
    }

    try {
      const eventData = {
        title: eventTitle,
        description: eventDescription,
        startDate: selectedDate,
        endDate: selectedDate,
        createdBy: currentUser.uid,
        isPublic: isAdmin() || isGlobalAdminEvent,
        isGlobalAdminEvent: isAdmin() && isGlobalAdminEvent,
        location: '',
        participants: [],
        category: 'כללי',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (selectedEvent?.id) {
        await eventService.updateEvent(selectedEvent.id, eventData);
        showSnackbar('האירוע עודכן בהצלחה', 'success');
      } else {
        await eventService.createEvent(eventData);
        showSnackbar('האירוע נוסף בהצלחה', 'success');
      }

      setIsEventDialogOpen(false);
      setEventTitle('');
      setEventDescription('');
      setSelectedEvent(null);
      setIsGlobalAdminEvent(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showSnackbar('שגיאה בשמירת האירוע', 'error');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    try {
      await eventService.deleteEvent(selectedEvent.id);
      showSnackbar('האירוע נמחק בהצלחה', 'success');
      setIsEventDialogOpen(false);
      fetchEvents();
    } catch (error) {
      showSnackbar('שגיאה במחיקת האירוע', 'error');
    }
  };

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') calendarApi.prev();
      else if (direction === 'next') calendarApi.next();
      else calendarApi.today();
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSnackbar('התנתקת בהצלחה', 'success');
    } catch (error) {
      showSnackbar('שגיאה בהתנתקות', 'error');
    }
  };

  const getEventColor = (event: Event) => {
    if (event.isGlobalAdminEvent) {
      return theme.palette.error.main; // צבע אדום לאירועי מנהל גלובליים
    }
    return event.createdBy === authService.getCurrentUser()?.uid 
      ? theme.palette.primary.main 
      : theme.palette.secondary.main;
  };

  return (
    <Box sx={{ height: '100vh', p: 3, bgcolor: 'background.default' }}>
      <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              לוח אירועים
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => handleNavigate('prev')} size="small">
                <ChevronRight />
              </IconButton>
              <IconButton onClick={() => handleNavigate('today')} size="small">
                <TodayIcon />
              </IconButton>
              <IconButton onClick={() => handleNavigate('next')} size="small">
                <ChevronLeft />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {authService.getCurrentUser() ? (
              <>
                <Tooltip title="הוסף אירוע">
                  <IconButton 
                    onClick={() => handleDateClick({ date: new Date() })}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<ExitToApp />}
                  onClick={handleLogout}
                >
                  התנתק
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<AccountCircle />}
                onClick={() => setShowAuthDialog(true)}
              >
                התחבר
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ height: 'calc(100% - 64px)', p: 2 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="he"
            direction="rtl"
            headerToolbar={false}
            events={events.map(event => ({
              id: event.id,
              title: event.isGlobalAdminEvent ? '🌟 ' + event.title : event.title,
              start: event.startDate,
              end: event.endDate,
              backgroundColor: getEventColor(event),
              borderColor: 'transparent',
              textColor: 'white',
              extendedProps: event
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
          />
        </Box>
      </Paper>

      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => {
          setShowAuthDialog(false);
          showSnackbar('התחברת בהצלחה', 'success');
        }}
      />

      <Dialog 
        open={isEventDialogOpen} 
        onClose={() => setIsEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'עריכת אירוע' : 'אירוע חדש'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="כותרת"
            type="text"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
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
          {isAdmin() && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isGlobalAdminEvent}
                  onChange={(e) => setIsGlobalAdminEvent(e.target.checked)}
                  icon={<PublicIcon />}
                  checkedIcon={<PublicIcon />}
                />
              }
              label="אירוע גלובלי (יופיע לכל המשתמשים)"
            />
          )}
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button 
              onClick={handleDeleteEvent}
              color="error"
              startIcon={<DeleteIcon />}
            >
              מחק
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setIsEventDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleSaveEvent}
            variant="contained"
            startIcon={<EditIcon />}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calendar; 