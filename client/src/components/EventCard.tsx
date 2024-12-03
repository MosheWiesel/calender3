import { Box, Card, CardContent, Typography } from '@mui/material';
import { Event } from '../services/eventService';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <Card 
            sx={{ 
                mb: 2,
                backgroundColor: event.isAdminEvent ? '#e3f2fd' : 'white',
                borderLeft: event.isAdminEvent ? '5px solid #2196f3' : 'none'
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        {event.title}
                    </Typography>
                    {event.isAdminEvent && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                backgroundColor: '#2196f3',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px'
                            }}
                        >
                            אירוע מנהל
                        </Typography>
                    )}
                </Box>
                <Typography color="text.secondary">
                    {event.description}
                </Typography>
                <Typography variant="body2">
                    {new Date(event.startDate).toLocaleDateString('he-IL')}
                </Typography>
                <Typography variant="body2">
                    {event.location}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EventCard; 