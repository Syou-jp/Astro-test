export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

const json = (body: unknown, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
  },
});

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
    if (request.method !== 'POST' || url.pathname !== '/api/submissions') {
      return json({ ok: true, service: 'sotocom-api' }, 200, allowedOrigin);
    }
    try {
      const body = await request.json() as Record<string, unknown>;
      const type = typeof body.type === 'string' ? body.type : '';
      const payload = body.payload && typeof body.payload === 'object' ? body.payload : null;
      const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
      if (!['listings', 'used-market', 'jobs', 'events', 'help'].includes(type) || !payload || !displayName) {
        return json({ ok: false, error: 'invalid_submission' }, 400, allowedOrigin);
      }
      const auth = request.headers.get('authorization') || '';
      const lineUserId = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      await env.DB.prepare(`INSERT INTO submissions (type, payload, line_user_id, display_name) VALUES (?, ?, ?, ?)`)
        .bind(type, JSON.stringify(payload), lineUserId, displayName).run();
      return json({ ok: true, status: 'pending' }, 201, allowedOrigin);
    } catch {
      return json({ ok: false, error: 'invalid_request' }, 400, allowedOrigin);
    }
  },
};
