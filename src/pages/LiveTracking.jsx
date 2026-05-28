import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, X, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRealtimeBooking, usePartnerLocation } from '@/hooks/useRealtimeBooking';
import { calcETA, KL_CENTER, simulateMovement } from '@/lib/realtimeService';
import { STATUS_META } from '@/lib/bookingEngine';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const partnerIcon = L.divIcon({
  className: '',
  html: `<div style="width:40px;height:40px;background:#14532d;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🔧</div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">🏠</div>`,
  iconSize: [36, 36], iconAnchor: [18, 18],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.5 }); }, [center]);
  return null;
}

export default function LiveTracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { booking, loading } = useRealtimeBooking(bookingId);
  const partnerLoc = usePartnerLocation(booking?.partner_email);
  const [eta, setEta] = useState(null);
  const [simStep, setSimStep] = useState(0);
  const [simLoc, setSimLoc] = useState(null);
  const simRef = useRef(null);

  // Simulate partner movement if no real GPS data
  useEffect(() => {
    if (booking && ['en_route', 'accepted'].includes(booking.status) && !partnerLoc?.latitude) {
      const base = { lat: KL_CENTER.lat + 0.02, lng: KL_CENTER.lng + 0.01 };
      setSimLoc(base);
      simRef.current = setInterval(() => {
        setSimStep(s => {
          const next = s + 1;
          const pos = simulateMovement(base.lat, base.lng, next);
          setSimLoc(pos);
          return next;
        });
      }, 3000);
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [booking?.status]);

  const partnerPos = partnerLoc?.latitude
    ? { lat: partnerLoc.latitude, lng: partnerLoc.longitude }
    : simLoc;

  const destPos = { lat: KL_CENTER.lat, lng: KL_CENTER.lng };

  useEffect(() => {
    if (partnerPos) {
      const e = calcETA(partnerPos.lat, partnerPos.lng, destPos.lat, destPos.lng, 30);
      setEta(e);
    }
  }, [partnerPos]);

  if (loading || !booking) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  const statusMeta = STATUS_META[booking.status];
  const isActive = ['en_route', 'arrived', 'started'].includes(booking.status);

  return (
    <div className="h-screen flex flex-col font-inter relative">
      {/* Full-screen Map */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[KL_CENTER.lat, KL_CENTER.lng]}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {partnerPos && (
            <Marker position={[partnerPos.lat, partnerPos.lng]} icon={partnerIcon}>
              <Popup>{booking.partner_name || 'Partner'}</Popup>
            </Marker>
          )}
          <Marker position={[destPos.lat, destPos.lng]} icon={destIcon}>
            <Popup>Your location</Popup>
          </Marker>
          {partnerPos && (
            <Polyline
              positions={[[partnerPos.lat, partnerPos.lng], [destPos.lat, destPos.lng]]}
              pathOptions={{ color: '#14532d', weight: 3, dashArray: '8 6', opacity: 0.7 }}
            />
          )}
          {partnerPos && <FlyTo center={[partnerPos.lat, partnerPos.lng]} />}
        </MapContainer>

        {/* Back Button */}
        <button onClick={() => navigate(`/booking/${bookingId}`)}
          className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>

        {/* ETA Pill */}
        {eta && booking.status === 'en_route' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-bold text-primary">{eta} min away</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-4px_32px_rgba(0,0,0,0.12)]">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />

        {/* Status Banner */}
        <div className={`mx-5 mb-4 rounded-2xl p-3 flex items-center gap-3 ${
          booking.status === 'arrived' ? 'bg-primary/10 border border-primary/20' :
          booking.status === 'started' ? 'bg-blue-50 border border-blue-100' :
          'bg-amber-50 border border-amber-100'
        }`}>
          <span className="text-2xl">{statusMeta?.icon}</span>
          <div>
            <p className={`font-bold text-sm ${
              booking.status === 'arrived' ? 'text-primary' : booking.status === 'started' ? 'text-blue-700' : 'text-amber-700'
            }`}>
              {booking.status === 'en_route' && `Partner on the way • ETA ${eta || '—'} min`}
              {booking.status === 'arrived' && 'Partner has arrived at your location'}
              {booking.status === 'started' && 'Service in progress'}
              {booking.status === 'accepted' && 'Partner confirmed, preparing to depart'}
            </p>
            <p className="text-xs text-muted-foreground">{booking.service_type} • {booking.time_slot}</p>
          </div>
        </div>

        {/* Partner Info */}
        <div className="mx-5 flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">{booking.partner_name?.charAt(0) || '?'}</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{booking.partner_name || 'Your Partner'}</p>
            <p className="text-xs text-muted-foreground">
              {partnerLoc?.speed ? `${partnerLoc.speed} km/h` : 'On the way'}
              {partnerLoc?.accuracy ? ` • ±${partnerLoc.accuracy}m` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => navigate(`/chat/${bookingId}`)}
              className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="mx-5 mb-5 flex items-start gap-2 text-xs text-muted-foreground">
          <Navigation className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
          <span>{booking.address}</span>
        </div>
      </div>
    </div>
  );
}