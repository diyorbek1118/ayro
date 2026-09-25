const LIMITS = { name: 80, contact: 60, service: 80, message: 2000, source: 20 };
const RECENT = new Map();

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const clean = (value, max) => String(value ?? '').replace(/\s+\n/g, '\n').trim().slice(0, max);

const tooMany = ip => {
  const now = Date.now();
  const hits = (RECENT.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  hits.push(now);
  RECENT.set(ip, hits);
  if (RECENT.size > 5000) RECENT.clear();
  return hits.length > 3;
};

const contactButton = contact => {
  const username = contact.match(/^@?([A-Za-z][A-Za-z0-9_]{4,31})$/);
  if (username) return { text: '✉️ Telegram’da yozish', url: `https://t.me/${username[1]}` };
  const digits = contact.replace(/\D/g, '');
  if (digits.length >= 9) {
    const phone = digits.length === 9 ? `998${digits}` : digits;
    return { text: '📲 Telegram’da ochish', url: `https://t.me/+${phone}` };
  }
  return null;
};

const buildMessage = lead => {
  const when = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date());
  const lines = [
    '🟢 <b>Yangi ariza · AYRO sayti</b>',
    '',
    `👤 <b>Ism:</b> ${escapeHtml(lead.name)}`,
    `📞 <b>Aloqa:</b> ${escapeHtml(lead.contact)}`,
    `🧩 <b>Xizmat:</b> ${escapeHtml(lead.service || 'Ko‘rsatilmagan')}`,
    '',
    '📝 <b>Loyiha haqida:</b>',
    `<blockquote>${escapeHtml(lead.message)}</blockquote>`,
    '',
    `🕒 ${when} · Toshkent`,
  ];
  if (lead.source) lines.push(`📍 Manba: ${escapeHtml(lead.source)}`);
  return lines.join('\n');
};

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'origin' }, 403);
    } catch (e) {
      return json({ ok: false, error: 'origin' }, 403);
    }
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatIds = String(env.TELEGRAM_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!token || !chatIds.length) return json({ ok: false, error: 'not_configured' }, 503);

  const raw = await request.text();
  if (raw.length > 8000) return json({ ok: false, error: 'too_large' }, 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  if (body.honey || Number(body.elapsed) < 2500) return json({ ok: true });

  const lead = {
    name: clean(body.name, LIMITS.name),
    contact: clean(body.contact, LIMITS.contact),
    service: clean(body.service, LIMITS.service),
    message: clean(body.message, LIMITS.message),
    source: clean(body.source, LIMITS.source).replace(/[^a-z0-9_-]/gi, ''),
  };
  const digits = lead.contact.replace(/\D/g, '');
  const validContact = (digits.length >= 9 && digits.length <= 15) || /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(lead.contact);
  if (lead.name.length < 2 || !validContact || lead.message.length < 10) return json({ ok: false, error: 'invalid' }, 422);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (tooMany(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  const text = buildMessage(lead);
  const button = contactButton(lead.contact);
  const payload = { parse_mode: 'HTML', text, disable_web_page_preview: true };
  if (button) payload.reply_markup = { inline_keyboard: [[button]] };

  const results = await Promise.all(chatIds.map(chatId => fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, chat_id: chatId }),
  }).then(r => r.ok).catch(() => false)));

  if (!results.some(Boolean)) return json({ ok: false, error: 'telegram' }, 502);
  return json({ ok: true });
}

export function onRequest() {
  return json({ ok: false, error: 'method' }, 405);
}
