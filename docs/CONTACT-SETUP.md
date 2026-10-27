# Contact form: one-time setup in Cloudflare

The form's code is done. It needs three things switched on in your Cloudflare account. About 15 minutes, all free.

## 1. Email Routing (gives you hello@juanposada.co.uk and lets the form email you)

Cloudflare moved Email Routing in 2026. It now lives under **Compute → Email Service**.

1. Cloudflare dashboard → **Compute** → **Email Service** → **Email Routing** → pick **juanposada.co.uk** → **Enable**.
   Accept the DNS records it offers to add (MX and SPF). They don't affect the website.
2. **Destination addresses** → add the inbox where you want to receive messages → open the confirmation email Cloudflare sends there and click **Verify**.
3. **Routing Rules** → **Create routing rule** → Email pattern `hello` → action **Send to an email** → your verified inbox → **Save**.
   This is the address the "Copy email" button gives out.

## 2. Turnstile (the invisible "are you human?" check)

1. Cloudflare dashboard → **Turnstile** → **Add widget** → choose **Add widget manually** (not "Set up with Spin").
2. Name: `Portfolio contact form`.
3. Hostnames: `juanposada.co.uk` and `juanposada-site.posadajuan.workers.dev`.
   If the contact page shows no check and the browser console says **Error 110200**, the address you're on is missing from this list. Add it under the widget's **Settings → Hostnames**; no rebuild needed.
4. Widget mode: **Managed**. Leave the rest as it is → **Create**.
5. Keep the page open: you need the **Site key** and the **Secret key** below.

## 3. Give the keys to the site

Cloudflare → **Workers & Pages** → **juanposada-site** → **Settings**:

| Where | Type | Name | Value |
|---|---|---|---|
| **Variables and Secrets** | Secret | `TURNSTILE_SECRET` | the Turnstile **Secret key** |
| **Variables and Secrets** | Secret | `CONTACT_TO` | your verified inbox address |
| **Build** section → **Variables and secrets** (scroll down past Git repository and Build configuration) | Variable | `PUBLIC_TURNSTILE_SITE_KEY` | the Turnstile **Site key** |

The first two go under **Settings → Variables and Secrets → Add**; pick type **Secret** so the value is hidden. The site key is not secret: it's public in the page, so a plain variable is fine.

Then **Deployments → latest → Retry build** (or merge any change) so the build picks up the site key.

To check the key landed: open `/contact`, view the page source and search for `data-sitekey`. It should start with `0x4…`, not the test key `1x00000000000000000000AA`.

## Check it works

Open `/contact` on the live site, send yourself a test message, and reply to it: the reply should go to the address you typed in the form.

## How it's protected

- Only accepts posts from your own site's pages.
- Hidden spam-trap field, Turnstile human check, and a limit of 5 messages a minute per visitor.
- Your inbox address is a secret in Cloudflare; it never appears in the code or the page.
- Messages arrive from `website@juanposada.co.uk` with **Reply-To** set to the visitor, so you just hit reply.
