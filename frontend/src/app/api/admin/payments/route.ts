import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const rows = await db
    .select({
      id: payments.id,
      orderCode: orders.orderCode,
      customerName: orders.customerName,
      provider: payments.provider,
      providerOrderId: payments.providerOrderId,
      providerPaymentId: payments.providerPaymentId,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .orderBy(desc(payments.createdAt));
  return Response.json({ payments: rows });
}
