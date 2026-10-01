import { defineConfig } from "drizzle-kit";
import "dotenv/config";

/**
 * Drizzle Kit config — an ALTERNATIVE to the Supabase CLI for applying
 * src/db/schema.ts to the database (uses DATABASE_URL from .env).
 *
 *   npm run db:push     → apply the schema to the database
 *   npm run db:studio   → browse / edit the data in a local UI
 *
 * The Supabase way is `supabase db push` (applies supabase/migrations/*).
 * Either is fine — the app also bootstraps the schema itself on first
 * request, so this is only needed if you prefer managing it manually.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  },
});
