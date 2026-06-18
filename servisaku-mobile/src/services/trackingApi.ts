import type { BookingStatus, GeoPoint, TrackingUpdate } from '@/types';

/**
 * Mocked real-time tracking. In production this subscribes to a Socket.IO room
 * (`config.SOCKET_URL`, event `tracking:update`). Today it drives the same
 * `TrackingUpdate` payloads from a local timer so the live-tracking UI is fully
 * functional end-to-end.
 *
 * // API-INTEGRATION: socket.on('tracking:update', (payload: TrackingUpdate) => ...)
 */

type Listener = (update: TrackingUpdate) => void;

const STATUS_FLOW: BookingStatus[] = [
  'confirmed',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
];

/** Lerp the partner from a start point toward the destination. */
function interpolate(from: GeoPoint, to: GeoPoint, t: number): GeoPoint {
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * t,
    longitude: from.longitude + (to.longitude - from.longitude) * t,
  };
}

export interface TrackingHandle {
  stop: () => void;
}

export const trackingApi = {
  /**
   * Subscribe to live updates for a booking. Returns a handle to unsubscribe.
   * The mock animates the partner from a nearby origin to the destination and
   * advances the status timeline on a cadence.
   */
  subscribe(
    bookingId: string,
    destination: GeoPoint,
    onUpdate: Listener,
    opts: { startStatus?: BookingStatus; tickMs?: number } = {},
  ): TrackingHandle {
    const tickMs = opts.tickMs ?? 2200;
    const origin: GeoPoint = {
      latitude: destination.latitude - 0.018,
      longitude: destination.longitude - 0.022,
    };

    const startIdx = Math.max(
      0,
      STATUS_FLOW.indexOf(opts.startStatus ?? 'en_route'),
    );
    let statusIdx = startIdx;
    let progress = 0;

    const emit = () => {
      const status = STATUS_FLOW[statusIdx]!;
      const moving = status === 'en_route';
      if (moving) progress = Math.min(1, progress + 0.16);

      const partnerLocation =
        status === 'en_route'
          ? interpolate(origin, destination, progress)
          : status === 'arrived' ||
              status === 'in_progress' ||
              status === 'completed'
            ? destination
            : interpolate(origin, destination, 0);

      const etaMinutes =
        status === 'en_route' ? Math.max(1, Math.round((1 - progress) * 18)) : 0;

      onUpdate({
        bookingId,
        status,
        partnerLocation,
        etaMinutes,
        timestamp: new Date().toISOString(),
      });

      // Advance status when the current phase finishes.
      if (status === 'en_route' && progress >= 1) {
        statusIdx += 1;
        progress = 0;
      } else if (status !== 'en_route' && status !== 'completed') {
        // Linger one tick then advance non-moving phases.
        statusIdx += 1;
      }
    };

    // Emit an initial frame immediately, then on an interval.
    emit();
    const interval = setInterval(() => {
      if (statusIdx >= STATUS_FLOW.length - 1) {
        emit();
        clearInterval(interval);
        return;
      }
      emit();
    }, tickMs);

    return { stop: () => clearInterval(interval) };
  },
};
