import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatedText } from "@/components/animated-text";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = "left",
  link,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: "left" | "center";
  link?: { href: string; label: string };
}) {
  const center = align === "center";
  return (
    <div className={`reveal flex flex-col gap-6 ${center ? "mx-auto max-w-2xl items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={center ? "" : "max-w-2xl"}>
        {eyebrow && <p className={`eyebrow ${light ? "!text-white/60" : ""}`}>{eyebrow}</p>}
        <AnimatedText as="h2" text={title} className={`mt-5 text-3xl font-medium md:text-4xl lg:text-[3.1rem] ${light ? "text-white" : "text-ink"}`} />
        {subtitle && <p className={`mt-5 max-w-xl text-[15px] leading-[1.85] md:text-base ${light ? "text-white/60" : "text-muted"}`}>{subtitle}</p>}
      </div>
      {link && (
        <Link href={link.href} className={`group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-[6px] transition hover:underline ${light ? "text-white" : "text-ink"}`}>
          {link.label} <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
