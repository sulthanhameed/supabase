/**
 * Server-side data access for the FRONTEND.
 *
 * When NEXT_PUBLIC_API_URL is set (frontend hosted on Vercel, backend on Render),
 * every read goes over REST to the Express backend — the frontend never touches
 * the database. When it's empty (single all-in-one deployment / local preview),
 * we read straight from Postgres via the built-in queries.
 */
import type { CategoryDTO, OrderDTO, ProductDTO } from "@/lib/types";
import { USE_REMOTE_BACKEND, apiUrl } from "@/config/backend";

export const usesRemoteApi = USE_REMOTE_BACKEND;

async function remote<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getProducts(opts: { category?: string; featured?: boolean } = {}): Promise<ProductDTO[]> {
  if (usesRemoteApi) {
    const sp = new URLSearchParams();
    if (opts.category) sp.set("category", opts.category);
    if (opts.featured) sp.set("featured", "true");
    const { products } = await remote<{ products: ProductDTO[] }>(`/products${sp.size ? `?${sp}` : ""}`);
    return products;
  }
  const { listProducts } = await import("@/lib/queries");
  return listProducts(opts);
}

export async function getCategories(): Promise<CategoryDTO[]> {
  if (usesRemoteApi) {
    const { categories } = await remote<{ categories: CategoryDTO[] }>("/categories");
    return categories;
  }
  const { listCategories } = await import("@/lib/queries");
  return listCategories();
}

export async function getOrder(code: string): Promise<OrderDTO | null> {
  if (usesRemoteApi) {
    try {
      const { order } = await remote<{ order: OrderDTO }>(`/orders/${encodeURIComponent(code)}`);
      return order;
    } catch {
      return null;
    }
  }
  const { getOrderByCode } = await import("@/lib/queries");
  return getOrderByCode(code);
}
