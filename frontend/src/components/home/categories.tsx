"use client";

import { SectionHeading } from "@/components/section-heading";
import type { CategoryDTO } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const SPAN = [
  "md:col-span-4 md:row-span-2", // big hero tile
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

export function Categories({ categories }: { categories: CategoryDTO[] }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Pick your craving."
          subtitle="Five categories, thirty-five dishes, one very hot wok."
          link={{ href: "/menu", label: "Full menu" }}
        />
        <div className="mt-12 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:auto-rows-[220px]">
          {categories.map((c, i) => {
            const big = i === 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.6 }}
                className={SPAN[i] ?? "md:col-span-2"}
              >
                <Link href={`/menu?category=${c.slug}`} className="group relative block h-full w-full overflow-hidden rounded-[1.25rem] bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" className="photo h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-paper/10 text-cream backdrop-blur-md transition group-hover:bg-paper group-hover:text-ink">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                    <span className={`block ${big ? "text-4xl" : "text-2xl"}`}>{c.emoji}</span>
                    <h3 className={`mt-2 font-heading ${big ? "text-3xl" : "text-xl"}`}>{c.name}</h3>
                    {big && <p className="mt-1 max-w-xs text-sm text-cream/70">{c.description}</p>}
                    <p className="mt-1 text-xs font-medium text-cream/60">{c.productCount} dishes</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {/* Promo tile */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <Link href="/menu" className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.25rem] border border-line bg-paper p-5 text-ink shadow-sm transition hover:border-line">
              <p className="relative font-heading text-5xl">₹0</p>
              <div className="relative">
                <p className="text-lg font-medium leading-tight">Free delivery on orders above ₹499</p>
                <p className="mt-1 text-xs text-muted">Auto-applied at checkout →</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
