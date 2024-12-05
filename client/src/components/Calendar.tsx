import { EventClickArg, EventContentArg } from '@fullcalendar/core';
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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import React, { useEffect, useRef, useState } from 'react';
import { auth } from '../firebase/config';
import { Event } from '../models/Event';
import { authService } from '../services/authService';
import { deleteAllAdminEvents, eventService, isAdmin } from '../services/eventService';
import AuthDialog from './AuthDialog';
import EventCard from './EventCard';

const Calendar: React.FC = () => {
  const theme = useTheme();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<{ event: Event; element: HTMLElement } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUser = auth.currentUser;

  const checkIsAdmin = () => {
    return isAdmin(currentUser?.email || null);
  };

  const fetchEvents = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleEventClick = async (clickInfo: EventClickArg) => {
    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }

    const event = events.find(e => e.id === clickInfo.event.id);
    if (!event) return;

    const canEdit = currentUser && (
      event.createdBy === currentUser.uid || 
      (checkIsAdmin() && event.isGlobalAdminEvent)
    );

    if (canEdit) {
      setSelectedEvent(event);
      setEventTitle(event.title);
      setEventDescription(event.description);
      setIsGlobalAdminEvent(event.isGlobalAdminEvent || false);
      setSelectedDate(new Date(event.startDate));
      setIsEventDialogOpen(true);
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
      const isUserAdmin = checkIsAdmin();
      const eventData = {
        title: eventTitle,
        description: eventDescription,
        startDate: selectedDate,
        endDate: selectedDate,
        createdBy: currentUser.uid,
        isPublic: false,
        isGlobalAdminEvent: false,
        location: '',
        participants: [],
        category: 'כללי',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isUserAdmin) {
        eventData.isPublic = true;
        eventData.isGlobalAdminEvent = true;
      }

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
      console.error('Error deleting event:', error);
      showSnackbar('אירעה שגיאה במחיקת האירוע', 'error');
    }
  };

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') calendarApi.prev();
      else if (direction === 'next') calendarApi.next();
      else calendarApi.today();
      setCurrentDate(calendarApi.getDate());
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
      return '#ef5350';
    }
    return '#90caf9';
  };

  const formatHebrewDate = (date: Date) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleEventMouseEnter = (event: Event, element: HTMLElement) => {
    setHoveredEvent({ event, element });
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  const canEditEvent = (event: Event) => {
    return currentUser && (
      event.createdBy === currentUser.uid || 
      (checkIsAdmin() && event.isGlobalAdminEvent)
    );
  };

  const formatEventDate = (date: Date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const eventContent = (eventInfo: EventContentArg) => {
    const event = events.find(e => e.id === eventInfo.event.id);
    if (!event) return null;

    return (
      <Box
        onMouseEnter={(e) => {
          e.stopPropagation();
          setHoveredEvent({ event, element: e.currentTarget });
        }}
        onMouseLeave={() => setHoveredEvent(null)}
        sx={{
          p: 1,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          bgcolor: '#1a73e8',
          color: '#ffffff',
          borderRadius: 1,
          '&:hover': {
            bgcolor: '#1557b0',
          },
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        {event.isGlobalAdminEvent && (
          <PublicIcon sx={{ fontSize: '0.875rem' }} />
        )}
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.2
          }}
        >
          {event.title}
        </Typography>
      </Box>
    );
  };

  const handleDeleteAllEvents = async () => {
    setIsConfirmDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await deleteAllAdminEvents();
      alert(`נמחקו ${result.deletedCount} אירועים בהצלחה`);
      // רענון האירועים בלוח
      fetchEvents();
    } catch (error) {
      alert('אירעה שגיאה במחיקת האירועים');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDayLabel = (date: Date) => {
    return format(date, 'EEEE', { locale: he });
  };

  const getMonthLabel = () => {
    return format(currentDate, 'MMMM yyyy', { locale: he });
  };

  useEffect(() => {
    const loadEvents = async () => {
      await fetchEvents();
    };
    
    loadEvents();
    
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        await fetchEvents();
      } else {
        await fetchPublicEvents();
      }
    });
    
    return () => unsubscribe();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ height: '100vh', p: 3, bgcolor: 'background.default' }}>
      <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>טוען...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', minWidth: '150px' }}>
                  לוח אירועים חודשי
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, minWidth: '150px' }}>
                  {getMonthLabel()}
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
                        sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="התנתק">
                      <IconButton onClick={handleLogout}>
                        <ExitToApp />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="התחבר">
                    <IconButton onClick={() => setShowAuthDialog(true)}>
                      <AccountCircle />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            <Box sx={{ height: 'calc(100% - 64px)', p: 2 }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
                initialView="dayGridMonth"
                locale="he"
                direction="rtl"
                height="100%"
                events={events.map(event => ({
                  id: event.id,
                  title: event.title,
                  start: event.startDate,
                  end: event.endDate,
                  backgroundColor: getEventColor(event),
                  borderColor: 'transparent',
                  textColor: 'white'
                }))}
                eventContent={eventContent}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                datesSet={(dateInfo) => setCurrentDate(dateInfo.start)}
                headerToolbar={false}
              />
            </Box>

            <style>
              {`
                .fc-daygrid-day {
                  height: 120px !important;
                }
                .fc-daygrid-day-events {
                  overflow-y: auto !important;
                  max-height: 80px !important;
                }
                .fc-daygrid-day-events::-webkit-scrollbar {
                  width: 4px;
                }
                .fc-daygrid-day-events::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.2);
                  border-radius: 2px;
                }
                .fc-daygrid-event-harness {
                  margin-bottom: 2px !important;
                }
              `}
            </style>
          </>
        )}
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 500,
            '& .MuiDialog-paper': {
              margin: 2
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          pt: 3,
          '& .MuiTypography-root': { 
            fontWeight: 600,
            color: 'primary.main'
          }
        }}>
          {selectedEvent ? 'עריכת אירוע' : 'אירוע חדש'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              >
                כותרת
              </Typography>
              <TextField
                autoFocus
                fullWidth
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 1,
                    '& fieldset': {
                      borderWidth: '1px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    p: 1.5
                  }
                }}
                InputProps={{
                  sx: { m: 0 }
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              >
                תיאור
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 1,
                    '& fieldset': {
                      borderWidth: '1px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    p: 1.5
                  }
                }}
                InputProps={{
                  sx: { m: 0 }
                }}
              />
            </Box>
            {checkIsAdmin() && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'text.secondary',
                bgcolor: 'action.hover',
                p: 1,
                borderRadius: 1
              }}>
                <PublicIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  אירוע גלובלי (גלוי לכולם)
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {selectedEvent && canEditEvent(selectedEvent) && (
            <Button
              onClick={handleDeleteEvent}
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              מחק
            </Button>
          )}
          <Button
            onClick={() => setIsEventDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            startIcon={selectedEvent ? <EditIcon /> : <AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {selectedEvent ? 'עדכן' : 'צור אירוע'}
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

      {hoveredEvent && (
        <EventCard
          event={hoveredEvent.event}
          anchorEl={hoveredEvent.element}
          onClose={() => setHoveredEvent(null)}
        />
      )}

      {checkIsAdmin() && (
        <IconButton
          onClick={() => setIsDeleteDialogOpen(true)}
          sx={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
          disabled={isDeleting}
        >
          <DeleteForeverIcon color="error" />
        </IconButton>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        dir="rtl"
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          אזהרה - מחיקת כל האירועים
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את כל האירועים שלך?
            <br />
            <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
              פעולה זו היא בלתי הפיכה!
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
            ביטול
          </Button>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setIsConfirmDeleteDialogOpen(true);
            }}
            color="error"
            variant="contained"
          >
            המשך למחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        dir="rtl"
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          אישור סופי - אין דרך חזרה
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            זהו אישור סופי למחיקת כל האירועים שלך.
            <br />
            <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
              האם אתה באמת בטוח שברצונך למחוק את כל האירועים?
              <br />
              לא ניתן יהיה לשחזר אותם!
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsConfirmDeleteDialogOpen(false)} 
            color="primary"
          >
            ביטול
          </Button>
          <Button
            onClick={handleDeleteAllEvents}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'מוחק...' : 'כן, מחק הכל'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 