# Search, sharing and AI search

What the site does on its own, and the few things to switch on in your accounts.

## Already built in

| What | Where | Why |
|---|---|---|
| Page titles and descriptions | Each page; case studies use their outcome line | What Google shows under your link |
| Link previews (Open Graph) | `public/og-default.png` for most pages; case studies, About, Photography and Graphic design use their own image, cropped to 1200×630 automatically | How your link looks on LinkedIn, WhatsApp, Slack, iMessage |
| Structured data (schema.org) | Every page: you as a Person (role, skills, certifications, profiles) and the website. Case studies: CreativeWork + breadcrumbs | Helps Google and AI assistants understand who you are and what each project is |
| `/sitemap.xml` | Built from your content | Lists every public page for search engines |
| `/robots.txt` | Open to all search engines and AI assistants | Lets them read and link to you |
| `/llms.txt` | Built from your content | A plain-text summary for AI assistants (see below) |

New case studies and galleries are added to all of these automatically.

**Changing the headline?** Update `scripts/og-default.html` too, then run `node scripts/make-og.mjs` to redraw the preview image.

## SEO for AI: GEO / AEO

Being found and quoted by ChatGPT, Claude, Perplexity, Gemini and Google's AI answers is usually called **GEO (Generative Engine Optimization)**, sometimes **AEO (Answer Engine Optimization)** or **LLMO**. It builds on normal SEO. What helps most:

1. **AI crawlers can get in.** `robots.txt` allows them, and Cloudflare must not block them (step 3 below).
2. **Facts in plain, consistent words.** The About page, structured data and `llms.txt` all say the same things: who you are, where, what you do, for whom, with real numbers.
3. **`llms.txt`.** A short proposed standard (llmstxt.org): a Markdown summary with links. Not every AI tool reads it yet, but it costs nothing.
4. **Being mentioned elsewhere.** LinkedIn, Behance and Instagram link back here (listed in `sameAs`). Keep the same headline and description across them.

## Your steps after the domain goes live

1. **Google Search Console** (search.google.com/search-console) → Add property → Domain → `juanposada.co.uk`. Choose Cloudflare when it asks to verify, and it adds the DNS record for you. Then Sitemaps → submit `sitemap.xml`.
2. **Bing Webmaster Tools** (bing.com/webmasters) → Import from Google Search Console. Bing also feeds ChatGPT search and Copilot.
3. **Cloudflare AI crawler settings.** Cloudflare → juanposada.co.uk → Security → Settings → bot / AI crawler settings. If you want to appear in AI answers:
   - Search crawlers: **Allow**
   - Agent crawlers (AI assistants reading a page live for a user): **Allow**
   - Training crawlers: your choice. Blocking them can also block Googlebot and Bingbot, which crawl for both. Leave on Allow unless you're sure.
   - Leave "Managed robots.txt" off, so the site's own robots.txt is used.
4. **Cloudflare Web Analytics** (free, no cookie banner needed): Cloudflare → Analytics & Logs → Web Analytics → Add a site → juanposada.co.uk → automatic setup.
5. **Check link previews:** paste a page link into LinkedIn's Post Inspector (linkedin.com/post-inspector) to see the preview and refresh LinkedIn's copy.

## Ranking for your name

Google already knows other people called Juan Posada, so it needs clear signals that this site is the designer's:

1. **Search Console** (most important): add `juanposada.co.uk` as a Domain property, verify through Cloudflare, submit `sitemap.xml`, then use URL inspection → Request indexing on `/` and `/about/`.
2. **Cloudflare → Caching → Configuration → Crawler Hints: On.** It tells Bing and other IndexNow search engines automatically whenever the site changes.
3. **Same name and line everywhere**: "Juan Posada, Product Designer in London" as the headline on LinkedIn, Behance and Instagram, each linking to juanposada.co.uk.
4. **Links from trusted sites**: project credits, employer or partner pages, course alumni listings, awards.

The site already describes you for search engines (Person data with job title, a "which Juan Posada" description, profiles and credentials; one CreativeWork per case study). The job title lives in `src/data/site.ts` → `role`.
