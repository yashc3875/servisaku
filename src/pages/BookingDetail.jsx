import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Clock, MapPin, MessageSquare,
  Star, Phone, Download, RotateCcw, AlertTriangle, User
} from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import StatusBadge from '../components/StatusBadge';
import BookingTimeline from '../components/BookingTimeline';
import { isRefundEligible, formatBookingRef, STATUS_META } from '@/lib/bookingEngine';
import { ExtraServices } from '@/components/ExtraServices';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rating, _setRating] = useState(0);
  const [reviewText, _setReviewText] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [decidingExtra, setDecidingExtra] = useState(false);

  useEffect(() => {
    servisaku.entities.Booking.get(bookingId).then(setBooking);
    // Subscribe to real-time updates
    const unsub = servisaku.entities.Booking.subscribe(event => {
      if (event.id === bookingId) setBooking(event.data);
    });
    return unsub;
  }, [bookingId]);

  if (!booking) return (
    <div className="flex justify-center pt-32">
      <div className="w-6 h-6 border-2 border-raised border-t-brand rounded-full animate-spin" />
    </div>
  );

  const Icon = CalendarDays;
  const canCancel = ['pending', 'assigned'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.rating;
  const refundEligible = isRefundEligible(booking);

  const handleCancel = async () => {
    if (!cancelReason) return toast.error('Please provide a reason');
    await servisaku.entities.Booking.update(booking.id, {
      status: 'cancelled',
      cancellation_reason: cancelReason,
      cancelled_by: 'consumer',
    });
    setBooking(b => ({ ...b, status: 'cancelled', cancellation_reason: cancelReason }));
    setShowCancel(false);
    toast.success('Booking cancelled');
  };

  const handleDecideExtra = async (itemId, status) => {
    setDecidingExtra(true);
    try {
      const res = await servisaku.entities.Booking.decideExtra(booking.id, itemId, { status });
      setBooking(b => ({ ...b, extras: res.extras, price: res.price }));
      toast.success(status === 'approved' ? 'Extra approved — added to your bill' : 'Extra declined');
    } catch (e) {
      toast.error(e.message || 'Could not update');
    } finally {
      setDecidingExtra(false);
    }
  };

  const pendingExtras = (booking?.extras || []).filter(e => e.status === 'pending');

  const _handleReview = async () => {
    if (!rating) return toast.error('Please select a rating');
    await servisaku.entities.Booking.update(booking.id, { rating, review: reviewText });
    if (booking.partner_email) {
      await servisaku.entities.Review.create({
        booking_id: booking.id,
        partner_email: booking.partner_email,
        consumer_email: booking.consumer_email,
        rating, comment: reviewText,
        service_type: booking.service_type,
      });
    }
    setBooking(b => ({ ...b, rating, review: reviewText }));
    toast.success('Review submitted!');
  };

  const handleRebook = () => navigate('/explore');

  return (
    <div className="font-inter bg-bg min-h-screen" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="bg-surface border-b border-hairline/10 px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base text-ink">{booking.service_type}</h1>
            <p className="text-xs text-ink-secondary">{formatBookingRef(booking.id)}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* Service + Price Card */}
        <div className="bg-surface rounded-3xl border border-hairline/10 shadow-e1 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-raised">
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink">{booking.service_type}</p>
              {booking.package_name && <p className="text-xs text-ink-secondary">{booking.package_name} Package</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-brand text-lg">RM{booking.price}</p>
              {booking.discount_amount > 0 && (
                <p className="text-xs text-emerald-600">-RM{booking.discount_amount} saved</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { icon: CalendarDays, label: moment(booking.date).format('ddd, D MMM YYYY') },
              { icon: Clock, label: booking.time_slot },
              { icon: MapPin, label: booking.city },
              { icon: User, label: booking.partner_name || 'Pending assignment' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-ink-secondary">
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <BookingTimeline booking={booking} />

        {/* ETA / Live Status Banner */}
        {['en_route', 'arrived'].includes(booking.status) && (
          <div className="bg-brand rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-ink-inverse font-bold text-sm">
                {booking.status === 'en_route' ? '🚗 Partner is on the way' : '📍 Partner has arrived!'}
              </p>
              <p className="text-ink-inverse/60 text-xs mt-0.5">
                {booking.status === 'en_route' ? 'Estimated arrival: ~15 minutes' : 'Starting service shortly'}
              </p>
            </div>
            <div className="w-10 h-10 bg-surface/20 rounded-xl flex items-center justify-center">
              <span className="text-ink-inverse text-lg">{STATUS_META[booking.status]?.icon}</span>
            </div>
          </div>
        )}

        {/* Extra services — partner-proposed, customer approves */}
        {booking.extras?.length > 0 && (
          <div className="bg-surface rounded-3xl border border-hairline/10 shadow-e1 p-4">
            <p className="text-xs text-ink-secondary font-medium mb-1">Extra services</p>
            {pendingExtras.length > 0 && (
              <p className="text-[11px] text-amber-600 mb-3">Your partner proposed extra work — approve to add it to your bill.</p>
            )}
            <ExtraServices
              extras={booking.extras}
              mode="consumer"
              onDecide={handleDecideExtra}
              busy={decidingExtra}
            />
          </div>
        )}

        {/* Partner Card */}
        {booking.partner_name && (
          <div className="bg-surface rounded-3xl border border-hairline/10 shadow-e1 p-4">
            <p className="text-xs text-ink-secondary font-medium mb-3">Your Partner</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-tint flex items-center justify-center">
                  <span className="font-bold text-brand">{booking.partner_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink">{booking.partner_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-ink">4.9</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/chat/${booking.id}`)}
                  aria-label="Call partner"
                  className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center hover:bg-brand-tint transition-colors">
                  <Phone className="h-4 w-4 text-ink-secondary" />
                </button>
                <button
                  onClick={() => navigate(`/chat/${booking.id}`)}
                  aria-label="Message partner"
                  className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center hover:bg-brand-tint transition-colors">
                  <MessageSquare className="h-4 w-4 text-ink-secondary" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review */}
        {canReview && (
          <button onClick={() => navigate(`/review/${booking.id}`)}
            className="w-full bg-brand text-ink-inverse rounded-3xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(20,83,45,0.2)] hover:bg-brand/90 transition-colors">
            <div className="text-left">
              <p className="font-bold text-sm">Rate Your Experience</p>
              <p className="text-ink-inverse/70 text-xs mt-0.5">Takes only 30 seconds</p>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-amber-300" />)}
            </div>
          </button>
        )}

        {booking.rating && (
          <div className="bg-surface rounded-2xl border border-hairline/10 p-4">
            <p className="text-xs text-ink-secondary mb-2">Your Review</p>
            <div className="flex gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-4 w-4 ${i <= booking.rating ? 'text-amber-400 fill-amber-400' : 'text-raised'}`} />
              ))}
            </div>
            {booking.review && <p className="text-xs text-ink-secondary">{booking.review}</p>}
          </div>
        )}

        {/* Invoice + Actions */}
        <div className="flex gap-2">
          <button onClick={() => toast.info('Invoice PDF coming soon')}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-hairline/10 bg-surface text-ink text-sm font-medium hover:bg-raised transition-colors">
            <Download className="h-4 w-4" /> Invoice
          </button>
          {booking.status === 'completed' && (
            <button onClick={handleRebook}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-hairline/10 bg-surface text-ink text-sm font-medium hover:bg-raised transition-colors">
              <RotateCcw className="h-4 w-4" /> Rebook
            </button>
          )}
        </div>

        {/* Cancel + Refund */}
        {canCancel && !showCancel && (
          <button onClick={() => setShowCancel(true)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
            <AlertTriangle className="h-4 w-4" /> Cancel Booking
          </button>
        )}

        {showCancel && (
          <div className="bg-surface rounded-3xl border border-red-100 p-4 space-y-3">
            <p className="text-sm font-bold text-red-700">Cancel Booking</p>
            {refundEligible && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700">
                You are eligible for a full refund.
              </div>
            )}
            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              className="w-full bg-raised rounded-xl px-4 py-3 text-sm text-ink outline-none">
              <option value="">Select reason</option>
              {['Changed my mind', 'Partner not responding', 'Need to reschedule', 'Found another service', 'Emergency at home', 'Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="destructive" className="flex-1 rounded-xl text-sm h-10">Confirm Cancel</Button>
              <Button onClick={() => setShowCancel(false)} variant="outline" className="flex-1 rounded-xl text-sm h-10 border-hairline/10 text-ink">Keep Booking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}