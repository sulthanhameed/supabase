import { MenuClient } from "./menu-client";
import { getCategories, getProducts } from "@/lib/data";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu — Khang Chinese Restaurant & Dimsum" };

export default async function MenuPage() {
  let products: ProductDTO[] = [];
  let categories: CategoryDTO[] = [];
  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
  } catch (err) {
    console.error(err);
  }
  return (
    <div className="page-enter">
      <Suspense fallback={<div className="h-screen" />}>
        <MenuClient initialProducts={products} categories={categories} />
      </Suspense>
    </div>
  );
}
