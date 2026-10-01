import { getOrderByCode } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const order = await getOrderByCode(decodeURIComponent(code).trim());
  if (!order) return Response.json({ error: "Order not found. Please check your Order ID." }, { status: 404 });
  return Response.json({ order });
}
