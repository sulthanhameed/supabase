import { OrderTracker } from "@/components/order-tracker";
import { SectionHeading } from "@/components/section-heading";
import { Suspense } from "react";

export const metadata = { title: "Track Order — Khang Chinese Restaurant & Dimsum" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <div className="page-enter min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading align="center" eyebrow="Live status" title="Track Your Order" subtitle="Your Order ID was shown after checkout and sent to your email & phone." />
        <div className="mt-10">
          <Suspense>
            <OrderTracker initialCode={code ?? ""} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
