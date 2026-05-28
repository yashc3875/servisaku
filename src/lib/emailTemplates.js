// ServisAku Transactional Email Templates
const BRAND_GREEN = '#14532d';
const BRAND_LIGHT = '#f0fdf4';

export function buildEmailHtml(eventType, title, body, data = {}, lang = 'en') {
  const footer = lang === 'bm'
    ? `Terima kasih kerana menggunakan ServisAku. <a href="https://servisaku.my" style="color:${BRAND_GREEN}">servisaku.my</a>`
    : `Thank you for using ServisAku. <a href="https://servisaku.my" style="color:${BRAND_GREEN}">servisaku.my</a>`;

  const unsubscribe = lang === 'bm'
    ? 'Untuk berhenti melanggan emel ini, klik di sini.'
    : 'To unsubscribe from these emails, click here.';

  let contentBlock = '';

  // Booking receipt block
  if (data.service_type && data.date) {
    contentBlock = `
      <div style="background:${BRAND_LIGHT};border-radius:12px;padding:16px;margin:20px 0;">
        <table width="100%" style="font-size:14px;color:#374151;">
          ${data.service_type ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Perkhidmatan' : 'Service'}</td><td style="font-weight:600;">${data.service_type}</td></tr>` : ''}
          ${data.date ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Tarikh' : 'Date'}</td><td style="font-weight:600;">${data.date}</td></tr>` : ''}
          ${data.time_slot ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Masa' : 'Time'}</td><td style="font-weight:600;">${data.time_slot}</td></tr>` : ''}
          ${data.partner_name ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Rakan' : 'Partner'}</td><td style="font-weight:600;">${data.partner_name}</td></tr>` : ''}
          ${data.amount ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Jumlah' : 'Amount'}</td><td style="font-weight:600;color:${BRAND_GREEN};">RM${data.amount}</td></tr>` : ''}
          ${data.ref ? `<tr><td style="padding:4px 0;color:#6b7280;">${lang === 'bm' ? 'Rujukan' : 'Reference'}</td><td style="font-weight:600;">#${data.ref}</td></tr>` : ''}
        </table>
      </div>`;
  }

  const ctaLabel = (() => {
    if (eventType === 'booking_completed') return lang === 'bm' ? 'Tinggalkan Ulasan' : 'Leave a Review';
    if (eventType === 'booking_confirmed' || eventType === 'booking_assigned') return lang === 'bm' ? 'Lihat Tempahan' : 'View Booking';
    if (eventType === 'payment_success') return lang === 'bm' ? 'Lihat Invois' : 'View Invoice';
    return lang === 'bm' ? 'Buka Apl' : 'Open App';
  })();

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:${BRAND_GREEN};padding:28px 32px;text-align:left;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">ServisAku</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">${lang === 'bm' ? 'Perkhidmatan Rumah Dipercayai' : 'Trusted Home Services'}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 12px;font-size:20px;color:#111827;font-weight:700;">${title}</h2>
          <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">${body}</p>
          ${contentBlock}
          <a href="https://servisaku.my" style="display:inline-block;margin-top:8px;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">${ctaLabel}</a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">${footer}</p>
          <p style="margin:6px 0 0;color:#d1d5db;font-size:11px;">${unsubscribe}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}