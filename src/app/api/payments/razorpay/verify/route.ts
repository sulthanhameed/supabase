import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { sendOrderEmails, sendOrderSms } from "@/lib/notifications";
import { getOrderByCode } from "@/lib/queries";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { orderCode, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  if (!orderCode || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ error: "Missing payment fields" }, { status: 400 });
  }
  const order = await getOrderByCode(orderCode);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  const ok = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!ok) {
    await db.update(payments).set({ status: "failed", providerPaymentId: razorpay_payment_id }).where(eq(payments.providerOrderId, razorpay_order_id));
    await db.update(orders).set({ paymentStatus: "failed", updatedAt: new Date() }).where(eq(orders.id, order.id));
    return Response.json({ error: "Payment verification failed" }, { status: 400 });
  }

  await db.update(payments).set({ status: "paid", providerPaymentId: razorpay_payment_id }).where(eq(payments.providerOrderId, razorpay_order_id));
  await db.update(orders).set({ paymentStatus: "paid", updatedAt: new Date() }).where(eq(orders.id, order.id));

  void sendOrderEmails({ ...order, paymentStatus: "paid" });
  void sendOrderSms(order.phone, order.orderCode, order.total);

  return Response.json({ ok: true, orderCode: order.orderCode });
}
