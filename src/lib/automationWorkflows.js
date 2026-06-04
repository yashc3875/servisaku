// ServisAku Automation Workflows — reminder engine, escalation logic
import { servisaku } from '@/api/servisakuClient';
import {
  notifyReminder24h, notifyReviewReminder, dispatch,
} from './notificationEngine';
import moment from 'moment';

// ─── Run all pending automation workflows ────────────────────────────────
// Call this from a periodic trigger or admin "Run Workflows" button
export async function runAllWorkflows() {
  const results = {};
  results.reminders = await runReminderWorkflow();
  results.reviewReminders = await runReviewReminderWorkflow();
  results.lateEscalations = await runLateEscalationWorkflow();
  results.inactivePartners = await runInactivePartnerWorkflow();
  return results;
}

// ─── 24h + 2h Booking Reminders ──────────────────────────────────────────
export async function runReminderWorkflow() {
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
  const today = moment().format('YYYY-MM-DD');
  const now = moment();

  const bookings = await servisaku.entities.Booking.filter({ status: 'assigned' });
  let sent = 0;

  for (const b of bookings) {
    const bookingDt = moment(`${b.date} ${b.time_slot}`, 'YYYY-MM-DD h:mm A');
    const hoursUntil = bookingDt.diff(now, 'hours');
    const lang = 'en'; // Could lookup user preference

    // 24h reminder (between 23-25h before)
    if (hoursUntil >= 23 && hoursUntil <= 25) {
      const alreadySent = await _reminderSent(b.id, 'reminder_24h');
      if (!alreadySent) {
        await notifyReminder24h(b.consumer_email, b, lang);
        await _markReminderSent(b.id, 'reminder_24h');
        sent++;
      }
    }

    // 2h reminder (between 1.5-2.5h before)
    if (hoursUntil >= 1.5 && hoursUntil <= 2.5) {
      const alreadySent = await _reminderSent(b.id, 'reminder_2h');
      if (!alreadySent) {
        await dispatch('reminder_2h', b.consumer_email, {
          service_type: b.service_type, time_slot: b.time_slot,
        }, { channels: ['in_app'], lang, referenceId: b.id });
        await _markReminderSent(b.id, 'reminder_2h');
        sent++;
      }
    }
  }
  return { sent };
}

// ─── Review Reminders (1h after completion, if no review) ────────────────
export async function runReviewReminderWorkflow() {
  const cutoff = moment().subtract(1, 'hour').toISOString();
  const bookings = await servisaku.entities.Booking.filter({ status: 'completed' });
  let sent = 0;

  for (const b of bookings) {
    if (b.rating) continue; // Already reviewed
    const completedAt = b.partner_completed_at || b.updated_date;
    if (!completedAt) continue;
    const hoursSince = moment().diff(moment(completedAt), 'hours');
    if (hoursSince >= 1 && hoursSince <= 2) {
      const alreadySent = await _reminderSent(b.id, 'review_reminder');
      if (!alreadySent) {
        await notifyReviewReminder(b.consumer_email, b, 'en');
        await _markReminderSent(b.id, 'review_reminder');
        sent++;
      }
    }
  }
  return { sent };
}

// ─── Late Partner Escalation ──────────────────────────────────────────────
// If partner is 'assigned' and booking time is past by >30 min
export async function runLateEscalationWorkflow() {
  const bookings = await servisaku.entities.Booking.filter({ status: 'assigned' });
  let escalated = 0;

  for (const b of bookings) {
    const bookingDt = moment(`${b.date} ${b.time_slot}`, 'YYYY-MM-DD h:mm A');
    const minutesLate = moment().diff(bookingDt, 'minutes');
    if (minutesLate >= 30) {
      const alreadyEsc = await _reminderSent(b.id, 'late_escalation');
      if (!alreadyEsc) {
        // Notify consumer
        await dispatch('partner_en_route', b.consumer_email, {
          partner_name: b.partner_name || 'Your partner',
          eta: 'unknown — we are checking',
        }, { channels: ['in_app'], referenceId: b.id });
        // Create ops notification for admin
        const admins = await servisaku.entities.User.filter({ role: 'admin' });
        for (const admin of admins.slice(0, 3)) {
          await servisaku.entities.Notification.create({
            user_email: admin.email,
            title: '🚨 Late Partner Alert',
            body: `Booking ${b.id?.slice(-8)} is ${minutesLate}min late. Partner: ${b.partner_name}`,
            type: 'system', channel: 'in_app', is_read: false,
          });
        }
        await _markReminderSent(b.id, 'late_escalation');
        escalated++;
      }
    }
  }
  return { escalated };
}

// ─── Inactive Partner Reminder (no jobs in 14 days) ──────────────────────
export async function runInactivePartnerWorkflow() {
  const cutoff = moment().subtract(14, 'days').format('YYYY-MM-DD');
  const partners = await servisaku.entities.User.filter({ role: 'partner' });
  let sent = 0;

  for (const p of partners) {
    const recent = await servisaku.entities.Booking.filter({ partner_email: p.email });
    const hasRecent = recent.some(b => b.date >= cutoff);
    if (!hasRecent && recent.length > 0) {
      const alreadySent = await _reminderSent(`partner:${p.email}`, 'inactive_partner');
      if (!alreadySent) {
        await servisaku.entities.Notification.create({
          user_email: p.email,
          title: '👋 We miss you!',
          body: 'You haven\'t had any jobs recently. Make sure you\'re set to Online to receive new bookings.',
          type: 'reminder', channel: 'in_app', is_read: false,
        });
        await _markReminderSent(`partner:${p.email}`, 'inactive_partner');
        sent++;
      }
    }
  }
  return { sent };
}

// ─── Internal helpers (use NotificationLog to track what was sent) ────────
async function _reminderSent(refId, eventType) {
  const logs = await servisaku.entities.NotificationLog.filter({ reference_id: refId, event_type: eventType });
  return logs.length > 0;
}

async function _markReminderSent(refId, eventType) {
  await servisaku.entities.NotificationLog.create({
    user_email: 'system', event_type: eventType,
    channel: 'in_app', status: 'sent',
    reference_id: refId, reference_type: 'automation',
    sent_at: new Date().toISOString(),
  });
}