"use client";

import { useCart, useProductModal, useToast, useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Minus, Plus, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stars } from "@/components/stars";

type Review = { id: number; name: string; rating: number; comment: string; createdAt: string };

export function ProductModal() {
  const { product, closeProduct } = useProductModal();
  const { add, open } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQty(1);
    setReviews([]);
    if (!product) return;
    document.body.style.overflow = "hidden";
    api<{ reviews: Review[] }>(`/reviews?productId=${product.id}`).then((r) => setReviews(r.reviews)).catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeProduct();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeProduct]);

  const submitReview = async () => {
    if (!product || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      const { review } = await api<{ review: Review }>("/reviews", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, name: form.name || user?.name || "Guest", rating: form.rating, comment: form.comment }),
      });
      setReviews((r) => [review, ...r]);
      setForm({ name: "", rating: 5, comment: "" });
      toast("Thanks for your review! 🙏");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProduct}
            className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" onClick={closeProduct}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-paper sm:rounded-[1.25rem]"
            >
              <button onClick={closeProduct} className="btn-press absolute right-4 top-4 z-10 rounded-full bg-paper/90 p-2 text-ink shadow hover:bg-paper">
                <X size={20} />
              </button>
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-full md:min-h-[520px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="photo h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {product.isVeg ? (
                      <span className="flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink"><Leaf size={12} className="text-primary" /> Veg</span>
                    ) : (
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink">Non-veg</span>
                    )}
                    {product.isFeatured && <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-cream">Popular</span>}
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <p className="eyebrow">{product.categoryName}</p>
                  <h2 className="mt-2 text-2xl font-medium leading-tight md:text-3xl">{product.name}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars value={product.rating} />
                    <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted">({product.reviewsCount} reviews)</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

                  <div className="mt-5">
                    <h4 className="eyebrow !text-muted">Ingredients</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {product.ingredients.split(",").map((i) => (
                        <span key={i} className="rounded-full border border-line px-2.5 py-1 text-xs">{i.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-3xl font-medium">{formatINR(product.price)}</span>
                    <div className="flex items-center gap-1 rounded-full border border-line">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="btn-press p-2.5 text-ink/70"><Minus size={16} /></button>
                      <span className="w-8 text-center font-medium">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="btn-press p-2.5 text-ink/70"><Plus size={16} /></button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { add(product, qty); closeProduct(); }}
                      className="btn-press rounded-full border border-line py-3 text-sm font-semibold transition hover:border-primary"
                    >
                      Add to cart
                    </button>
                    <button
                      onClick={() => { add(product, qty); closeProduct(); router.push("/checkout"); }}
                      className="btn-press rounded-full bg-primary py-3 text-sm font-semibold text-cream transition hover:bg-primary-dark"
                    >
                      Order now
                    </button>
                  </div>
                  <button onClick={() => { add(product, qty); closeProduct(); open(); }} className="mt-2 w-full text-center text-xs text-muted underline-offset-2 hover:underline">
                    Add & view cart
                  </button>

                  <div className="mt-8 border-t border-line pt-5">
                    <h4 className="flex items-center gap-2 text-sm font-semibold"><Star size={15} className="fill-primary text-primary" /> Reviews</h4>
                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                      {reviews.length === 0 && <p className="text-xs text-muted">No reviews yet — be the first!</p>}
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-xl border border-line p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{r.name}</span>
                            <Stars value={r.rating} size={12} />
                          </div>
                          <p className="mt-1 text-xs text-muted">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        {!user && (
                          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-1/2 rounded-lg border border-line bg-paper px-3 py-2 text-xs" />
                        )}
                        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs">
                          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"⭐".repeat(n)}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Share your experience…" className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-xs" />
                        <button disabled={submitting} onClick={submitReview} className="btn-press rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-cream hover:bg-primary-dark disabled:opacity-50">Post</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
