# Content guide

Everything you'll update lives in `src/content/`. Each item is **one folder** containing an `index.md` file and its images.

```
src/content/
├── projects/          case studies (Template A)
│   ├── _template/     copy this to start a new one
│   └── cyber-explorers/
├── galleries/         logo collection and graphic pieces (Templates B and C)
│   ├── logos/
│   └── graphic-pieces/
└── photography/       one folder per photo series
    └── series-one/
```

## Where each thing on the site comes from

| On the site | Edit |
|---|---|
| Availability line, reply time, email, socials, booking link, location | `src/data/site.ts` |
| Home: highlights numbers, "How I work", "Hello" intro | `src/data/pages.ts` → `home` |
| Work and Photography intro lines | `src/data/pages.ts` → `work`, `photography` |
| About: hook, story, principles, experience, recognition, certifications, "Away from the screen", CV link | `src/data/pages.ts` → `about` |
| Contact headline and topic chips | `src/data/pages.ts` → `contact` |
| Photos on Home and About (portrait, off-screen) | replace the files in `src/assets/home/` and `src/assets/about/` (keep the names) |
| Case studies, logos, graphic pieces, photo series | folders in `src/content/` (below) |

Pages build themselves from these: a new project folder appears on Work, gets its own page and "Next project" link, and shows on Home when `featured: true`. Sections you leave out (a quote, a showcase image…) simply don't appear.

**CV:** put the PDF in the `public/` folder (e.g. `public/juan-posada-cv.pdf`) and set `cv: { file: '/juan-posada-cv.pdf', size: '180 KB' }` in `pages.ts`.

## Add a case study

1. Copy `projects/_template` and rename the copy, lowercase with dashes (e.g. `museum-app`). That name becomes the web address: `juanposada.co.uk/work/museum-app`.
2. Replace the images in the folder with yours.
3. Open `index.md` and fill in every field. The comments next to each field explain it.
4. Keep `draft: true` while you're writing; switch it to `false` to publish.

## Add a logo, graphic piece or photo

Drop the image in the right folder and add one block under `items:` (galleries) or `photos:` (photography), copying the block above it.

## Image shapes

| Image | Shape on the site |
|---|---|
| Project cover | 16:11 on cards, 16:10 at the top of the case study: keep the subject centred |
| Key screens, showcase, problem image, details | Their own shape (never cropped) |
| Logos | Square (about 1200 × 1200), logo on its own background colour; fills the tile |
| Graphic pieces | 4:5 tiles; the viewer shows the full piece |
| Photos | 3:2 tiles, one featured large; the viewer shows the full photo |
| Portraits | 4:5 |
| Home animation, final screen (`src/assets/home/sketch-final.jpg`) | 1440 × 911 screenshot |

Send images as large as you have; they're automatically resized and compressed for each screen.

## Rules of thumb

- **Images:** JPG for photos and screens, PNG for logos. Around 2000px on the long side is plenty; the site resizes and compresses them automatically.
- **Alt text:** a short description of what the image shows, for screen readers and search engines. Required.
- **Private / NDA work:** set `private: true`. Only a locked card appears, with an "Ask for access" link.
- **Order:** lower `order` numbers appear first. `featured: true` puts a project on the Home page (max 4).
- **Spacing matters in these files.** Keep the indentation exactly as in the template (two spaces).

## If something's wrong

The site checks every file when it builds. If a field is missing or misspelt, the build stops and the error names the file and field, e.g. `projects → museum-app → snapshot.role: Required`. Fix it and push again; the live site stays on the last good version in the meantime.

If a deploy gets stuck or skipped in Cloudflare, merging any small change (or pressing Retry build on the latest build) starts a fresh one.
