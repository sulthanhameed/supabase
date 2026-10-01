"use client";

import { useCart, useProductModal } from "@/components/providers";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/types";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";

export function MostLoved({ products }: { products: ProductDTO[] }) {
  const { add } = useCart();
  const { openProduct } = useProductModal();
  const loop = products.length ? [...products, ...products] : [];

  if (loop.length === 0) return null;

  return (
    <div className="relative -mx-4 mt-14 sm:-mx-6 lg:-mx-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent sm:w-28" />
      <div className="marquee-track flex w-max animate-marquee gap-5 px-4 py-3 sm:px-6 lg:px-8">
        {loop.map((p, i) => (
          <motion.article
            key={`${p.id}-${i}`}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group relative w-72 shrink-0 overflow-hidden rounded-[1.25rem] border border-line bg-paper"
          >
            <button onClick={() => openProduct(p)} className="relative block aspect-[4/3] w-full overflow-hidden bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="photo h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                <Heart size={11} className="fill-primary text-primary" /> Loved
              </span>
              <span className="absolute bottom-3 right-3 translate-y-2 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-cream opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {formatINR(p.price)}
              </span>
            </button>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-heading text-[17px] font-medium transition-colors duration-300 group-hover:text-primary">{p.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <span className="font-semibold text-ink">{p.rating.toFixed(1)}</span> ★ · {p.reviewsCount} reviews
                </p>
              </div>
              <button
                onClick={() => add(p)}
                aria-label={`Add ${p.name}`}
                className="btn-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
              >
                <Plus size={16} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
