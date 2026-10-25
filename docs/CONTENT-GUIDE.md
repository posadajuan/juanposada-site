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

## Add a case study

1. Copy `projects/_template` and rename the copy, lowercase with dashes (e.g. `museum-app`). That name becomes the web address: `juanposada.co.uk/work/museum-app`.
2. Replace the images in the folder with yours.
3. Open `index.md` and fill in every field. The comments next to each field explain it.
4. Keep `draft: true` while you're writing; switch it to `false` to publish.

## Add a logo, graphic piece or photo

Drop the image in the right folder and add one block under `items:` (galleries) or `photos:` (photography), copying the block above it.

## Rules of thumb

- **Images:** JPG for photos and screens, PNG for logos. Around 2000px on the long side is plenty; the site resizes and compresses them automatically.
- **Alt text:** a short description of what the image shows, for screen readers and search engines. Required.
- **Private / NDA work:** set `private: true`. Only a locked card appears, with an "Ask for access" link.
- **Order:** lower `order` numbers appear first. `featured: true` puts a project on the Home page (max 4).
- **Spacing matters in these files.** Keep the indentation exactly as in the template (two spaces).

## If something's wrong

The site checks every file when it builds. If a field is missing or misspelt, the build stops and the error names the file and field, e.g. `projects → museum-app → snapshot.role: Required`. Fix it and push again; the live site stays on the last good version in the meantime.
