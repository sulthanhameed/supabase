"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useAuth, useCart } from "@/components/providers";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/#home", id: "home", label: "Home" },
  { href: "/#menu", id: "menu", label: "Menu" },
  { href: "/#about", id: "about", label: "About" },
  { href: "/#services", id: "services", label: "Services" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [bump, setBump] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const { count, open, lastAdded } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!lastAdded) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 400);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const isActive = (l: (typeof LINKS)[number]) =>
    pathname === "/" ? activeId === l.id : pathname === `/${l.id}` || (l.id === "menu" && pathname.startsWith("/menu"));

  const iconBtn = "btn-press rounded-full p-2.5 text-ink transition hover:bg-paper";
  const expanded = mobileOpen || searchOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`glass mx-auto overflow-hidden ${expanded ? "rounded-3xl" : "rounded-full"} ${scrolled ? "max-w-5xl shadow-[0_12px_40px_-16px_rgba(22,22,22,0.22)]" : "max-w-7xl shadow-none"}`}
      >
        {/* top highlight line */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="flex h-[60px] items-center justify-between pl-4 pr-2 sm:pl-5 sm:pr-2.5">
          <Logo />

          <nav className="hidden items-center gap-0.5 rounded-full border border-line/70 bg-paper/50 p-1 lg:flex">
            {LINKS.map((l) => {
              const active = isActive(l);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium tracking-wide transition-colors ${active ? "text-cream" : "text-ink/70 hover:text-ink"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-ink"
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5">
            <button aria-label="Search" onClick={() => { setSearchOpen((s) => !s); setMobileOpen(false); }} className={iconBtn}>
              <Search size={19} strokeWidth={1.75} />
            </button>
            <button aria-label="Cart" onClick={open} className={`${iconBtn} relative ${bump ? "animate-pop" : ""}`}>
              <ShoppingBag size={19} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-cream ring-2 ring-cream">{count}</span>
              )}
            </button>
            <Link
              href={user ? "/profile" : "/login"}
              className="btn-press ml-1 hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:bg-primary sm:flex"
            >
              <User size={15} strokeWidth={2} />
              {user ? user.name.split(" ")[0] : "Login"}
            </Link>
            <button aria-label="Menu" onClick={() => { setMobileOpen((s) => !s); setSearchOpen(false); }} className={`${iconBtn} lg:hidden`}>
              {mobileOpen ? <X size={21} strokeWidth={1.75} /> : <Menu size={21} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.form
              key="search"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/menu?q=${encodeURIComponent(q)}`);
                setSearchOpen(false);
              }}
              className="overflow-hidden border-t border-line"
            >
              <div className="flex items-center gap-3 px-5 py-3">
                <Search size={18} className="text-muted" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="w-full bg-transparent py-2 text-sm placeholder:text-muted" />
                <button className="btn-press rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream hover:bg-primary">Search</button>
              </div>
            </motion.form>
          )}
          {mobileOpen && (
            <motion.nav key="mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line lg:hidden">
              <div className="flex flex-col gap-1 p-3">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive(l) ? "bg-ink text-cream" : "text-ink/80 hover:bg-paper"}`}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link href={user ? "/profile" : "/login"} className="mt-1 rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-cream">
                  {user ? `Profile — ${user.name.split(" ")[0]}` : "Login / Sign up"}
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className="rounded-2xl border border-line bg-paper px-4 py-3 text-center text-sm font-semibold">Admin</Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
