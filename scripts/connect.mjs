/**
 * Writes the URLs from connect.js into the env files each app reads,
 * so both sides are joined with one command:  npm run connect
 */
import { createRequire } from "node:module";
import { existsSync, writeFileSync, readFileSync } from "node:fs";

const c = createRequire(import.meta.url)("../connect.js");

function upsertEnv(file, key, value) {
  let body = existsSync(file) ? readFileSync(file, "utf8") : "";
  const line = `${key}=${value}`;
  body = new RegExp(`^${key}=.*$`, "m").test(body) ? body.replace(new RegExp(`^${key}=.*$`, "m"), line) : body + (body && !body.endsWith("\n") ? "\n" : "") + line + "\n";
  writeFileSync(file, body);
  console.log(`  ${file}  ←  ${line}`);
}

console.log("Joining frontend ↔ backend from connect.js\n");
if (!c.backendUrl) console.log("  ⚠ backendUrl is empty — frontend will use its built-in API. Fill it in connect.js after deploying the backend.\n");
upsertEnv("frontend/.env.production", "NEXT_PUBLIC_API_URL", c.backendUrl);
upsertEnv(".env", "NEXT_PUBLIC_API_URL", c.backendUrl);
upsertEnv("backend/.env", "FRONTEND_URL", c.frontendUrl);
upsertEnv("backend/.env", "OWNER_EMAIL", c.ownerEmail);
console.log("\n✓ done. Redeploy both apps (or restart locally) to apply.");
