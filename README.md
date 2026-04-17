# strangelab.ai

Small markdown-driven site for `strangelab.ai`.

## Files that matter

- `content/site.md` holds the page text.
- `public/styles.css` holds the styling.
- `scripts/build.mjs` turns the markdown into static files in `dist/`.

## Work on it locally

```bash
npm install
npm run build
npm run preview
```

Open `http://localhost:4173`.

## Publish

Push to `main`.

GitHub Actions rebuilds the site and deploys `dist/` to the existing Cloudflare Pages project automatically.
