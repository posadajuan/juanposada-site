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

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`
