# strangelab.ai placeholder site

This project builds a small static site from markdown files.

## Edit the page

Update `content/site.md` for the home page.

Add project pages in `content/projects/`.

## Build locally

```bash
npm install
npm run build
```

The generated site lands in `dist/`.

## Preview locally

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`.

## Deploy to Cloudflare Pages

### Git-based deploy

Create a GitHub or GitLab repository, push this folder, and create a Pages project in the Cloudflare dashboard.

Use these build settings:

- Build command: `npm run build`
- Build output directory: `dist`

### Direct upload

If you want a quick manual deploy from your machine, build the site and run:

```bash
npx wrangler pages deploy dist
```

### Custom domain

After the project is live on `*.pages.dev`, add your real domain in the Cloudflare Pages dashboard under **Custom domains**.

Cloudflare's docs note that you should add the domain inside the Pages project first. Manually creating a CNAME before that can leave the domain broken with a `522` error.
