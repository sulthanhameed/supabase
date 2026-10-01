"use client";

import { useEffect, useState } from "react";

type Info = { mode: "built-in" | "remote"; backend: string; ok: boolean; latencyMs?: number; error?: string };

/** Small badge (used in the admin dashboard) showing the frontend ↔ backend link. */
export function ConnectionStatus() {
  const [info, setInfo] = useState<Info | null>(null);
  useEffect(() => {
    fetch("/api/connection", { cache: "no-store" }).then((r) => r.json()).then(setInfo).catch(() => setInfo({ mode: "remote", backend: "?", ok: false }));
  }, []);
  if (!info) return null;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${info.ok ? "border-line text-muted" : "border-red-200 bg-red-50 text-red-700"}`}>
      <span className={`h-2 w-2 rounded-full ${info.ok ? "bg-primary" : "bg-red-500"}`} />
      {info.mode === "built-in" ? "Backend: built-in API" : `Backend: ${info.backend.replace(/^https?:\/\//, "")}`}
      {info.ok && info.latencyMs !== undefined && <span className="text-muted/70">· {info.latencyMs} ms</span>}
      {!info.ok && <span>· offline</span>}
    </div>
  );
}
