"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/types";
import { useCart, useProductModal } from "@/components/providers";
import { FloatingFoods } from "@/components/home/floating-foods";
import { AnimatedText } from "@/components/animated-text";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero({ spotlight }: { spotlight?: ProductDTO | null }) {
  const { add } = useCart();
  const { openProduct } = useProductModal();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-cream text-ink">
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p {...fade(0.05)} className="eyebrow">Chinese Restaurant &amp; Dimsum · Est. 2016</motion.p>

            <h1 className="mt-8 text-[3rem] font-medium leading-[1] tracking-[-0.025em] sm:text-6xl lg:text-[5.6rem]">
              <AnimatedText text="Authentic Chinese" delay={0.15} className="block" />
              <span className="block">
                <AnimatedText text="flavors," delay={0.35} />{" "}
                <AnimatedText text="crafted fresh." delay={0.45} className="serif-italic text-primary" />
              </span>
            </h1>

            <motion.p {...fade(0.6)} className="mt-9 max-w-md text-[16px] leading-[1.85] text-muted sm:text-[17px]">
              Hand-folded dim sum, wok-fired hakka noodles and fiery Manchurian — from Khang&apos;s kitchen to your door in 30 minutes.
            </motion.p>

            <motion.div {...fade(0.75)} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/menu" className="btn-press group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-cream transition hover:bg-primary">
                Order now
                <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link href="/#menu" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink underline-offset-[6px] transition hover:underline">
                Explore the menu <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </motion.div>

            <motion.div {...fade(0.95)} className="mt-14 grid max-w-md grid-cols-3 divide-x divide-line border-y border-line py-5">
              {[["4.6", "Rating · 583 reviews"], ["30 min", "Average delivery"], ["35+", "Dishes on the menu"]].map(([n, l]) => (
                <div key={l} className="px-4 first:pl-0 last:pr-0">
                  <p className="font-heading text-2xl font-medium">{n}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-6 lg:col-span-5 lg:mt-0"
          >
            <FloatingFoods />

            {spotlight && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -bottom-10 left-1/2 flex w-[88%] max-w-xs -translate-x-1/2 items-center gap-3 rounded-[1.25rem] border border-line bg-paper p-3 shadow-[0_20px_50px_-30px_rgba(22,22,22,0.35)] lg:-bottom-6 lg:left-0 lg:translate-x-0"
              >
                <button onClick={() => openProduct(spotlight)} className="shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spotlight.image} alt={spotlight.name} className="photo h-14 w-14 object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow !text-[9px]">Today&apos;s pick</p>
                  <p className="mt-0.5 truncate font-heading text-[15px]">{spotlight.name}</p>
                  <p className="text-xs text-muted">{spotlight.rating.toFixed(1)} ★ · {formatINR(spotlight.price)}</p>
                </div>
                <button onClick={() => add(spotlight)} className="btn-press shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-cream transition hover:bg-primary">
                  Add
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div {...fade(1.2)} className="absolute bottom-8 left-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted sm:left-6 lg:left-8">
          <ArrowDown size={13} className="animate-bounce" /> Scroll
        </motion.div>
      </div>
    </section>
  );
}
