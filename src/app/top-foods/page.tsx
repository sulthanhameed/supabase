import { FoodCard } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import { getProducts } from "@/lib/data";
import type { ProductDTO } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Top Foods — Khang Chinese Restaurant & Dimsum" };

export default async function TopFoodsPage() {
  let products: ProductDTO[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error(err);
  }
  const top = [...products].sort((a, b) => b.rating * Math.log(b.reviewsCount + 2) - a.rating * Math.log(a.reviewsCount + 2)).slice(0, 12);
  const podium = top.slice(0, 3);

  return (
    <div className="page-enter">
      <div className="relative overflow-hidden border-b border-line bg-sand pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading align="center" eyebrow="Hall of fame" title="Top Rated Foods" subtitle="Ranked by our guests — the most loved dishes at Khang." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {podium.map((p, i) => (
              <div key={p.id} className={`reveal relative ${i === 0 ? "md:order-2 md:-translate-y-6" : i === 1 ? "md:order-1" : "md:order-3"}`}>
                <div className="absolute -top-5 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-paper text-2xl shadow ring-1 ring-line">
                  {["🥇", "🥈", "🥉"][i]}
                </div>
                <FoodCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="reveal text-2xl font-medium">More crowd favourites</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {top.slice(3).map((p, i) => (
            <div key={p.id} className="reveal relative">
              <span className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-cream">#{i + 4}</span>
              <FoodCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
