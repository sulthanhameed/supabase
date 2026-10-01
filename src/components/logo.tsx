import Link from "next/link";

/**
 * Modern Khang mark: a rounded square with a stylised "K" whose upper arm
 * becomes a rising steam curve — a nod to dim sum baskets.
 */
export function LogoMark({ size = 36, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="khang-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f7f5f" />
          <stop offset="1" stopColor="#2f5a3d" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={dark ? "#ffffff" : "url(#khang-g)"} />
      {/* K stem */}
      <rect x="11" y="10" width="4.5" height="20" rx="2.25" fill={dark ? "#0a0a0a" : "#ffffff"} />
      {/* K lower leg */}
      <path d="M16 21.5 L25.5 30.5" stroke={dark ? "#0a0a0a" : "#ffffff"} strokeWidth="4.5" strokeLinecap="round" />
      {/* K upper arm curving into steam */}
      <path d="M16 19 C 20 16, 23 15, 25.5 11.5" stroke={dark ? "#0a0a0a" : "#ffffff"} strokeWidth="4.5" strokeLinecap="round" />
      {/* steam dot */}
      <circle cx="29" cy="9.5" r="2.2" fill={dark ? "#3f6f4f" : "#ffffff"} />
    </svg>
  );
}

export function Logo({ href = "/#home", dark = false, className = "" }: { href?: string; dark?: boolean; className?: string }) {
  return (
    <Link href={href} className={`group flex items-center gap-2.5 ${className}`} aria-label="Khang home">
      <span className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
        <LogoMark size={34} dark={dark} />
      </span>
      <span className="leading-none">
        <span className={`font-heading block text-[19px] font-medium tracking-tight ${dark ? "text-white" : "text-ink"}`}>Khang</span>
        <span className={`mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em] ${dark ? "text-white/50" : "text-muted"}`}>Chinese · Dimsum</span>
      </span>
    </Link>
  );
}
