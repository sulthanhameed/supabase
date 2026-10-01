# Khang Frontend — React (Next.js)

Standalone frontend for **Khang Chinese Restaurant & Dimsum**. Talks to the Express backend only over REST.

## Connect to the backend
Either fill `backendUrl` in `connect.js` **or** set the env var:
```
NEXT_PUBLIC_API_URL=https://khang-backend.onrender.com
```
(Vercel → Project → Settings → Environment Variables). Then on the backend set `FRONTEND_URL` to this site's URL for CORS.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy on Vercel  (settings that must match)
| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| **Root Directory** | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `.next` (default) |
| Node.js Version | 22.x |
| Env var | `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com` |

Check the link at `https://<your-site>/api/connection`.

> This folder is generated from the repo root by `npm run export:frontend`. Edit the root `src/` and re-run to update.
