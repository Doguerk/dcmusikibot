# Deploy Color Flow

## GitHub Pages

1. Put the `color-flow/` folder at your repo root.
2. Commit and push to `main`.
3. In GitHub repo Settings → Pages → Build from branch, select `main` and `/ (root)`.
4. Your site will be at `https://<user>.github.io/<repo>/color-flow/`.

If you serve from a subfolder, ensure links use relative paths like `./play/` which this project already does.

## Netlify

1. Create a new site from Git.
2. Set build command to `None` (no build) and publish directory to the repo root (so it includes `color-flow/`).
3. Or publish directory `color-flow` if you want the game as the site root.
4. Deploy. The site will be live on your Netlify URL. You can set a custom domain.

## Local static hosting

- `cd color-flow && python -m http.server 8000` → open `http://localhost:8000/color-flow/`.
- Or just open `index.html` directly in a modern browser (service worker may not register with file://).

## Offline/PWA notes

- The service worker pre-caches core pages and provides a minimal offline fallback HTML response for documents.
- `manifest.json` declares icons and colors.

## Replacing placeholder assets

- Swap files in `/color-flow/assets/` with your assets.
- `audio.js` currently uses WebAudio beeps for compatibility; update to decode your audio files and respect the `sound` toggle.
