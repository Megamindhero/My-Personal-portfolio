# Josep Kingsley portfolio

Next.js 15 (static export) + React Three Fiber + Three.js r187.

## Edit content
Everything (projects, dates, stacks, stats, roles, links) lives in `lib/data.ts`.
Each project's `hue` is the color the 3D field shifts to when you hover it.

## Run locally
npm install
npm run dev        # http://localhost:3000

## Deploy to Netlify
Option A: Git: push this folder to GitHub, "Add new project" in Netlify, pick the repo.
`netlify.toml` already sets build = `npm run build`, publish = `out`.

Option B: Netlify Drop: `npm run build`, then drag the `out/` folder onto app.netlify.com/drop.

## Files
- components/Field.tsx: the interactive block field (cursor lift, click pulse, scroll camera)
- components/Scene.tsx: canvas, lights, bloom/vignette
- app/page.tsx: page sections
- app/globals.css: all styling
