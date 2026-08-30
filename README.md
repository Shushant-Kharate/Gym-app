# Iron Coach

Mobile-first, local personal training, nutrition, body measurement, and workout analytics app.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Deploy to Vercel

The repository includes `vercel.json` so React Router URLs work when opened or
refreshed directly. Vercel detects Vite automatically and uses `npm run build`
with `dist` as the output directory.

1. Import the repository into Vercel, or run `vercel` from this directory.
2. Keep the framework preset as **Vite** and the project root as this directory.
3. Deploy a preview and verify `/`, `/program`, `/library`, and `/settings`.
4. Promote the verified preview or run `vercel --prod`.

No Vercel environment variables are required. Each user enters their own Gemini
API key in Settings; app data and that key remain in that browser's local storage.

## Architecture

- React + Vite frontend with React Router
- Browser `localStorage` persistence through `src/db/storage.js`
- Repeatable 7-day Push/Pull/Legs A/B program in `src/data/program.js`
- Local exercise MP4 files in `public/videos`, with YouTube fallback
- Recharts analytics and Web Audio workout cues
- Optional Gemini coaching using `gemini-2.5-flash`

The Gemini key is entered in Settings. It is kept in browser storage and sent directly to Google's Gemini API, so this client-only setup is intended for personal use. A public deployment should use a server-side proxy for the key.

## Optional video refresh

`download_videos.py` downloads mapped exercise videos with `yt-dlp`. The app works without running it; missing local files fall back to YouTube.
