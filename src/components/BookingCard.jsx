import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { SERVICES } from '@/lib/services';
import moment from 'moment';

export default function BookingCard({ booking }) {
  const service = SERVICES.find(s => s.name === booking.service_type);
  const Icon = service?.icon || CalendarDays;

  return (
    <Link to={`/booking/${booking.id}`}
      className="flex items-center gap-3 bg-white rounded-3xl border border-border p-4 shadow-card hover:shadow-card-hover transition-all duration-200 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${service?.color || 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-foreground">{booking.service_type}</p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />{moment(booking.date).format('D MMM')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{booking.time_slot}
          </span>
          {booking.city && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" />{booking.city}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}