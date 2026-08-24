const MAX_LENGTH = { name: 100, phone: 40, email: 254, message: 5000, store: 140, business: 100, city: 100 };
const requestLog = new Map();

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
  const merchant = data.type === 'merchant';
  const title = merchant ? 'طلب تسجيل متجر جديد' : 'رسالة جديدة من موقع مر';
  const label = merchant ? 'MOR MERCHANT REQUEST' : 'MOR SUPPORT';
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f3f6fb;font-family:Arial,Tahoma,sans-serif;color:#0b1533"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #dfe5ef"><tr><td style="padding:28px 30px;background:#061633;color:#fff"><div style="font-size:12px;letter-spacing:2px;color:#58cfff;direction:ltr;text-align:right">${label}</div><h1 style="font-size:26px;line-height:1.4;margin:10px 0 0">${title}</h1></td></tr><tr><td style="padding:26px 30px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${row('الاسم', data.name)}${row('رقم الجوال', data.phone)}${row('البريد', data.email)}${row('اسم المتجر', data.store)}${row('نوع النشاط', data.business)}${row('المدينة', data.city)}${row('الرسالة', data.message)}</table></td></tr><tr><td style="padding:18px 30px;background:#f7f9fd;color:#71809b;font-size:12px;border-top:1px solid #e5eaf2">أُرسلت من morapp.tech · ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}</td></tr></table></td></tr></table></body></html>`;
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
  const data = {
    type: body.type === 'merchant' ? 'merchant' : 'contact',
    name: clean(body.name, 'name'), phone: clean(body.phone, 'phone'), email: clean(body.email, 'email'),
    message: clean(body.message, 'message'), store: clean(body.store, 'store'), business: clean(body.business, 'business'), city: clean(body.city, 'city'),
  };
  if (!data.name || !data.phone || !data.email || (data.type === 'contact' && !data.message) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: 'invalid_form' });
  }
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'email_not_configured' });

  const recipient = data.type === 'merchant' ? (process.env.MERCHANT_TO_EMAIL || 'support@morapp.tech') : (process.env.CONTACT_TO_EMAIL || 'support@morapp.tech');
  const subject = data.type === 'merchant' ? `طلب متجر جديد — ${data.store || data.name}` : `رسالة موقع مر — ${data.name}`;
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
