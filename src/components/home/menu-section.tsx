"use client";

import { FoodCard } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { MostLoved } from "@/components/home/most-loved";
import { AnimatedText } from "@/components/animated-text";

export function MenuSection({ products, categories }: { products: ProductDTO[]; categories: CategoryDTO[] }) {
  const [active, setActive] = useState<string>(categories[0]?.slug ?? "all");
  const list = products.filter((p) => p.categorySlug === active).slice(0, 8);

  return (
    <section id="menu" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Menu" title="Our menu." subtitle="Fresh from the wok — pick a category to browse." link={{ href:"/menu", label: "Full menu" }} />

        {/* Most loved dishes — continuous slider at the top of the menu */}
        <div className="mt-14 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Most loved</p>
            <AnimatedText as="h3" text="Dishes people keep coming back for." className="mt-4 text-2xl font-medium md:text-[2rem]" />
          </div>
          <p className="hidden text-xs text-muted sm:block">Hover to pause</p>
        </div>
        <MostLoved products={products.filter((p) => p.isFeatured)} />

        <div className="mt-20 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse</p>
            <AnimatedText as="h3" text="By category." className="mt-4 text-2xl font-medium md:text-[2rem]" />
          </div>
        </div>
        <div className="scrollbar-hide mt-8 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className={`btn-press flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === c.slug ? "border-ink bg-ink text-cream" : "border-line bg-paper text-ink hover:border-ink"
              }`}
            >
              <span>{c.emoji}</span> {c.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {list.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <FoodCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 text-center">
          <Link href={`/menu?category=${active}`} className="btn-press inline-flex rounded-full border border-line px-7 py-3 text-sm font-medium transition hover:bg-primary hover:border-primary hover:text-cream">
            View all {categories.find((c) => c.slug === active)?.name ?? "dishes"} →
          </Link>
        </div>
      </div>
    </section>
  );
}
