/**
 * Verifies the frontend ↔ backend link from the command line.
 *   node scripts/check-connection.js https://khang-backend.onrender.com https://khang.vercel.app
 */
const [backend = "http://localhost:4000", frontend = "http://localhost:3000"] = process.argv.slice(2);
const api = backend.replace(/\/$/, "") + "/api";

const check = async (label, fn) => { try { const r = await fn(); console.log(`✓ ${label}`, r ?? ""); } catch (e) { console.log(`✗ ${label}: ${e.message}`); process.exitCode = 1; } };

await check("backend health", async () => { const r = await fetch(`${api}/health`); const j = await r.json(); if (!j.ok) throw new Error(JSON.stringify(j)); return j; });
await check("products endpoint", async () => { const r = await fetch(`${api}/products`); const j = await r.json(); return `${j.products?.length ?? 0} dishes`; });
await check(`CORS allows ${frontend}`, async () => {
  const r = await fetch(`${api}/products`, { method: "OPTIONS", headers: { Origin: frontend, "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": "authorization,content-type" } });
  const allow = r.headers.get("access-control-allow-origin");
  if (allow !== frontend && allow !== "*") throw new Error(`Access-Control-Allow-Origin=${allow} (set FRONTEND_URL=${frontend} on the backend)`);
  return `Access-Control-Allow-Origin: ${allow}`;
});
console.log(process.exitCode ? "\nConnection has problems — see ✗ above." : "\nFrontend ↔ backend connection OK. Set NEXT_PUBLIC_API_URL=" + backend + " on the frontend.");
