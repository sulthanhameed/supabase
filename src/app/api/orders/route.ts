import { db } from "@/db";
import { orderItems, orders, payments, products, tracking } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderEmails, sendOrderSms } from "@/lib/notifications";
import { getOrderByCode, listOrdersForUser } from "@/lib/queries";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { calcTotals } from "@/lib/types";
import { inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function generateOrderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KH-${s}`;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await listOrdersForUser(user.id);
  return Response.json({ orders: data });
}

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const notes = body.notes ? String(body.notes).trim() : null;
  const paymentMethod = String(body.paymentMethod ?? "cod");
  const items: { productId: number; quantity: number }[] = Array.isArray(body.items) ? body.items : [];

  if (!customerName || phone.replace(/\D/g, "").length < 10 || address.length < 8) {
    return Response.json({ error: "Please provide name, a valid phone number and full address" }, { status: 400 });
  }
  if (items.length === 0) return Response.json({ error: "Cart is empty" }, { status: 400 });
  if (!["upi", "card", "wallet", "cod"].includes(paymentMethod)) {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Price everything server-side
  const ids = items.map((i) => Number(i.productId));
  const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
  const lineItems = items
    .map((i) => {
      const p = dbProducts.find((d) => d.id === Number(i.productId));
      if (!p) return null;
      return { productId: p.id, name: p.name, image: p.image, price: p.price, quantity: Math.max(1, Math.min(20, Number(i.quantity) || 1)) };
    })
    .filter(Boolean) as { productId: number; name: string; image: string; price: number; quantity: number }[];
  if (lineItems.length === 0) return Response.json({ error: "No valid items" }, { status: 400 });

  const totals = calcTotals(lineItems);
  const user = await getCurrentUser(req);

  const isOnline = paymentMethod !== "cod";
  const useRazorpay = isOnline && razorpayConfigured();

  let orderCode = generateOrderCode();
  // ensure unique
  for (let i = 0; i < 5; i++) {
    const existing = await getOrderByCode(orderCode);
    if (!existing) break;
    orderCode = generateOrderCode();
  }

  const [order] = await db
    .insert(orders)
    .values({
      orderCode,
      userId: user?.id ?? null,
      customerName,
      phone,
      email,
      address,
      notes,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      paymentMethod,
      paymentStatus: isOnline ? (useRazorpay ? "pending" : "paid") : "cod_pending",
      status: "received",
    })
    .returning();

  await db.insert(orderItems).values(lineItems.map((li) => ({ ...li, orderId: order.id })));
  await db.insert(tracking).values({ orderId: order.id, status: "received", note: "We have received your order." });

  let razorpay: { keyId: string; orderId: string; amount: number; currency: string } | null = null;

  if (useRazorpay) {
    try {
      const rz = await createRazorpayOrder(totals.total, orderCode);
      await db.insert(payments).values({
        orderId: order.id,
        provider: "razorpay",
        providerOrderId: rz.id,
        amount: totals.total,
        status: "created",
      });
      razorpay = { keyId: razorpayKeyId(), orderId: rz.id, amount: rz.amount, currency: rz.currency };
    } catch (err) {
      console.error(err);
      return Response.json({ error: "Payment gateway error. Please try again or choose Cash on Delivery." }, { status: 502 });
    }
  } else {
    await db.insert(payments).values({
      orderId: order.id,
      provider: isOnline ? "demo" : "cod",
      amount: totals.total,
      status: isOnline ? "paid" : "pending",
    });
    // Notify immediately for COD/demo flows
    void sendOrderEmails({ ...order, items: lineItems, paymentStatus: order.paymentStatus });
    void sendOrderSms(phone, orderCode, totals.total);
  }

  return Response.json(
    {
      order: { id: order.id, orderCode: order.orderCode, total: order.total, paymentStatus: order.paymentStatus },
      razorpay,
    },
    { status: 201 },
  );
}
