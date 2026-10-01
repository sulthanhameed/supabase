/**
 * Server-side data access for the FRONTEND.
 *
 * Normally (all-in-one Supabase deployment) NEXT_PUBLIC_API_URL is empty and
 * we read straight from the Supabase Postgres backend via the built-in
 * queries. When a URL is set, every read goes over REST to that separately
 * hosted API instead.
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
