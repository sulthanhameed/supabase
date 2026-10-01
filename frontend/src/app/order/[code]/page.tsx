import { OrderTracker } from "@/components/order-tracker";
import { getOrder } from "@/lib/data";
import { formatINR } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SuccessConfetti } from "./confetti";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrder(code);
  if (!order) notFound();

  return (
    <div className="page-enter min-h-screen pb-20 pt-28">
      <SuccessConfetti />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="animate-pop rounded-[1.25rem] border border-line bg-paper p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-cream">✓</div>
                    <h1 className="mt-1 text-3xl font-medium">Order Confirmed!</h1>
          <p className="mt-2 text-muted">Thank you, {order.customerName}. Our chefs are firing up the wok.</p>
          <div className="mt-6 inline-block rounded-[1.25rem] border border-dashed border-line bg-sand px-8 py-4">
            <p className="eyebrow !text-muted">Your Order ID</p>
            <p className="font-mono text-3xl font-medium tracking-widest">{order.orderCode}</p>
          </div>
          <div className="mt-6 grid gap-3 text-left text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-paper p-3"><p className="text-xs text-muted">Total</p><p className="font-medium">{formatINR(order.total)}</p></div>
            <div className="rounded-xl bg-paper p-3"><p className="text-xs text-muted">Payment</p><p className="font-medium uppercase">{order.paymentMethod} · {order.paymentStatus.replace("_", " ")}</p></div>
            <div className="rounded-xl bg-paper p-3"><p className="text-xs text-muted">ETA</p><p className="font-medium">30–40 min</p></div>
          </div>
          <p className="mt-5 text-xs text-muted">
            📩 Confirmation sent to {order.email ? <b>{order.email}</b> : "our kitchen"} · 📱 SMS to <b>{order.phone}</b>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/menu" className="btn-press rounded-full border border-line px-6 py-2.5 text-sm font-semibold hover:border-primary">Order more</Link>
            <Link href="/profile" className="btn-press rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-cream hover:bg-primary-dark">My orders</Link>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-medium">Live Tracking</h2>
          <OrderTracker initialCode={order.orderCode} />
        </div>
      </div>
    </div>
  );
}
