import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Navigation, Phone, MessageSquare, Camera, CheckCircle2,
  AlertTriangle, Clock, MapPin, ArrowLeft, X, Upload
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking';
import { startGPSTracking, stopGPSTracking, sendSystemMessage, changeBookingStatus } from '@/lib/realtimeService';
import { STATUS_TRANSITIONS, STATUS_META } from '@/lib/bookingEngine';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';

const ACTION_CONFIG = {
  accepted:  { label: 'Start Travelling', next: 'en_route',  color: 'bg-blue-600', icon: Navigation },
  en_route:  { label: 'Mark Arrived',     next: 'arrived',   color: 'bg-violet-600', icon: MapPin },
  arrived:   { label: 'Start Service',    next: 'started',   color: 'bg-primary', icon: CheckCircle2 },
  started:   { label: 'Complete Job',     next: 'completed', color: 'bg-emerald-600', icon: CheckCircle2 },
};

export default function PartnerJobScreen() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { booking, loading, setBooking } = useRealtimeBooking(bookingId);
  const [user, setUser] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [showDelay, setShowDelay] = useState(false);
  const [showCannotAccess, setShowCannotAccess] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState('15');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    base44.auth.me().then(setUser);
    return () => stopGPSTracking();
  }, []);

  useEffect(() => {
    if (booking?.status === 'en_route' && user && !gpsActive) {
      startGPSTracking(user.email, bookingId, () => {});
      setGpsActive(true);
      toast.success('Live GPS tracking started');
    }
    if (!['en_route', 'arrived'].includes(booking?.status) && gpsActive) {
      stopGPSTracking();
      setGpsActive(false);
    }
  }, [booking?.status, user]);

  if (loading || !booking) return (
    <div className="flex justify-center pt-32"><div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>
  );

  const action = ACTION_CONFIG[booking.status];
  const statusMeta = STATUS_META[booking.status];

  const handleAction = async () => {
    if (!action) return;
    if (action.next === 'completed' && completionPhotos.length === 0) {
      toast.error('Please upload at least one completion photo');
      return;
    }
    await changeBookingStatus(booking.id, action.next, {
      ...(action.next === 'started' ? { partner_started_at: new Date().toISOString() } : {}),
      ...(action.next === 'completed' ? { partner_completed_at: new Date().toISOString() } : {}),
    });
    await sendSystemMessage(booking.id, `Partner ${action.next.replace('_', ' ')}`);
    setBooking(b => ({ ...b, status: action.next }));
    toast.success(`Status updated: ${action.next.replace('_', ' ')}`);
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCompletionPhotos(p => [...p, file_url]);
    }
    setUploading(false);
    toast.success('Photo uploaded');
  };

  const handleDelay = async () => {
    await sendSystemMessage(booking.id, `Partner reported a ${delayMinutes}-minute delay`);
    await base44.entities.Notification.create({
      user_email: booking.consumer_email,
      title: 'Partner Running Late',
      body: `Your partner will be approximately ${delayMinutes} minutes late. We apologise for the inconvenience.`,
      type: 'booking_update',
      reference_id: booking.id,
      channel: 'in_app',
    });
    setShowDelay(false);
    toast.success('Delay notification sent to consumer');
  };

  const handleCannotAccess = async () => {
    await sendSystemMessage(booking.id, 'Partner cannot access the property. Please contact partner.');
    await base44.entities.Notification.create({
      user_email: booking.consumer_email,
      title: 'Access Issue',
      body: 'Your partner is at the property but cannot gain access. Please respond immediately.',
      type: 'booking_update',
      reference_id: booking.id,
      channel: 'in_app',
    });
    setShowCannotAccess(false);
    toast.success('Alert sent to consumer');
  };

  return (
    <div className="min-h-screen bg-background font-inter pb-32">
      {/* Header */}
      <div className={`px-5 pt-14 pb-5 text-white ${
        booking.status === 'completed' ? 'bg-emerald-600' : 'bg-primary'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/partner')} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-white/60 text-xs">Active Job</p>
            <h1 className="text-lg font-bold">{booking.service_type}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-green-300 animate-pulse' : 'bg-white/40'}`} />
            <span className="text-xs font-medium">{gpsActive ? 'GPS Live' : 'GPS Off'}</span>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">{statusMeta?.icon}</span>
          <div>
            <p className="font-bold text-sm">{statusMeta?.label}</p>
            <p className="text-white/60 text-xs">
              {moment(booking.date).format('ddd, D MMM')} • {booking.time_slot}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Consumer Details */}
        <div className="bg-white rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
          <p className="text-xs text-muted-foreground font-medium mb-3">Consumer</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
              <span className="font-bold text-blue-600">{booking.consumer_name?.charAt(0) || '?'}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{booking.consumer_name}</p>
              <p className="text-xs text-muted-foreground">{booking.package_name} Package</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${booking.consumer_phone}`}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </a>
              <button onClick={() => navigate(`/chat/${booking.id}`)}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            <span>{booking.address}</span>
          </div>
          {booking.notes && (
            <div className="mt-2 text-xs text-muted-foreground bg-amber-50 border border-amber-100 rounded-xl p-3">
              <strong className="text-amber-700">Notes:</strong> {booking.notes}
            </div>
          )}
        </div>

        {/* Navigate Button */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-colors"
        >
          <Navigation className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-blue-700">Navigate to Location</p>
            <p className="text-xs text-blue-500">Open in Google Maps</p>
          </div>
        </a>

        {/* Completion Photos */}
        {booking.status === 'started' && (
          <div className="bg-white rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
            <p className="text-sm font-bold mb-1">Completion Photos</p>
            <p className="text-xs text-muted-foreground mb-3">Required before completing job</p>
            <div className="flex gap-2 flex-wrap">
              {completionPhotos.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => setCompletionPhotos(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/30">
                {uploading ? <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
                <span className="text-[9px] text-muted-foreground mt-1">Add</span>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
              </label>
            </div>
          </div>
        )}

        {/* Delay + Cannot Access */}
        {['en_route', 'arrived'].includes(booking.status) && (
          <div className="flex gap-2">
            <button onClick={() => setShowDelay(true)}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
              <Clock className="h-4 w-4" /> Report Delay
            </button>
            <button onClick={() => setShowCannotAccess(true)}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
              <AlertTriangle className="h-4 w-4" /> Cannot Access
            </button>
          </div>
        )}

        {/* Delay Modal */}
        {showDelay && (
          <div className="bg-white rounded-3xl border border-amber-200 p-4 space-y-3">
            <p className="text-sm font-bold text-amber-700">Report Delay</p>
            <select value={delayMinutes} onChange={e => setDelayMinutes(e.target.value)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none">
              {['10', '15', '20', '30', '45', '60'].map(m => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleDelay} className="flex-1 rounded-xl h-10 bg-amber-500 hover:bg-amber-600">Notify Consumer</Button>
              <Button onClick={() => setShowDelay(false)} variant="outline" className="flex-1 rounded-xl h-10">Cancel</Button>
            </div>
          </div>
        )}

        {/* Cannot Access Modal */}
        {showCannotAccess && (
          <div className="bg-white rounded-3xl border border-red-200 p-4 space-y-3">
            <p className="text-sm font-bold text-red-700">Cannot Access Property</p>
            <p className="text-xs text-muted-foreground">This will immediately alert the consumer and FixMate support.</p>
            <div className="flex gap-2">
              <Button onClick={handleCannotAccess} variant="destructive" className="flex-1 rounded-xl h-10">Send Alert</Button>
              <Button onClick={() => setShowCannotAccess(false)} variant="outline" className="flex-1 rounded-xl h-10">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Button */}
      {action && booking.status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl border-t border-border px-5 py-4">
            <Button onClick={handleAction}
              className={`w-full h-12 rounded-2xl text-base font-bold shadow-[0_8px_40px_rgba(20,83,45,0.18)] ${action.color}`}>
              <action.icon className="h-5 w-5 mr-2" />
              {action.label}
              {action.next === 'completed' && completionPhotos.length === 0 && ' (add photos first)'}
            </Button>
          </div>
        </div>
      )}

      {booking.status === 'completed' && (
        <div className="mx-5 mt-4 bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center">
          <span className="text-4xl mb-2 block">🎉</span>
          <p className="font-bold text-emerald-700 text-lg">Job Completed!</p>
          <p className="text-xs text-emerald-600 mt-1">Earnings will be credited within 48 hours</p>
        </div>
      )}
    </div>
  );
}