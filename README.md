# juanposada.co.uk

Portfolio site of Juan Posada. Built with [Astro](https://astro.build), hosted on Cloudflare Pages.

## Everyday edits

| To change… | Edit this file |
|---|---|
| Projects, logos, graphic pieces, photos | `src/content/…` (see [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)) |
| Words on Home, About, Contact, Work and Photography | `src/data/pages.ts` |
| Availability line, reply time, email, socials, booking link | `src/data/site.ts` |
| Colours, type sizes, spacing, motion timings | `src/styles/tokens.css` |

## How changes go live

1. Every change is made on its own **branch**, never straight on `main`.
2. Opening a **pull request** runs the automatic checks (build, accessibility in both modes, key behaviour on desktop and mobile) and Cloudflare builds a **preview link** for that branch.
3. When the checks are green and the preview looks right, the pull request is **merged into `main`**, which publishes the live site.
4. To undo a release: Cloudflare → juanposada-site → Deployments → pick an older one → Rollback.

## Safety

- Security headers (HSTS, CSP, no framing) live in `public/_headers`.
- Dependabot opens a monthly pull request with safe dependency updates; the checks run on it like any other change.
- No secrets in the code. Form keys live in Cloudflare's encrypted settings.

## Running it on a computer (optional)

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # production build into dist/
```

## Cloudflare settings (Workers & Pages → juanposada-site)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Build variable: `NODE_VERSION` = `22`
- Deployment settings live in `wrangler.jsonc` (serves the built `dist` folder).
