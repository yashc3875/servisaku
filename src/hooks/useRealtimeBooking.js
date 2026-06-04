import { useState, useEffect } from 'react';
import { servisaku } from '@/api/servisakuClient';

export function useRealtimeBooking(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    servisaku.entities.Booking.get(bookingId).then(b => { setBooking(b); setLoading(false); });

    const unsub = servisaku.entities.Booking.subscribe(event => {
      if (event.id === bookingId && (event.type === 'update' || event.type === 'create')) {
        setBooking(event.data);
      }
    });
    return unsub;
  }, [bookingId]);

  return { booking, loading, setBooking };
}

export function usePartnerLocation(partnerEmail) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!partnerEmail) return;
    servisaku.entities.PartnerLocation.filter({ partner_email: partnerEmail })
      .then(locs => { if (locs[0]) setLocation(locs[0]); });

    const unsub = servisaku.entities.PartnerLocation.subscribe(event => {
      if (event.data?.partner_email === partnerEmail) setLocation(event.data);
    });
    return unsub;
  }, [partnerEmail]);

  return location;
}

export function useActiveBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    servisaku.entities.Booking.filter({}).then(all => {
      setBookings(all.filter(b => !['completed', 'cancelled'].includes(b.status)));
    });

    const unsub = servisaku.entities.Booking.subscribe(event => {
      if (event.type === 'create') {
        setBookings(prev => ['completed', 'cancelled'].includes(event.data.status)
          ? prev : [event.data, ...prev]);
      } else if (event.type === 'update') {
        setBookings(prev => {
          const filtered = prev.filter(b => b.id !== event.id);
          return ['completed', 'cancelled'].includes(event.data.status)
            ? filtered : [event.data, ...filtered];
        });
      } else if (event.type === 'delete') {
        setBookings(prev => prev.filter(b => b.id !== event.id));
      }
    });
    return unsub;
  }, []);

  return bookings;
}

export function useOnlinePartners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    servisaku.entities.PartnerLocation.filter({ is_online: true }).then(setPartners);
    const unsub = servisaku.entities.PartnerLocation.subscribe(event => {
      if (event.type === 'update' || event.type === 'create') {
        setPartners(prev => {
          const filtered = prev.filter(p => p.id !== event.id);
          return event.data.is_online ? [event.data, ...filtered] : filtered;
        });
      }
    });
    return unsub;
  }, []);

  return partners;
}

export function useLiveNotifications(userEmail) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userEmail) return;
    servisaku.entities.Notification.filter({ user_email: userEmail, is_read: false }, '-created_date', 20)
      .then(n => { setNotifications(n); setUnreadCount(n.length); });

    const unsub = servisaku.entities.Notification.subscribe(event => {
      if (event.data?.user_email === userEmail && event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
        setUnreadCount(c => c + 1);
        if (event.data.type !== 'system') {
          try { new Audio('/notification.mp3').play().catch(() => {}); } catch {}
        }
      }
    });
    return unsub;
  }, [userEmail]);

  const markAllRead = async () => {
    for (const n of notifications.filter(n => !n.is_read)) {
      await servisaku.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() });
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}