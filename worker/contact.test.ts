import { describe, it, expect, vi } from 'vitest';
import { buildEmail, checkTurnstile, isSameOrigin, oneLine, readSubmission, validate, verifyTurnstile, type Submission } from './contact';

const form = (fields: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) (Array.isArray(v) ? v : [v]).forEach((x) => f.append(k, x));
  return f;
};

const good: Submission = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello!\nCan we talk about an app?',
  topics: ['Product'],
  token: 'tok',
  trap: '',
};

const decodeBody = (raw: string) => {
  const b64 = raw.split('\r\n\r\n')[1]!.replace(/\r\n/g, '');
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
};

describe('reading the form', () => {
  it('keeps only known topics and trims fields', () => {
    const s = readSubmission(form({ name: '  Ada ', email: ' ada@example.com', message: ' hi ', topics: ['Product', 'Hack'] }));
    expect(s).toMatchObject({ name: 'Ada', email: 'ada@example.com', message: 'hi', topics: ['Product'] });
  });

  it('strips line breaks from single-line fields (no header injection)', () => {
    expect(oneLine('Ada\r\nBcc: victim@example.com')).toBe('Ada Bcc: victim@example.com');
    const s = readSubmission(form({ name: 'Ada\nBcc: x@y.com', email: 'a@b.com\r\nBcc: x@y.com', message: 'm' }));
    expect(s.name).not.toMatch(/[\r\n]/);
    expect(validate(s).map((e) => e.field)).toContain('email');
  });
});

describe('validation', () => {
  it('accepts a normal message', () => expect(validate(good)).toEqual([]));

  it('flags each missing field', () => {
    const fields = validate({ ...good, name: '', email: 'nope', message: '' }).map((e) => e.field);
    expect(fields).toEqual(['name', 'email', 'message']);
  });

  it('rejects very long messages', () => {
    expect(validate({ ...good, message: 'x'.repeat(5001) }).map((e) => e.field)).toEqual(['message']);
  });
});

describe('same-site check', () => {
  const req = (origin?: string) =>
    new Request('https://juanposada.co.uk/api/contact', { method: 'POST', headers: origin ? { Origin: origin } : {} });

  it('accepts the site itself', () => expect(isSameOrigin(req('https://juanposada.co.uk'))).toBe(true));
  it('rejects other sites', () => expect(isSameOrigin(req('https://evil.example'))).toBe(false));
  it('rejects requests with no origin', () => expect(isSameOrigin(req())).toBe(false));
});

describe('Turnstile', () => {
  it('passes when Cloudflare says success', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    expect(await verifyTurnstile('tok', 'secret', '1.2.3.4', fetcher)).toBe(true);
  });

  it('fails without a token, on failure, or if Cloudflare is unreachable', async () => {
    expect(await verifyTurnstile('', 'secret', null)).toBe(false);
    const no = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false })));
    expect(await verifyTurnstile('tok', 'secret', null, no)).toBe(false);
    const down = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await verifyTurnstile('tok', 'secret', null, down)).toBe(false);
  });

  it("passes on Cloudflare's reason when the check fails", async () => {
    expect(await checkTurnstile('', 'secret', null)).toEqual({ success: false, codes: ['missing-input-response'] });
    const bad = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-secret'] })));
    expect(await checkTurnstile('tok', 'secret', null, bad)).toEqual({ success: false, codes: ['invalid-input-secret'] });
  });
});

describe('the email', () => {
  const opts = { from: 'website@juanposada.co.uk', to: 'inbox@example.com', site: 'https://juanposada.co.uk', id: 'test', now: new Date(0) };

  it('replies go straight to the visitor', () => {
    const { raw } = buildEmail(good, opts);
    expect(raw).toMatch(/^Reply-To: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?= <ada@example\.com>\r$/m);
    expect(raw).toContain('From: =?UTF-8?B?');
    expect(raw).toContain('<website@juanposada.co.uk>');
    expect(raw).toContain('To: <inbox@example.com>');
  });

  it('contains the whole message, including accents and emoji', () => {
    const { raw } = buildEmail({ ...good, name: 'José Núñez', message: 'Hola 👋 ¿hablamos?' }, opts);
    const body = decodeBody(raw);
    expect(body).toContain('Name: José Núñez');
    expect(body).toContain('Hola 👋 ¿hablamos?');
    expect(body).toContain('Topics: Product');
  });

  it('has no line longer than email allows', () => {
    const { raw } = buildEmail({ ...good, message: 'x'.repeat(4000) }, opts);
    expect(Math.max(...raw.split('\r\n').map((l) => l.length))).toBeLessThanOrEqual(998);
  });
});
