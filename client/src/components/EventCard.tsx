import { Public as PublicIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { Event } from '../models/Event';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Box sx={{
      p: 2,
      mb: 2,
      backgroundColor: event.isGlobalAdminEvent ? '#ffebee' : 'white',
      borderLeft: event.isGlobalAdminEvent ? '5px solid #ef5350' : 'none',
      borderRadius: 1,
      boxShadow: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {event.isGlobalAdminEvent && <PublicIcon sx={{ color: '#ef5350' }} />}
        <Typography variant="h6">{event.title}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {event.description}
      </Typography>
    </Box>
  );
};

export default EventCard; 