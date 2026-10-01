"use client";

import { useAuth, useToast } from "@/components/providers";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/profile";
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form);
      toast(mode === "login" ? "Welcome back!" : "Account created! Welcome to Khang 🥟");
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm";

  return (
    <div className="page-enter flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.25rem] border border-line bg-paper md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-ink p-10 text-cream md:flex">
          <Logo dark />
          <div>
            <p className="text-3xl font-medium leading-tight">Good food,<br />zero friction.</p>
            <p className="mt-4 text-sm text-cream/60">Save addresses, track orders and reorder your favourites in one tap.</p>
          </div>
        </div>
        <form onSubmit={submit} className="p-8 md:p-10">
          <h1 className="text-2xl font-medium">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="mt-1 text-sm text-muted">{mode === "login" ? "Log in to continue ordering." : "Join the Khang family."}</p>
          <div className="mt-6 space-y-3">
            {mode === "signup" && <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={inputCls} />}
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className={inputCls} />
            {mode === "signup" && <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className={inputCls} />}
            <input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 6 chars)" className={inputCls} />
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="btn-press mt-5 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-cream hover:bg-primary-dark disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            {mode === "login" ? (
              <>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-ink underline underline-offset-4">Create an account</Link></>
            ) : (
              <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-ink underline underline-offset-4">Log in</Link></>
            )}
          </p>
          {mode === "login" && (
            <p className="mt-4 rounded-lg border border-line px-3 py-2 text-center text-[11px] text-muted">
              Admin demo: <b>admin@khang.com</b> / <b>admin123</b>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
