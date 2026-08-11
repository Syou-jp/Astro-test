export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  ALLOWED_ORIGIN: string;
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
}

const LIFF_URL = 'https://liff.line.me/2011054732-exitzB6m';
const types = [
  ['listings', '入居募集'],
  ['used-market', '中古市場'],
  ['jobs', '求人'],
  ['events', 'イベント'],
  ['help', '助け合い'],
] as const;

const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
  },
});

async function verifySignature(request: Request, body: string, secret: string) {
  const signature = request.headers.get('x-line-signature');
  console.log(JSON.stringify({ webhook: 'received', hasSignature: Boolean(signature), bodyLength: body.length, hasSecret: Boolean(secret) }));
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  let encoded = '';
  for (const byte of digest) encoded += String.fromCharCode(byte);
  const expected = btoa(encoded);
  console.log(JSON.stringify({ signatureLength: signature.length, expectedLength: expected.length }));
  return signature === expected;
}

async function replyLine(replyToken: string, messages: unknown[], token: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ replyToken, messages }),
  });
  const errorBody = response.ok ? '' : await response.text();
  console.log(JSON.stringify({ replyApiStatus: response.status, replyApiOk: response.ok, replyApiError: errorBody.slice(0, 300) }));
  return response;
}

async function pushLine(userId: string, messages: unknown[], token: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ to: userId, messages }),
  });
  const errorBody = response.ok ? '' : await response.text();
  console.log(JSON.stringify({ pushApiStatus: response.status, pushApiOk: response.ok, pushApiError: errorBody.slice(0, 300) }));
  return response;
}

async function checkBotToken(token: string) {
  console.log(JSON.stringify({ accessTokenPresent: Boolean(token), accessTokenLength: token?.length || 0 }));
  const response = await fetch('https://api.line.me/v2/bot/info', { headers: { authorization: `Bearer ${token}` } });
  console.log(JSON.stringify({ botInfoStatus: response.status, botInfoOk: response.ok }));
}

function typeMessage() {
  return {
    type: 'text',
    text: '投稿する種類を選んでください。',
    quickReply: { items: types.map(([value, label]) => ({ type: 'action', action: { type: 'postback', label, data: `投稿種類=${value}`, displayText: label } })) },
  };
}

function liffMessage(value: string) {
  const label = types.find(([key]) => key === value)?.[1] || '投稿フォーム';
  return { type: 'text', text: `${label}の投稿フォームを開きます。`, sender: { name: 'Sotocom' }, quickReply: { items: [{ type: 'action', action: { type: 'uri', label: 'フォームを開く', uri: `${LIFF_URL}?type=${encodeURIComponent(value)}` } }] } };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin') || '';
    const allowedOrigin = origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'access-control-allow-origin': allowedOrigin,
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'POST, OPTIONS',
    }});

    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/webhook') {
      const raw = await request.text();
      if (!(await verifySignature(request, raw, env.LINE_CHANNEL_SECRET))) return new Response('Bad signature', { status: 401 });
      const eventBody = JSON.parse(raw) as { events?: Array<Record<string, any>> };
      await checkBotToken(env.LINE_CHANNEL_ACCESS_TOKEN);
      for (const event of eventBody.events || []) {
        console.log(JSON.stringify({ eventType: event.type, messageType: event.message?.type, text: event.message?.type === 'text' ? event.message.text : undefined }));
        if (event.type !== 'message' && event.type !== 'postback') continue;
        const replyToken = event.replyToken;
        if (!replyToken) continue;
        if (event.type === 'postback') {
          const value = String(event.postback?.data || '').replace('投稿種類=', '');
          const messages = types.some(([key]) => key === value) ? [liffMessage(value)] : [typeMessage()];
          const response = await replyLine(replyToken, messages, env.LINE_CHANNEL_ACCESS_TOKEN);
          if (!response.ok && event.source?.userId) await pushLine(event.source.userId, messages, env.LINE_CHANNEL_ACCESS_TOKEN);
        } else if (event.message?.type === 'text' && /^(投稿|我要投稿|投稿する)$/.test(event.message.text.trim())) {
          const messages = [typeMessage()];
          const response = await replyLine(replyToken, messages, env.LINE_CHANNEL_ACCESS_TOKEN);
          if (!response.ok && event.source?.userId) await pushLine(event.source.userId, messages, env.LINE_CHANNEL_ACCESS_TOKEN);
        }
      }
      return new Response('OK');
    }
    if (request.method !== 'POST' || url.pathname !== '/api/submissions') {
      return json({ ok: true, service: 'sotocom-api' }, 200, allowedOrigin);
    }
    try {
      const formData = await request.formData();
      const body = JSON.parse(String(formData.get('submission') || '{}')) as Record<string, any>;
      const type = typeof body.type === 'string' ? body.type : '';
      const payload = body.payload && typeof body.payload === 'object' ? body.payload : null;
      const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
      if (!['listings', 'used-market', 'jobs', 'events', 'help'].includes(type) || !payload || !displayName) {
        return json({ ok: false, error: 'invalid_submission' }, 400, allowedOrigin);
      }
      const auth = request.headers.get('authorization') || '';
      const lineUserId = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const photoKeys: string[] = [];
      for (const entry of formData.getAll('photos')) {
        if (!(entry instanceof File) || !entry.size) continue;
        if (!entry.type.startsWith('image/') || entry.size > 8 * 1024 * 1024 || photoKeys.length >= 8) return json({ ok: false, error: 'invalid_photo' }, 400, allowedOrigin);
        const key = `submissions/${crypto.randomUUID()}-${entry.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        await env.PHOTOS.put(key, entry.stream(), { httpMetadata: { contentType: entry.type } });
        photoKeys.push(key);
      }
      const storedPayload = { ...payload, photoKeys };
      await env.DB.prepare(`INSERT INTO submissions (type, payload, line_user_id, display_name) VALUES (?, ?, ?, ?)`)
        .bind(type, JSON.stringify(storedPayload), lineUserId, displayName).run();
      return json({ ok: true, status: 'pending' }, 201, allowedOrigin);
    } catch {
      return json({ ok: false, error: 'invalid_request' }, 400, allowedOrigin);
    }
  },
};
