import { NextRequest } from "next/server";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const data = await listProducts({
      category: sp.get("category") ?? undefined,
      featured: sp.get("featured") === "true",
      search: sp.get("q") ?? undefined,
    });
    if (sp.get("random") === "true") {
      const pick = data[Math.floor(Math.random() * data.length)];
      return Response.json({ product: pick });
    }
    return Response.json({ products: data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load products" }, { status: 500 });
  }
}
