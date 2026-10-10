const MAX_LENGTH = { name: 100, phone: 40, email: 254, store: 140, business: 100, city: 100, country: 2 };
const requestLog = new Map();
const PHONE_COUNTRIES = {
  SA: { dial: '+966', digits: 9, name: 'السعودية' },
  KW: { dial: '+965', digits: 8, name: 'الكويت' },
  BH: { dial: '+973', digits: 8, name: 'البحرين' },
  QA: { dial: '+974', digits: 8, name: 'قطر' },
  AE: { dial: '+971', digits: 9, name: 'الإمارات' },
  OM: { dial: '+968', digits: 8, name: 'عُمان' },
};

function clean(value, field) {
  return String(value ?? '').trim().slice(0, MAX_LENGTH[field] || 500);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:12px 0;color:#71809b;font-size:13px;width:125px;vertical-align:top">${label}</td><td style="padding:12px 0;color:#0b1533;font-size:15px;font-weight:600;vertical-align:top;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
}

function template(data) {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f3f6fb;font-family:Arial,Tahoma,sans-serif;color:#0b1533"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #dfe5ef"><tr><td style="padding:28px 30px;background:#061633;color:#fff"><div style="font-size:12px;letter-spacing:2px;color:#58cfff;direction:ltr;text-align:right">MOR BUSINESS · MERCHANT ENQUIRY</div><h1 style="font-size:26px;line-height:1.4;margin:10px 0 0">طلب انضمام تاجر جديد</h1></td></tr><tr><td style="padding:26px 30px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${row('اسم المتجر', data.store)}${row('نوع النشاط', data.business)}${row('اسم المسؤول', data.name)}${row('الدولة', data.countryName)}${row('رقم الجوال', data.phone)}${row('البريد الإلكتروني', data.email)}${row('المدينة', data.city)}</table></td></tr><tr><td style="padding:18px 30px;background:#f7f9fd;color:#71809b;font-size:12px;border-top:1px solid #e5eaf2">طلب انضمام مر للأعمال من morapp.tech · ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}</td></tr></table></td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const origin = req.headers.origin;
  const allowedOrigins = new Set(['https://morapp.tech', 'https://www.morapp.tech', ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173'] : [])]);
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: 'invalid_origin' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter(time => now - time < 10 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ error: 'rate_limited' });
  requestLog.set(ip, [...recent, now]);

  const body = req.body || {};
  if (body.website) return res.status(200).json({ ok: true });
  const country = clean(body.country, 'country').toUpperCase();
  const phoneCountry = PHONE_COUNTRIES[country];
  const nationalPhone = clean(body.phone, 'phone').replace(/\D/g, '').replace(/^0+/, '');
  const data = {
    name: clean(body.name, 'name'),
    phone: phoneCountry ? `${phoneCountry.dial}${nationalPhone}` : '',
    countryName: phoneCountry?.name || '',
    email: clean(body.email, 'email').toLowerCase(),
    store: clean(body.store, 'store'), business: clean(body.business, 'business'), city: clean(body.city, 'city'),
  };
  if (!data.name || !data.store || !data.business || !data.city || !phoneCountry || nationalPhone.length !== phoneCountry.digits || !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(data.email)) {
    return res.status(400).json({ error: 'invalid_form' });
  }
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'email_not_configured' });

  const recipient = process.env.MERCHANT_TO_EMAIL || 'support@morapp.tech';
  const subject = `طلب انضمام تاجر — ${data.store}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'MOR Website <website@morapp.tech>',
      to: [recipient], reply_to: data.email, subject, html: template(data),
    }),
  });
  if (!response.ok) {
    console.error('Resend delivery failed', response.status, await response.text());
    return res.status(502).json({ error: 'delivery_failed' });
  }
  return res.status(200).json({ ok: true });
}
