// FixMate / ServisAku — Notification Templates (EN + BM)

export const TEMPLATES = {
  // ── Booking ──────────────────────────────────────────────────────────────
  booking_confirmed: {
    en: {
      title: 'Booking Confirmed! 🎉',
      body: (d) => `Your ${d.service_type} is confirmed for ${d.date} at ${d.time_slot}. Ref: ${d.ref}`,
      email_subject: (d) => `Booking Confirmed — ${d.service_type} on ${d.date}`,
    },
    bm: {
      title: 'Tempahan Disahkan! 🎉',
      body: (d) => `${d.service_type} anda telah disahkan pada ${d.date} jam ${d.time_slot}. Ref: ${d.ref}`,
      email_subject: (d) => `Tempahan Disahkan — ${d.service_type} pada ${d.date}`,
    },
  },
  booking_assigned: {
    en: {
      title: 'Partner Assigned ✅',
      body: (d) => `${d.partner_name} will handle your ${d.service_type}. They'll contact you soon.`,
      email_subject: (d) => `Meet your partner — ${d.partner_name}`,
    },
    bm: {
      title: 'Rakan Ditugaskan ✅',
      body: (d) => `${d.partner_name} akan mengendalikan ${d.service_type} anda. Mereka akan menghubungi anda tidak lama lagi.`,
      email_subject: (d) => `Kenali rakan anda — ${d.partner_name}`,
    },
  },
  partner_en_route: {
    en: {
      title: '🚗 Partner is on the way!',
      body: (d) => `${d.partner_name} is heading to you. ETA: ~${d.eta || 15} minutes.`,
      sms: (d) => `ServisAku: ${d.partner_name} is on the way to your location. ETA ~${d.eta || 15} min. Track: ${d.track_url || 'in app'}`,
    },
    bm: {
      title: '🚗 Rakan sedang dalam perjalanan!',
      body: (d) => `${d.partner_name} sedang menuju ke tempat anda. Anggaran masa: ~${d.eta || 15} minit.`,
      sms: (d) => `ServisAku: ${d.partner_name} sedang dalam perjalanan. Anggaran ~${d.eta || 15} min.`,
    },
  },
  partner_arrived: {
    en: {
      title: '📍 Partner has arrived!',
      body: (d) => `${d.partner_name} is at your location and ready to begin.`,
      sms: (d) => `ServisAku: ${d.partner_name} has arrived at your location.`,
    },
    bm: {
      title: '📍 Rakan telah tiba!',
      body: (d) => `${d.partner_name} berada di lokasi anda dan bersedia untuk memulakan.`,
      sms: (d) => `ServisAku: ${d.partner_name} telah tiba di lokasi anda.`,
    },
  },
  booking_completed: {
    en: {
      title: 'Service Completed ✅',
      body: (d) => `${d.service_type} is done! How was ${d.partner_name}? Leave a review.`,
      email_subject: (d) => `How was your ${d.service_type}? Share your feedback`,
    },
    bm: {
      title: 'Perkhidmatan Selesai ✅',
      body: (d) => `${d.service_type} selesai! Bagaimana ${d.partner_name}? Tinggalkan ulasan.`,
      email_subject: (d) => `Bagaimana ${d.service_type} anda? Kongsi maklum balas`,
    },
  },
  // ── Payment ───────────────────────────────────────────────────────────────
  payment_success: {
    en: {
      title: 'Payment Successful 💳',
      body: (d) => `RM${d.amount} received for ${d.service_type}. Invoice #${d.ref}`,
      sms: (d) => `ServisAku: Payment of RM${d.amount} confirmed for ${d.service_type}. Ref: ${d.ref}`,
      email_subject: (d) => `Payment Receipt — RM${d.amount} for ${d.service_type}`,
    },
    bm: {
      title: 'Pembayaran Berjaya 💳',
      body: (d) => `RM${d.amount} diterima untuk ${d.service_type}. Invois #${d.ref}`,
      sms: (d) => `ServisAku: Pembayaran RM${d.amount} disahkan untuk ${d.service_type}. Ref: ${d.ref}`,
      email_subject: (d) => `Resit Pembayaran — RM${d.amount} untuk ${d.service_type}`,
    },
  },
  refund_processed: {
    en: {
      title: 'Refund Processed 💰',
      body: (d) => `RM${d.amount} refund is being processed. Expected: 3-5 business days.`,
      sms: (d) => `ServisAku: Your refund of RM${d.amount} is being processed. Allow 3-5 business days.`,
      email_subject: () => 'Your refund has been processed',
    },
    bm: {
      title: 'Bayaran Balik Diproses 💰',
      body: (d) => `Bayaran balik RM${d.amount} sedang diproses. Dijangka: 3-5 hari bekerja.`,
      sms: (d) => `ServisAku: Bayaran balik RM${d.amount} anda sedang diproses. 3-5 hari bekerja.`,
      email_subject: () => 'Bayaran balik anda telah diproses',
    },
  },
  payout_processed: {
    en: {
      title: 'Payout Sent! 🏦',
      body: (d) => `RM${d.amount} has been transferred to your ${d.bank || 'DuitNow'} account.`,
      email_subject: (d) => `Payout of RM${d.amount} processed`,
    },
    bm: {
      title: 'Bayaran Dihantar! 🏦',
      body: (d) => `RM${d.amount} telah dipindahkan ke akaun ${d.bank || 'DuitNow'} anda.`,
      email_subject: (d) => `Bayaran RM${d.amount} telah diproses`,
    },
  },
  // ── Quality ───────────────────────────────────────────────────────────────
  low_rating_alert: {
    en: {
      title: '⚠️ Quality Alert',
      body: (d) => `You received a ${d.rating}★ review. Our team will review and follow up.`,
    },
    bm: {
      title: '⚠️ Amaran Kualiti',
      body: (d) => `Anda menerima ulasan ${d.rating}★. Pasukan kami akan menyemak dan menghubungi anda.`,
    },
  },
  dispute_created: {
    en: {
      title: '🔴 Dispute Opened',
      body: (d) => `A dispute has been raised for booking ${d.ref}. Support will contact you within 2h.`,
    },
    bm: {
      title: '🔴 Pertikaian Dibuka',
      body: (d) => `Pertikaian telah dibuka untuk tempahan ${d.ref}. Sokongan akan menghubungi anda dalam 2j.`,
    },
  },
  // ── Reminders ─────────────────────────────────────────────────────────────
  reminder_24h: {
    en: {
      title: '⏰ Booking Tomorrow',
      body: (d) => `Reminder: ${d.service_type} tomorrow at ${d.time_slot}. Partner: ${d.partner_name || 'TBD'}`,
      sms: (d) => `ServisAku Reminder: ${d.service_type} tmr at ${d.time_slot}. ${d.partner_name ? `Partner: ${d.partner_name}` : ''}`,
    },
    bm: {
      title: '⏰ Tempahan Esok',
      body: (d) => `Peringatan: ${d.service_type} esok jam ${d.time_slot}. Rakan: ${d.partner_name || 'TBD'}`,
      sms: (d) => `ServisAku Peringatan: ${d.service_type} esok jam ${d.time_slot}.`,
    },
  },
  reminder_2h: {
    en: {
      title: '⏰ Service in 2 Hours',
      body: (d) => `Your ${d.service_type} starts in 2 hours at ${d.time_slot}. Be ready!`,
    },
    bm: {
      title: '⏰ Perkhidmatan dalam 2 Jam',
      body: (d) => `${d.service_type} anda bermula dalam 2 jam pada ${d.time_slot}. Bersedia!`,
    },
  },
  review_reminder: {
    en: {
      title: '⭐ How was your service?',
      body: (d) => `Rate your recent ${d.service_type} with ${d.partner_name}. Your feedback matters!`,
    },
    bm: {
      title: '⭐ Bagaimana perkhidmatan anda?',
      body: (d) => `Nilaikan ${d.service_type} anda bersama ${d.partner_name}. Maklum balas anda penting!`,
    },
  },
  // ── Welcome ───────────────────────────────────────────────────────────────
  welcome: {
    en: {
      title: 'Welcome to ServisAku! 🎉',
      body: () => 'Your home service platform is ready. Book your first service today!',
      email_subject: () => 'Welcome to ServisAku — Your Trusted Home Services',
    },
    bm: {
      title: 'Selamat Datang ke ServisAku! 🎉',
      body: () => 'Platform perkhidmatan rumah anda sedia. Buat tempahan pertama anda hari ini!',
      email_subject: () => 'Selamat Datang ke ServisAku — Perkhidmatan Rumah Dipercayai',
    },
  },
};

export function getTemplate(eventType, lang = 'en') {
  const tmpl = TEMPLATES[eventType];
  if (!tmpl) return null;
  return tmpl[lang] || tmpl['en'];
}

export function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60')) return `+${digits}`;
  if (digits.startsWith('0')) return `+60${digits.slice(1)}`;
  return `+60${digits}`;
}