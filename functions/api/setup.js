const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!env.SETUP_KEY || !key || key !== env.SETUP_KEY) return new Response('Not found', { status: 404 });
  if (!env.TELEGRAM_BOT_TOKEN) return json({ ok: false, error: 'no_token' }, 503);

  const api = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
  const [me, updates] = await Promise.all([
    fetch(`${api}/getMe`).then(r => r.json()).catch(() => ({ ok: false })),
    fetch(`${api}/getUpdates?limit=100`).then(r => r.json()).catch(() => ({ ok: false })),
  ]);
  if (!me.ok) return json({ ok: false, error: 'bad_token', description: me.description || null }, 502);
  if (!updates.ok) return json({ ok: false, error: 'updates', description: updates.description || null }, 502);

  const chats = new Map();
  for (const update of updates.result || []) {
    const chat = (update.message || update.my_chat_member || update.edited_message || {}).chat;
    if (!chat) continue;
    chats.set(chat.id, {
      id: chat.id,
      type: chat.type,
      name: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' '),
      username: chat.username || null,
    });
  }
  return json({
    ok: true,
    bot: me.result.username,
    configured_chat: env.TELEGRAM_CHAT_ID || null,
    chats: [...chats.values()],
  });
}
