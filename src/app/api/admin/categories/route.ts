import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ categories: await listCategories() });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.image) return Response.json({ error: "name and image are required" }, { status: 400 });
  const slug = String(b.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [row] = await db
    .insert(categories)
    .values({
      name: String(b.name),
      slug,
      emoji: String(b.emoji ?? "🍜"),
      image: String(b.image),
      description: b.description ? String(b.description) : null,
      sortOrder: Number(b.sortOrder ?? 99),
    })
    .returning();
  return Response.json({ category: row }, { status: 201 });
}
