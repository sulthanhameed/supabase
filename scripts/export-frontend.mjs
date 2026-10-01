/**
 * Builds the standalone `frontend/` folder (deploy this folder on Vercel).
 * Source of truth is the repo root (src/, public/, configs). Re-run after changes:
 *    npm run export:frontend
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "frontend");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. Source + static + configs
for (const item of ["src", "public", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "eslint.config.mjs", "drizzle.config.json", "next-env.d.ts"]) {
  const from = path.join(root, item);
  if (existsSync(from)) cpSync(from, path.join(out, item), { recursive: true });
}
copyFileSync(path.join(root, "connect.js"), path.join(out, "connect.js"));

// 2. package.json (frontend only — rename, keep deps/scripts)
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
pkg.name = "khang-frontend";
pkg.description = "Khang Chinese Restaurant & Dimsum — React/Next.js frontend (deploy on Vercel)";
pkg.engines = { node: ">=20.19.0", npm: ">=10" };
pkg.scripts = { dev: "next dev", build: "next build", start: "next start -p ${PORT:-3000}", lint: "eslint .", typecheck: "tsc --noEmit" };
writeFileSync(path.join(out, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
if (existsSync(path.join(root, "package-lock.json"))) copyFileSync(path.join(root, "package-lock.json"), path.join(out, "package-lock.json"));
// yarn.lock kept in sync so hosts that default to yarn also install consistently
if (existsSync(path.join(root, "scripts", "frontend.yarn.lock"))) copyFileSync(path.join(root, "scripts", "frontend.yarn.lock"), path.join(out, "yarn.lock"));

// 3. tsconfig: drop the backend/database excludes that only matter at repo root
const tsPath = path.join(out, "tsconfig.json");
const ts = JSON.parse(readFileSync(tsPath, "utf8"));
ts.exclude = ["node_modules"];
writeFileSync(tsPath, JSON.stringify(ts, null, 2) + "\n");

// 4. Hosting files
writeFileSync(path.join(out, ".env.example"), `# REQUIRED on Vercel: URL of the Express backend on Render (no trailing slash)
NEXT_PUBLIC_API_URL=https://khang-backend.onrender.com
`);
writeFileSync(path.join(out, ".gitignore"), "node_modules\n.next\n.env\n.env.production\n");
writeFileSync(path.join(out, "vercel.json"), JSON.stringify({
  "$schema": "https://openapi.vercel.sh/vercel.json",
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand: "npm run build",
  outputDirectory: ".next",
}, null, 2) + "\n");
writeFileSync(path.join(out, ".nvmrc"), "22\n");
writeFileSync(path.join(out, ".node-version"), "22\n");
writeFileSync(path.join(out, ".npmrc"), "engine-strict=false\nfund=false\naudit=false\n");
// Render (static-less) fallback: frontend can also run on Render as a Node web service
writeFileSync(path.join(out, "render.yaml"), `services:
  - type: web
    name: khang-frontend
    runtime: node
    plan: free
    rootDir: frontend
    buildCommand: npm ci && npm run build      # ← use npm, NOT yarn
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: NEXT_PUBLIC_API_URL
        sync: false
`);
writeFileSync(path.join(out, "README.md"), `# Khang Frontend — React (Next.js)

Standalone frontend for **Khang Chinese Restaurant & Dimsum**. Talks to the Express backend only over REST.

## Connect to the backend
Either fill \`backendUrl\` in \`connect.js\` **or** set the env var:
\`\`\`
NEXT_PUBLIC_API_URL=https://khang-backend.onrender.com
\`\`\`
(Vercel → Project → Settings → Environment Variables). Then on the backend set \`FRONTEND_URL\` to this site's URL for CORS.

## Run locally
\`\`\`bash
npm install
npm run dev      # http://localhost:3000
\`\`\`

## Deploy on Vercel  (settings that must match)
| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| **Root Directory** | \`frontend\` |
| Install Command | \`npm ci\` |
| Build Command | \`npm run build\` |
| Output Directory | \`.next\` (default) |
| Node.js Version | 22.x |
| Env var | \`NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com\` |

Check the link at \`https://<your-site>/api/connection\`.

> This folder is generated from the repo root by \`npm run export:frontend\`. Edit the root \`src/\` and re-run to update.
`);

console.log(`✓ frontend/ exported (${out})`);
