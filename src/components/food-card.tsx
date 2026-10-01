"use client";

import { useCart, useProductModal } from "@/components/providers";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FoodCard({ product, compact = false }: { product: ProductDTO; compact?: boolean }) {
  const { add } = useCart();
  const { openProduct } = useProductModal();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState(false);

  const handleAdd = () => {
    add(product, qty);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
    setQty(1);
  };

  return (
    <article className={`card-lift group flex flex-col overflow-hidden rounded-[1.25rem] border border-line bg-paper ${compact ? "w-64 shrink-0" : ""}`}>
      <button onClick={() => openProduct(product)} className="relative block aspect-[4/3] overflow-hidden bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} loading="lazy" className="photo h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full ${product.isVeg ? "bg-primary" : "bg-[#b3552e]"}`} />
          {product.isVeg ? "Veg" : "Non-veg"}
        </span>
        {product.isFeatured && <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream backdrop-blur">Popular</span>}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <button onClick={() => openProduct(product)} className="text-left">
            <h3 className="line-clamp-1 font-heading text-[17px] font-medium transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
          </button>
          <span className="shrink-0 pt-0.5 text-[15px] font-semibold">{formatINR(product.price)}</span>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          <span className="font-semibold text-ink">{product.rating.toFixed(1)}</span> ★ · {product.reviewsCount} reviews
        </p>
        {!compact && <p className="mt-3 line-clamp-2 text-[13px] leading-[1.7] text-muted">{product.description}</p>}

        <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
          <div className="flex items-center rounded-full border border-line">
            <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="btn-press p-2 text-ink/60 hover:text-ink"><Minus size={13} /></button>
            <span className="w-5 text-center text-xs font-semibold">{qty}</span>
            <button aria-label="Increase" onClick={() => setQty((q) => Math.min(20, q + 1))} className="btn-press p-2 text-ink/60 hover:text-ink"><Plus size={13} /></button>
          </div>
          <button onClick={handleAdd} className={`btn-press flex-1 rounded-full py-2 text-xs font-semibold transition ${flash ? "bg-primary text-cream" : "bg-ink text-cream hover:bg-primary"}`}>
            {flash ? "Added" : "Add to cart"}
          </button>
          <button onClick={() => { add(product, qty); router.push("/checkout"); }} className="btn-press rounded-full border border-line px-3 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary" title="Order now">
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}

export function FoodCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[1.25rem] border border-line bg-paper ${compact ? "w-64 shrink-0" : ""}`}>
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-8 w-full rounded-full" />
      </div>
    </div>
  );
}
