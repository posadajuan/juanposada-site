/**
 * The site's Worker. Static pages are served straight from ./dist; only
 * /api/* requests reach this code (see run_worker_first in wrangler.jsonc).
 *
 * POST /api/contact
 *   1. same-site check, size limit, spam trap
 *   2. field validation
 *   3. rate limit (5 messages a minute per visitor)
 *   4. Turnstile human check
 *   5. email to Juan via Cloudflare Email Routing (Reply-To = visitor)
 */
import { EmailMessage } from 'cloudflare:email';
import {
  LIMITS,
  buildEmail,
  isSameOrigin,
  json,
  readSubmission,
  validate,
  checkTurnstile,
} from './contact';

interface Env {
  ASSETS: Fetcher;
  SEND_EMAIL?: SendEmail;
  CONTACT_LIMITER?: RateLimit;
  /** Secret: Turnstile secret key. */
  TURNSTILE_SECRET?: string;
  /** Secret: the inbox that receives messages (must be verified in Email Routing). */
  CONTACT_TO?: string;
  /** Sender address on the site's domain, e.g. website@juanposada.co.uk */
  CONTACT_FROM?: string;
  SITE_URL?: string;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });
  if (!isSameOrigin(request)) return json(403, { ok: false, error: 'origin' });

  const length = Number(request.headers.get('Content-Length') ?? '0');
  if (length > LIMITS.body) return json(413, { ok: false, error: 'too_large' });

  if (!env.SEND_EMAIL || !env.CONTACT_TO || !env.CONTACT_FROM || !env.TURNSTILE_SECRET) {
    const missing = (['SEND_EMAIL', 'CONTACT_TO', 'CONTACT_FROM', 'TURNSTILE_SECRET'] as const).filter((key) => !env[key]);
    // Names only, never values. Shows up in Cloudflare → Workers → juanposada-site → Logs.
    console.error(`Contact form is not configured. Missing: ${missing.join(', ')}`);
    return json(503, { ok: false, error: 'not_configured' });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  const submission = readSubmission(form);

  // Bots fill in the hidden field. Pretend it worked so they move on.
  if (submission.trap) return json(200, { ok: true });

  const errors = validate(submission);
  if (errors.length) return json(400, { ok: false, error: 'invalid', fields: errors });

  const ip = request.headers.get('CF-Connecting-IP');
  if (env.CONTACT_LIMITER) {
    const { success } = await env.CONTACT_LIMITER.limit({ key: ip ?? 'unknown' });
    if (!success) return json(429, { ok: false, error: 'rate_limited' });
  }

  const human = await checkTurnstile(submission.token, env.TURNSTILE_SECRET, ip);
  if (!human.success) {
    console.error(`Turnstile check failed: ${human.codes.join(', ') || 'no reason given'}`);
    return json(403, { ok: false, error: 'turnstile', codes: human.codes });
  }

  const { raw } = buildEmail(submission, {
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    site: env.SITE_URL ?? new URL(request.url).origin,
  });

  try {
    await env.SEND_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    // Spell out Cloudflare's reason, so it's readable in the Logs list without expanding the row.
    console.error(`Sending the contact email failed: ${err instanceof Error ? err.message : String(err)}`);
    return json(502, { ok: false, error: 'send_failed' });
  }

  return json(200, { ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    if (url.pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
