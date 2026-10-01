import type { NextConfig } from "next";

/**
 * Next.js build config — the app is ONE deployment (frontend + built-in API
 * in src/app/api) backed by a Supabase Postgres database (DATABASE_URL).
 *
 * NEXT_PUBLIC_API_URL is normally EMPTY (built-in API mode). Set it only if
 * you ever host the API separately from the frontend.
 */
const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_API_URL: (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "") },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
