import type { NextConfig } from "next";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Frontend build config (works from repo root AND from frontend/ as Root Directory).
 *
 * Backend URL priority:
 *   1. NEXT_PUBLIC_API_URL env var (Vercel → Settings → Environment Variables)
 *   2. backendUrl inside connect.js (./connect.js or ../connect.js)
 *   3. "" → built-in API on the same server (needs DATABASE_URL)
 */
const require = createRequire(import.meta.url);
const candidates = [path.resolve(process.cwd(), "connect.js"), path.resolve(process.cwd(), "../connect.js")];
const connectFile = candidates.find((p) => existsSync(p));
let connection: { resolvedBackendUrl?: string } = {};
try {
  connection = connectFile ? require(connectFile) : {};
} catch {
  connection = {};
}

const envUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
const backendUrl = envUrl || connection.resolvedBackendUrl || "";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_API_URL: backendUrl },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
