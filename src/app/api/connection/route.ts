import { BACKEND_URL, USE_REMOTE_BACKEND, apiUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

/**
 * GET /api/connection — reports how the frontend is connected to the backend.
 * Open it in the browser after deploying to confirm the link works.
 */
export async function GET() {
  if (!USE_REMOTE_BACKEND) {
    return Response.json({
      mode: "built-in",
      backend: "same server (src/app/api)",
      database: "supabase",
      ok: true,
      hint: "Using the built-in API with the Supabase Postgres backend (DATABASE_URL).",
    });
  }
  const started = Date.now();
  try {
    const res = await fetch(apiUrl("/health"), { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = await res.json().catch(() => ({}));
    return Response.json({ mode: "remote", backend: BACKEND_URL, ok: res.ok && body.ok === true, status: res.status, latencyMs: Date.now() - started });
  } catch (err) {
    return Response.json({ mode: "remote", backend: BACKEND_URL, ok: false, error: (err as Error).message, hint: "Is the API server running and is CORS configured for this domain?" }, { status: 502 });
  }
}
