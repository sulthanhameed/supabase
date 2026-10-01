"use client";

import { FoodCard } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import type { ProductDTO } from "@/lib/types";
import { motion } from "framer-motion";

export function TopMenuSection({ products }: { products: ProductDTO[] }) {
  const top = [...products]
    .sort((a, b) => b.rating * Math.log(b.reviewsCount + 2) - a.rating * Math.log(a.reviewsCount + 2))
    .slice(0, 4);
  return (
    <section id="top-menu" className="border-y border-line bg-sand py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Top menu" title="Highest rated right now." subtitle="Ranked by our guests' ratings and reviews." link={{ href: "/top-foods", label: "See all top foods" }} />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 260, damping: 14 }}
                className="absolute -left-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink font-heading text-sm text-cream"
              >
                #{i + 1}
              </motion.span>
              <FoodCard product={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
