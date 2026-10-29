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

/**
 * TEMPORARY diagnostic, switches itself off after SELFTEST_UNTIL.
 * POST /api/contact-selftest (same site only, rate limited) sends one fixed test
 * email to CONTACT_TO and returns Cloudflare's exact reason if sending fails.
 * It can only ever email Juan's own inbox. Remove once the form works.
 */
const SELFTEST_UNTIL = Date.parse('2026-11-05T00:00:00Z');

async function handleSelfTest(request: Request, env: Env): Promise<Response> {
  if (Date.now() > SELFTEST_UNTIL) return json(404, { ok: false, error: 'not_found' });
  if (request.method !== 'POST' || !isSameOrigin(request)) return json(403, { ok: false, error: 'origin' });
  if (env.CONTACT_LIMITER) {
    const { success } = await env.CONTACT_LIMITER.limit({ key: `selftest:${request.headers.get('CF-Connecting-IP') ?? 'unknown'}` });
    if (!success) return json(429, { ok: false, error: 'rate_limited' });
  }
  const checks = {
    SEND_EMAIL: !!env.SEND_EMAIL,
    CONTACT_TO: !!env.CONTACT_TO,
    CONTACT_FROM: env.CONTACT_FROM ?? null,
    TURNSTILE_SECRET: !!env.TURNSTILE_SECRET,
    // Only the shape of the inbox address, never the address itself.
    contactToLooksValid: !!env.CONTACT_TO && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.CONTACT_TO),
    contactToDomain: env.CONTACT_TO?.includes('@') ? env.CONTACT_TO.split('@').pop() : null,
    contactToLength: env.CONTACT_TO?.length ?? 0,
    contactToHasSpaces: !!env.CONTACT_TO && env.CONTACT_TO !== env.CONTACT_TO.trim(),
  };
  if (!env.SEND_EMAIL || !env.CONTACT_TO || !env.CONTACT_FROM) return json(503, { ok: false, step: 'config', checks });
  const { raw } = buildEmail(
    { name: 'Website self-test', email: env.CONTACT_FROM, message: 'Test email from the contact form self-test. If you got this, sending works.', topics: [], token: '', trap: '' },
    { from: env.CONTACT_FROM, to: env.CONTACT_TO, site: env.SITE_URL ?? new URL(request.url).origin },
  );
  try {
    await env.SEND_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
    return json(200, { ok: true, step: 'sent', checks });
  } catch (err) {
    // Mask addresses and keys so nothing private is ever returned.
    const reason = (err instanceof Error ? err.message : String(err))
      .replace(/[^\s(<]+@([^\s)>]+)/g, '***@$1')
      .replace(/0x[0-9A-Za-z_-]{6,}/g, '0x***');
    return json(502, { ok: false, step: 'send', reason, checks });
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    if (url.pathname === '/api/contact-selftest') return handleSelfTest(request, env);
    if (url.pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
