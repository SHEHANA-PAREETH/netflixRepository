# Netflix Clone

A responsive Netflix-style browsing app built with React, Vite and the [TMDB](https://www.themoviedb.org) API. It is a learning project, not affiliated with Netflix.

## Features

- Mobile-first layout, tested from 320px phones to wide desktops
- Rotating hero banner (poster on phones, backdrop on desktop)
- Top 10, trending, Netflix originals and genre rows with lazy loading and skeletons
- Details window with trailer, cast, similar titles and share link; the open title lives in the URL (`?watch=movie-603`)
- Live search with endless scrolling
- Movies and TV pages with genre filters and sorting
- My List and Recently viewed, saved in the browser (synced across tabs)
- Keyboard and screen-reader friendly, respects reduced motion

## Run it

```bash
npm install
cp .env.example .env     # then put your TMDB v3 API key in VITE_TMDB_KEY
npm run dev              # http://localhost:3005
npm run build            # output in build/
```

Get a free key at https://www.themoviedb.org/settings/api. Never commit `.env`.
The key is bundled into the browser app, so visitors can see it. That is normal for TMDB v3 keys.

## Deploy

Any static host works: build command `npm run build`, publish directory `build`, and rewrite `/*` to `/index.html` (already in `public/_redirects`).
