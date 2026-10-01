import Link from "next/link";
import { Logo } from "@/components/logo";

const COLS = [
  { title: "Explore", links: [["/#home", "Home"], ["/#menu", "Menu"], ["/#top-menu", "Top Menu"], ["/#about", "About"], ["/#services", "Services"], ["/#contact", "Contact"]] },
  { title: "Orders", links: [["/menu", "Full menu"], ["/track", "Track order"], ["/profile", "Order history"], ["/checkout", "Checkout"]] },
  { title: "Account", links: [["/login", "Log in"], ["/signup", "Sign up"], ["/profile", "Profile"]] },
];

export function Footer() {
  return (
    <footer className="mt-28 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-[1.8] text-muted">
            Chinese Restaurant & Dimsum. Hand-folded dim sum and wok-fired classics, delivered hot.
          </p>
          <div className="mt-7 space-y-1.5 text-sm leading-relaxed text-muted">
            <p>12 Lantern Street, Chinatown Square, Chennai 600 001</p>
            <p>+91 90000 00000 · sultham456@gmail.com</p>
            <p>11:00 AM – 11:00 PM, all days</p>
          </div>
          <a href="https://www.instagram.com/khang.resto" target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline">
            @khang.resto ↗
          </a>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="eyebrow">{c.title}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {c.links.map(([href, label]) => (
                <li key={label}><Link href={href} className="text-ink/80 transition hover:text-primary">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Khang Chinese Restaurant & Dimsum</p>
          <p>Free delivery on orders above ₹499</p>
        </div>
      </div>
    </footer>
  );
}
