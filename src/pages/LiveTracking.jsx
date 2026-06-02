import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, X, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRealtimeBooking, usePartnerLocation } from '@/hooks/useRealtimeBooking';
import { calcETA, KL_CENTER } from '@/lib/realtimeService';
import { STATUS_META } from '@/lib/bookingEngine';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Partner marker with smooth CSS transitions and a subtle pulse
const partnerIcon = L.divIcon({
  className: 'transition-transform duration-75 ease-linear',
  html: `
    <div class="relative flex items-center justify-center w-11 h-11">
      <div class="absolute inset-0 bg-brand rounded-full animate-pulse opacity-40"></div>
      <div class="relative z-10 w-11 h-11 bg-brand rounded-full border-[3px] border-white shadow-[0_4px_16px_rgba(20,83,45,0.4)] flex items-center justify-center text-[18px]">🔧</div>
    </div>
  `,
  iconSize: [44, 44], iconAnchor: [22, 22],
});

// Destination marker with an aggressive radar ping
const destIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-60"></div>
      <div class="relative z-10 w-9 h-9 bg-red-500 rounded-full border-[2.5px] border-white shadow-lg flex items-center justify-center text-sm">🏠</div>
    </div>
  `,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

// Component to recenter the map on the partner
function FlyTo({ center }) {
  const map = useMap();
  const hasFlown = useRef(false);
  useEffect(() => { 
    if (center && !hasFlown.current) {
      map.flyTo(center, 15, { duration: 1.5 }); 
      hasFlown.current = true;
    }
  }, [center]);
  return null;
}

export default function LiveTracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { booking, loading } = useRealtimeBooking(bookingId);
  const partnerLoc = usePartnerLocation(booking?.partner_email);
  const [eta, setEta] = useState(null);
  
  // Smooth mock animation state
  const destPos = { lat: KL_CENTER.lat, lng: KL_CENTER.lng };
  const initialPartnerPos = { lat: destPos.lat - 0.015, lng: destPos.lng - 0.012 };
  const [simLoc, setSimLoc] = useState(initialPartnerPos);
  const animationRef = useRef(null);

  // 60FPS Smooth Mock Interpolation
  useEffect(() => {
    if (booking && ['en_route', 'accepted'].includes(booking.status) && !partnerLoc?.latitude) {
      let currentLat = initialPartnerPos.lat;
      let currentLng = initialPartnerPos.lng;
      
      const animate = () => {
        // Move 0.1% closer to the destination each frame
        const latDiff = destPos.lat - currentLat;
        const lngDiff = destPos.lng - currentLng;
        
        // Stop animating if very close
        if (Math.abs(latDiff) > 0.0001 || Math.abs(lngDiff) > 0.0001) {
          currentLat += latDiff * 0.001;
          currentLng += lngDiff * 0.001;
          setSimLoc({ lat: currentLat, lng: currentLng });
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [booking?.status, partnerLoc?.latitude]);

  const partnerPos = partnerLoc?.latitude
    ? { lat: partnerLoc.latitude, lng: partnerLoc.longitude }
    : simLoc;

  useEffect(() => {
    if (partnerPos) {
      const e = calcETA(partnerPos.lat, partnerPos.lng, destPos.lat, destPos.lng, 40); // slightly faster mock speed
      setEta(e);
    }
  }, [partnerPos]);

  if (loading || !booking) return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-hairline border-t-brand rounded-full animate-spin" />
    </div>
  );

  const statusMeta = STATUS_META[booking.status];

  return (
    <div className="h-screen flex flex-col font-inter relative bg-surface">
      {/* Full-screen Map */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[KL_CENTER.lat - 0.007, KL_CENTER.lng - 0.006]}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {partnerPos && (
            <Marker position={[partnerPos.lat, partnerPos.lng]} icon={partnerIcon}>
              <Popup className="font-inter rounded-xl overflow-hidden font-bold">{booking.partner_name || 'Partner'}</Popup>
            </Marker>
          )}
          <Marker position={[destPos.lat, destPos.lng]} icon={destIcon}>
            <Popup className="font-inter font-bold">Your location</Popup>
          </Marker>
          {partnerPos && (
            <Polyline
              positions={[[partnerPos.lat, partnerPos.lng], [destPos.lat, destPos.lng]]}
              pathOptions={{ color: 'hsl(var(--brand))', weight: 4, dashArray: '8 8', opacity: 0.8, lineCap: 'round' }}
            />
          )}
          {partnerPos && <FlyTo center={[partnerPos.lat, partnerPos.lng]} />}
        </MapContainer>

        {/* Floating Back Button */}
        <button onClick={() => navigate(`/booking/${bookingId}`)}
          className="absolute top-5 left-5 z-[1000] w-11 h-11 bg-surface/90 backdrop-blur-md rounded-2xl shadow-e2 border border-hairline/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <X className="h-5 w-5 text-ink" />
        </button>

        {/* Dynamic ETA Pill */}
        {eta && booking.status === 'en_route' && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] bg-surface/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-e2 border border-hairline/10 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--brand))]" />
            <span className="text-sm font-bold text-ink tracking-tight">{eta} min away</span>
          </div>
        )}
      </div>

      {/* Modern Bottom Sheet Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-surface rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.08)] border-t border-hairline/5">
        <div className="w-12 h-1.5 bg-hairline/20 rounded-full mx-auto mt-3.5 mb-5" />

        {/* Dynamic Status Banner */}
        <div className={`mx-5 mb-5 rounded-2xl p-4 flex items-center gap-3.5 transition-all ${
          booking.status === 'arrived' ? 'bg-brand-tint border border-brand/20' :
          booking.status === 'started' ? 'bg-blue-50 border border-blue-100' :
          'bg-amber-50 border border-amber-100'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-white/60 shadow-sm flex items-center justify-center shrink-0 text-xl">
            {statusMeta?.icon}
          </div>
          <div>
            <p className={`font-bold text-[15px] leading-tight ${
              booking.status === 'arrived' ? 'text-brand' : booking.status === 'started' ? 'text-blue-700' : 'text-amber-800'
            }`}>
              {booking.status === 'en_route' && `Partner on the way • ETA ${eta || '—'} min`}
              {booking.status === 'arrived' && 'Partner has arrived!'}
              {booking.status === 'started' && 'Service in progress'}
              {booking.status === 'accepted' && 'Partner preparing to depart'}
            </p>
            <p className="text-xs font-medium text-ink/60 mt-1">{booking.service_type} • {booking.time_slot}</p>
          </div>
        </div>

        {/* Partner Info & Actions */}
        <div className="mx-5 flex items-center gap-3.5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-tint flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-2xl font-bold text-brand">{booking.partner_name?.charAt(0) || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-ink truncate">{booking.partner_name || 'Your Partner'}</p>
            <p className="text-xs font-medium text-ink-secondary mt-0.5">
              {partnerLoc?.speed ? `${partnerLoc.speed} km/h` : 'Honda City • VAM 2314'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="w-12 h-12 rounded-2xl bg-raised flex items-center justify-center hover:bg-brand-tint transition-colors active:scale-95">
              <Phone className="h-5 w-5 text-ink-secondary hover:text-brand transition-colors" />
            </button>
            <button onClick={() => navigate(`/chat/${bookingId}`)}
              className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center shadow-e2 active:scale-95 transition-all">
              <MessageSquare className="h-5 w-5 text-ink-inverse" />
            </button>
          </div>
        </div>

        {/* Destination Address */}
        <div className="mx-5 mb-8 flex items-start gap-2.5 p-3 rounded-2xl bg-raised/50">
          <Navigation className="h-4 w-4 mt-0.5 shrink-0 text-brand" />
          <span className="text-xs font-medium leading-relaxed text-ink-secondary">{booking.address}</span>
        </div>
      </div>
    </div>
  );
}