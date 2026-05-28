// ServisAku Notification Engine — event-driven, multi-channel
import { base44 } from '@/api/base44Client';
import { getTemplate } from './notificationTemplates';
import { buildEmailHtml } from './emailTemplates';

// ─── In-flight dedup cache (prevents double-fire in same session) ─────────
const _sent = new Set();
function dedup(key) {
  if (_sent.has(key)) return true;
  _sent.add(key);
  setTimeout(() => _sent.delete(key), 60000);
  return false;
}

// ─── Core Dispatch ────────────────────────────────────────────────────────
export async function dispatch(eventType, recipientEmail, data = {}, options = {}) {
  const { channels = ['in_app'], lang = 'en', referenceId, referenceType } = options;
  const dedupKey = `${eventType}:${recipientEmail}:${referenceId || ''}`;
  if (dedup(dedupKey)) return;

  const tmpl = getTemplate(eventType, lang);
  if (!tmpl) return;

  const title = typeof tmpl.title === 'function' ? tmpl.title(data) : tmpl.title;
  const body = typeof tmpl.body === 'function' ? tmpl.body(data) : tmpl.body(data);

  const logBase = { user_email: recipientEmail, event_type: eventType, reference_id: referenceId, reference_type: referenceType, language: lang };

  // ── In-App ──
  if (channels.includes('in_app')) {
    await base44.entities.Notification.create({
      user_email: recipientEmail, title, body,
      type: _notifType(eventType), channel: 'in_app',
      reference_id: referenceId, reference_type: referenceType,
      is_read: false, sent_at: new Date().toISOString(),
    });
    await _log({ ...logBase, channel: 'in_app', status: 'sent', subject: title, body_preview: body.slice(0, 100) });
  }

  // ── Email ──
  if (channels.includes('email') && tmpl.email_subject) {
    const subject = typeof tmpl.email_subject === 'function' ? tmpl.email_subject(data) : tmpl.email_subject;
    const html = buildEmailHtml(eventType, title, body, data, lang);
    try {
      await base44.integrations.Core.SendEmail({ to: recipientEmail, subject, body: html });
      await _log({ ...logBase, channel: 'email', status: 'sent', subject, body_preview: body.slice(0, 100) });
    } catch (e) {
      await _log({ ...logBase, channel: 'email', status: 'failed', subject, failure_reason: String(e) });
    }
  }

  // ── SMS (architecture ready — logs as queued, real sending needs backend function) ──
  if (channels.includes('sms') && tmpl.sms) {
    const smsBody = typeof tmpl.sms === 'function' ? tmpl.sms(data) : tmpl.sms;
    await _log({ ...logBase, channel: 'sms', status: 'queued', body_preview: smsBody.slice(0, 160) });
  }
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────
export const notifyBookingConfirmed = (email, booking, lang) =>
  dispatch('booking_confirmed', email, {
    service_type: booking.service_type, date: booking.date,
    time_slot: booking.time_slot, ref: booking.id?.slice(-8).toUpperCase(),
  }, { channels: ['in_app', 'email', 'sms'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyPartnerAssigned = (consumerEmail, booking, lang) =>
  dispatch('booking_assigned', consumerEmail, {
    partner_name: booking.partner_name, service_type: booking.service_type,
  }, { channels: ['in_app', 'email'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyEnRoute = (consumerEmail, booking, eta, lang) =>
  dispatch('partner_en_route', consumerEmail, {
    partner_name: booking.partner_name, eta,
    track_url: `${window.location.origin}/tracking/${booking.id}`,
  }, { channels: ['in_app', 'sms'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyArrived = (consumerEmail, booking, lang) =>
  dispatch('partner_arrived', consumerEmail, { partner_name: booking.partner_name },
    { channels: ['in_app', 'sms'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyCompleted = (consumerEmail, booking, lang) =>
  dispatch('booking_completed', consumerEmail, {
    service_type: booking.service_type, partner_name: booking.partner_name,
  }, { channels: ['in_app', 'email'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyPaymentSuccess = (email, payment, booking, lang) =>
  dispatch('payment_success', email, {
    amount: payment.amount, service_type: booking?.service_type || 'Service',
    ref: payment.id?.slice(-8).toUpperCase(),
  }, { channels: ['in_app', 'email', 'sms'], lang, referenceId: payment.id, referenceType: 'payment' });

export const notifyRefund = (email, amount, lang) =>
  dispatch('refund_processed', email, { amount },
    { channels: ['in_app', 'email', 'sms'], lang });

export const notifyPayout = (partnerEmail, amount, bank, lang) =>
  dispatch('payout_processed', partnerEmail, { amount, bank },
    { channels: ['in_app', 'email'], lang });

export const notifyLowRating = (partnerEmail, rating, lang) =>
  dispatch('low_rating_alert', partnerEmail, { rating },
    { channels: ['in_app'], lang });

export const notifyDisputeCreated = (email, bookingId, lang) =>
  dispatch('dispute_created', email, { ref: bookingId?.slice(-8).toUpperCase() },
    { channels: ['in_app', 'email'], lang, referenceId: bookingId, referenceType: 'booking' });

export const notifyReminder24h = (email, booking, lang) =>
  dispatch('reminder_24h', email, {
    service_type: booking.service_type, time_slot: booking.time_slot,
    partner_name: booking.partner_name,
  }, { channels: ['in_app', 'sms'], lang, referenceId: booking.id, referenceType: 'booking' });

export const notifyReviewReminder = (email, booking, lang) =>
  dispatch('review_reminder', email, {
    service_type: booking.service_type, partner_name: booking.partner_name,
  }, { channels: ['in_app'], lang, referenceId: booking.id, referenceType: 'booking' });

// ─── Admin Broadcast ──────────────────────────────────────────────────────
export async function sendBroadcast(campaign, recipients) {
  let sent = 0;
  for (const r of recipients) {
    const lang = r.language || 'en';
    const body = lang === 'bm' && campaign.body_bm ? campaign.body_bm : campaign.body;
    if (campaign.channels?.includes('in_app')) {
      await base44.entities.Notification.create({
        user_email: r.email, title: campaign.subject, body,
        type: 'promo', channel: 'in_app', is_read: false,
        sent_at: new Date().toISOString(),
      });
    }
    if (campaign.channels?.includes('email')) {
      await base44.integrations.Core.SendEmail({ to: r.email, subject: campaign.subject, body });
    }
    sent++;
    // Rate-limit: ~10/s
    if (sent % 10 === 0) await new Promise(r => setTimeout(r, 1000));
  }
  await base44.entities.Campaign.update(campaign.id, {
    status: 'sent', sent_at: new Date().toISOString(), sent_count: sent,
  });
  return sent;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function _notifType(eventType) {
  if (eventType.includes('payment') || eventType.includes('payout') || eventType.includes('refund')) return 'payment';
  if (eventType.includes('booking') || eventType.includes('partner') || eventType.includes('reminder')) return 'booking_update';
  if (eventType.includes('rating') || eventType.includes('dispute') || eventType.includes('quality')) return 'system';
  return 'system';
}

async function _log(data) {
  await base44.entities.NotificationLog.create({ ...data, sent_at: new Date().toISOString() });
}