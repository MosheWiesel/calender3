import { LocationOn as LocationIcon, Public as PublicIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { Box, Divider, Paper, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Event } from '../models/Event';

interface EventCardProps {
  event: Event;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const EventCard = ({ event, anchorEl, onClose }: EventCardProps) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: he });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      sx={{ 
        pointerEvents: 'none',
        '& .MuiPaper-root': {
          maxWidth: '320px',
          maxHeight: '220px',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.05)'
        }
      }}
    >
      <Paper sx={{ 
        background: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <Box sx={{ 
          p: 2,
          background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
          color: 'white'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 1
          }}>
            <TimeIcon sx={{ fontSize: '0.9rem', opacity: 0.9 }} />
            <Typography 
              variant="body2"
              sx={{ 
                fontSize: '0.85rem',
                fontWeight: 500,
                opacity: 0.9
              }}
            >
              {formatDate(event.startDate)}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 1
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                flex: 1, 
                fontSize: '1.1rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {event.title}
            </Typography>
            {event.isGlobalAdminEvent && (
              <PublicIcon sx={{ flexShrink: 0, fontSize: '1.2rem' }} />
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 2, pt: 1.5 }}>
          {event.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                mb: event.location ? 1.5 : 0
              }}
            >
              {event.description}
            </Typography>
          )}

          {event.location && (
            <>
              {event.description && <Divider sx={{ my: 1.5 }} />}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary'
              }}>
                <LocationIcon sx={{ fontSize: '0.9rem' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {truncateText(event.location, 35)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Popover>
  );
};

export default EventCard; 