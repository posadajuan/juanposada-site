/**
 * Contact form logic, kept free of Cloudflare-only imports so it can be
 * unit tested in Node. index.ts wires it to the real email binding.
 */

export const LIMITS = { name: 120, email: 200, message: 5000, body: 20_000 } as const;
export const TOPICS = ['Product', 'Brand', 'Web', 'Other'] as const;

export type Submission = {
  name: string;
  email: string;
  message: string;
  topics: string[];
  token: string;
  trap: string;
};

export type FieldError = { field: 'name' | 'email' | 'message'; message: string };

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Removes control characters (incl. new lines) that could break email headers. */
export const oneLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();

export function readSubmission(form: FormData): Submission {
  const text = (key: string) => {
    const v = form.get(key);
    return typeof v === 'string' ? v : '';
  };
  return {
    name: oneLine(text('name')),
    email: oneLine(text('email')),
    message: text('message').replace(/\r\n?/g, '\n').trim(),
    topics: form
      .getAll('topics')
      .filter((t): t is string => typeof t === 'string')
      .filter((t) => (TOPICS as readonly string[]).includes(t)),
    token: text('cf-turnstile-response'),
    trap: text('website'),
  };
}

export function validate(s: Submission): FieldError[] {
  const errors: FieldError[] = [];
  if (!s.name || s.name.length > LIMITS.name) errors.push({ field: 'name', message: 'Please add your name.' });
  if (!EMAIL_RE.test(s.email) || s.email.length > LIMITS.email)
    errors.push({ field: 'email', message: 'Please add a valid email so I can reply.' });
  if (!s.message || s.message.length > LIMITS.message)
    errors.push({ field: 'message', message: 'Please add a short message.' });
  return errors;
}

/** Only accept posts made from this site's own pages. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/* ---------- Email ---------- */

const utf8ToBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/** RFC 2047 encoded word, so names and subjects can contain any character. */
const encodeHeader = (text: string) => `=?UTF-8?B?${utf8ToBase64(text)}?=`;

const wrap76 = (b64: string) => b64.replace(/.{1,76}/g, (line) => `${line}\r\n`);

export function buildEmail(
  s: Submission,
  opts: { from: string; to: string; site: string; now?: Date; id?: string },
): { subject: string; raw: string } {
  const subject = `New enquiry from ${s.name}`;
  const text = [
    'New message from your website contact form.',
    '',
    `Name: ${s.name}`,
    `Email: ${s.email}`,
    `Topics: ${s.topics.length ? s.topics.join(', ') : '-'}`,
    '',
    'Message:',
    s.message,
    '',
    '--',
    `Sent from ${opts.site}/contact. Reply to this email to answer them directly.`,
  ].join('\n');

  const domain = opts.from.split('@')[1] ?? 'localhost';
  const headers = [
    `From: ${encodeHeader('Juan Posada website')} <${opts.from}>`,
    `To: <${opts.to}>`,
    `Reply-To: ${encodeHeader(s.name)} <${s.email}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${(opts.now ?? new Date()).toUTCString()}`,
    `Message-ID: <${opts.id ?? crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
  ];

  return { subject, raw: `${headers.join('\r\n')}\r\n\r\n${wrap76(utf8ToBase64(text))}` };
}

/* ---------- Responses ---------- */

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
