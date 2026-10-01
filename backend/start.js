#!/usr/bin/env node
/**
 * Self-healing launcher for the Khang backend.
 *
 *   npm start  →  node start.js
 *
 * 1. If node_modules is missing (fresh clone, host skipped the build step,
 *    wrong Root Directory, etc.) it runs `npm install --omit=dev` first.
 * 2. Loads .env (if present) and starts server.js.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
process.chdir(here);

const needsInstall = !existsSync(path.join(here, "node_modules", "express", "package.json"));

if (needsInstall) {
  console.log("📦 node_modules missing — installing backend dependencies…");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const lock = existsSync(path.join(here, "package-lock.json"));
  const args = lock ? ["ci", "--omit=dev", "--no-audit", "--no-fund"] : ["install", "--omit=dev", "--no-audit", "--no-fund"];
  let r = spawnSync(npm, args, { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
  if (r.status !== 0 && lock) {
    console.log("↻ npm ci failed, retrying with npm install…");
    r = spawnSync(npm, ["install", "--omit=dev", "--no-audit", "--no-fund"], { stdio: "inherit" });
  }
  if (r.status !== 0) {
    console.error("✗ dependency install failed");
    process.exit(r.status ?? 1);
  }
  console.log("✓ dependencies installed");
}

await import("./server.js");
