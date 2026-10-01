"use client";

import { FoodCard, FoodCardSkeleton } from "@/components/food-card";
import { api } from "@/lib/api";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function MenuClient({ initialProducts, categories }: { initialProducts: ProductDTO[]; categories: CategoryDTO[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const activeCat = sp.get("category") ?? "all";
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "rating">("popular");
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    api<{ products: ProductDTO[] }>("/products").then((r) => setProducts(r.products)).finally(() => setLoading(false));
  }, [initialProducts.length]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== "all") list = list.filter((p) => p.categorySlug === activeCat);
    if (vegOnly) list = list.filter((p) => p.isVeg);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.categoryName?.toLowerCase().includes(s));
    }
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.reviewsCount - a.reviewsCount);
    }
    return list;
  }, [products, activeCat, vegOnly, q, sort]);

  const setCat = (slug: string) => {
    const params = new URLSearchParams(sp.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    router.push(`/menu${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  const activeCategory = categories.find((c) => c.slug === activeCat);
  const grouped = activeCat === "all" && !q && !vegOnly;

  return (
    <div>
      {/* Header */}
      <div className="relative border-b border-line bg-paper pb-12 pt-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeCat} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}>
              <p className="eyebrow">{activeCategory ? "Category" : "Menu"}</p>
              <h1 className="mt-3 text-4xl font-medium md:text-5xl">{activeCategory ? activeCategory.name : "Our menu"}</h1>
              <p className="mt-3 max-w-xl text-muted">{activeCategory?.description ?? "Every dish made to order with fresh ingredients and real wok fire."}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[84px] z-30 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[{ slug: "all", name: "All", emoji: "" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`btn-press flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCat === c.slug ? "bg-primary text-cream" : "border border-line bg-paper text-ink hover:border-primary"
                }`}
              >
                <span>{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center gap-2 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="w-full rounded-full border border-line bg-paper py-2 pl-9 pr-3 text-sm" />
            </div>
            <button
              onClick={() => setVegOnly((v) => !v)}
              className={`btn-press flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${vegOnly ? "border-primary bg-primary text-cream" : "border-line bg-paper text-ink"}`}
            >
              <Leaf size={14} /> Veg
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-line bg-paper px-3 py-2 text-xs font-semibold">
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        ) : grouped ? (
          <div className="space-y-16">
            {categories.map((c) => {
              const list = filtered.filter((p) => p.categorySlug === c.slug);
              if (list.length === 0) return null;
              return (
                <section key={c.slug} id={c.slug} className="reveal">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <p className="eyebrow">{list.length} dishes</p>
                      <h2 className="text-2xl font-medium md:text-3xl">{c.name}</h2>
                    </div>
                    <button onClick={() => setCat(c.slug)} className="text-sm font-semibold underline-offset-4 hover:underline">View all →</button>
                  </div>
                  <div className="scrollbar-hide -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
                    {list.map((p) => (
                      <div key={p.id} className="w-64 shrink-0 snap-start lg:w-auto">
                        <FoodCard product={p} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCat + q + String(vegOnly) + sort}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-6xl">🍽️</p>
                  <p className="mt-4 font-semibold">No dishes match your search.</p>
                  <button onClick={() => { setQ(""); setVegOnly(false); setCat("all"); }} className="mt-3 text-sm font-semibold underline">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                      <FoodCard product={p} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
