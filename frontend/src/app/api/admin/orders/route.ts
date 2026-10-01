import { requireAdmin } from "@/lib/auth";
import { listAllOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ orders: await listAllOrders() });
}
