import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ products: await listProducts() });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.price || !b?.categoryId || !b?.image) {
    return Response.json({ error: "name, price, categoryId and image are required" }, { status: 400 });
  }
  const [row] = await db
    .insert(products)
    .values({
      name: String(b.name),
      slug: `${slugify(String(b.name))}-${Date.now().toString(36)}`,
      description: String(b.description ?? ""),
      ingredients: String(b.ingredients ?? ""),
      price: Math.round(Number(b.price)),
      image: String(b.image),
      categoryId: Number(b.categoryId),
      rating: Number(b.rating ?? 4.5),
      reviewsCount: Number(b.reviewsCount ?? 0),
      isFeatured: Boolean(b.isFeatured),
      isVeg: Boolean(b.isVeg),
      isAvailable: b.isAvailable === undefined ? true : Boolean(b.isAvailable),
    })
    .returning();
  return Response.json({ product: row }, { status: 201 });
}
