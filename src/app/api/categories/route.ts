import { listCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listCategories();
    return Response.json({ categories: data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
