"use client";

import { FoodCard, FoodCardSkeleton } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import type { ProductDTO } from "@/lib/types";

export function FeaturedSlider({ products }: { products: ProductDTO[] }) {
  const loop = products.length > 0 ? [...products, ...products] : [];
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Chef's favourites"
          title="Dishes people keep coming back for."
          subtitle="Hover to pause. Tap any card for the full story, ingredients and reviews."
          link={{ href: "/top-foods", label: "See top rated" }}
        />
      </div>
      <div className="reveal relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent sm:w-32" />
        {loop.length === 0 ? (
          <div className="flex gap-5 px-4">{Array.from({ length: 5 }).map((_, i) => <FoodCardSkeleton key={i} compact />)}</div>
        ) : (
          <div className="marquee-track flex w-max animate-marquee gap-5 px-2 py-4">
            {loop.map((p, i) => <FoodCard key={`${p.id}-${i}`} product={p} compact />)}
          </div>
        )}
      </div>
    </section>
  );
}
