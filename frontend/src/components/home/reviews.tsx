"use client";

import { SectionHeading } from "@/components/section-heading";
import { Stars } from "@/components/stars";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type Review = { id: number; name: string; rating: number; comment: string; createdAt: string };

const FALLBACK: Review[] = [
  { id: -1, name: "Priya S.", rating: 5, comment: "The chicken momos are the best in town. Juicy, hot and that chutney is unreal!", createdAt: "" },
  { id: -2, name: "Arjun M.", rating: 5, comment: "Ordered the noodle & chilli chicken combo — arrived hot in 30 minutes.", createdAt: "" },
  { id: -3, name: "Fathima R.", rating: 4, comment: "Loved the Har Gow. Authentic dim sum, delicate skins.", createdAt: "" },
];

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK);
  useEffect(() => {
    api<{ reviews: Review[] }>("/reviews").then((r) => r.reviews.length && setReviews(r.reviews)).catch(() => {});
  }, []);
  const loop = [...reviews, ...reviews];

  return (
    <section className="overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Loved by foodies" title="Don't take our word for it." />
          </div>
          <div className="reveal flex items-center gap-4 rounded-[1.25rem] border border-line bg-paper px-7 py-5">
            <span className="font-heading text-6xl">4.6</span>
            <div>
              <Stars value={4.6} size={20} />
              <p className="mt-1 text-sm text-muted">Based on 583 reviews</p>
            </div>
          </div>
        </div>
      </div>
      <div className="reveal relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee-track flex w-max animate-marquee-slow gap-5 px-4 py-2">
          {loop.map((r, i) => (
            <figure key={`${r.id}-${i}`} className="w-80 shrink-0 rounded-[1.25rem] border border-line bg-paper p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-sm font-semibold">{r.name.charAt(0)}</div>
                <div>
                  <figcaption className="font-semibold">{r.name}</figcaption>
                  <Stars value={r.rating} size={12} />
                </div>
                
              </div>
              <blockquote className="mt-5 font-heading text-[17px] italic leading-[1.6] text-ink/80">&ldquo;{r.comment}&rdquo;</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
