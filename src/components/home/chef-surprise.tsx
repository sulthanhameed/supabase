"use client";

import { useCart, useProductModal } from "@/components/providers";
import { api } from "@/lib/api";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function ChefSurprise() {
  const [spinning, setSpinning] = useState(false);
  const [pick, setPick] = useState<ProductDTO | null>(null);
  const { add } = useCart();
  const { openProduct } = useProductModal();

  const spin = async () => {
    setSpinning(true);
    setPick(null);
    const [res] = await Promise.all([
      api<{ product: ProductDTO }>("/products?random=true").catch(() => null),
      new Promise((r) => setTimeout(r, 1800)),
    ]);
    setSpinning(false);
    if (res?.product) setPick(res.product);
  };

  return (
    <section className="relative overflow-hidden border-y border-line bg-sand py-28 text-ink">

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="reveal">
          <p className="eyebrow">Can&apos;t decide?</p>
          <h2 className="mt-3 text-4xl font-medium leading-[1] tracking-[-0.03em] md:text-5xl">
            Let the chef <em className="text-primary">surprise</em> you.
          </h2>
          <p className="mt-6 max-w-md leading-[1.8] text-muted">
            Let fate (and our chef) choose your next favourite dish. Spin the lantern and we&apos;ll pick something delicious from the menu.
          </p>
          <button
            onClick={spin}
            disabled={spinning}
            className="btn-press mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-primary-dark disabled:opacity-70"
          >
            <Sparkles size={20} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning…" : "Chef's Surprise"}
          </button>
        </div>

        <div className="reveal flex items-center justify-center">
          <div className="relative flex h-80 w-80 items-center justify-center">
            <motion.div
              animate={spinning ? { rotate: 1080 } : { rotate: 0 }}
              transition={spinning ? { duration: 1.8, ease: [0.2, 0.8, 0.2, 1] } : { duration: 0 }}
              className="absolute inset-0 rounded-full border border-dashed border-line"
            />
            <motion.div
              animate={spinning ? { rotate: -720 } : { rotate: 0 }}
              transition={spinning ? { duration: 1.8, ease: [0.2, 0.8, 0.2, 1] } : { duration: 0 }}
              className="absolute inset-6 rounded-full border border-line"
            />
            <AnimatePresence mode="wait">
              {pick ? (
                <motion.button
                  key={pick.id}
                  onClick={() => openProduct(pick)}
                  initial={{ scale: 0, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="relative h-56 w-56 overflow-hidden rounded-full shadow-xl ring-4 ring-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pick.image} alt={pick.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-ink/90 to-transparent p-4 text-center">
                    <p className="text-sm font-medium leading-tight text-cream">{pick.name}</p>
                    <p className="text-cream/70">{formatINR(pick.price)}</p>
                  </div>
                </motion.button>
              ) : (
                <motion.div
                  key="lantern"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: spinning ? [1, 1.15, 1] : 1, opacity: 1 }}
                  transition={spinning ? { repeat: Infinity, duration: 0.6 } : {}}
                  className="flex h-40 w-40 items-center justify-center rounded-full bg-paper text-6xl shadow-sm"
                >
                  🥢
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {pick && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mx-auto mt-8 flex max-w-md items-center justify-center gap-3"
          >
            <button onClick={() => add(pick)} className="btn-press rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-cream hover:bg-primary-dark">Add to cart</button>
            <button onClick={spin} className="btn-press rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink hover:border-primary">Spin again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
