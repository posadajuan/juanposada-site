# juanposada.co.uk

Portfolio site of Juan Posada. Built with [Astro](https://astro.build), hosted on Cloudflare Pages.

## Everyday edits

| To change… | Edit this file |
|---|---|
| Availability line, reply time, email, socials, booking link | `src/data/site.ts` |
| Colours, type sizes, spacing, motion timings | `src/styles/tokens.css` |

Every push to `main` publishes the site automatically. Every other branch gets its own preview link.

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
