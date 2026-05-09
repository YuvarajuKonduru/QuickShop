import type { Product, Category } from "@/app/types/product";

const BASE_URL = "https://dummyjson.com";
const PRODUCT_FIELDS = "id,title,description,thumbnail,price,category,rating";

export async function fetchInitialProducts(): Promise<{
  products: Product[];
  total: number;
}> {
  const res = await fetch(
    `${BASE_URL}/products?limit=20&skip=0&select=${PRODUCT_FIELDS}`,
    { cache: "no-store" }
  );
  if (!res.ok) return { products: [], total: 0 };
  const data = await res.json();
  return { products: data.products as Product[], total: data.total as number };
}

export async function fetchProducts(
  limit: number,
  skip: number
): Promise<Product[]> {
  const res = await fetch(
    `${BASE_URL}/products?limit=${limit}&skip=${skip}&select=${PRODUCT_FIELDS}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.products as Product[];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/products/categories`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchProductsByCategory(
  slug: string
): Promise<Product[]> {
  const res = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(slug)}?select=${PRODUCT_FIELDS}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.products as Product[];
}

export async function searchProducts(
  query: string
): Promise<{ products: Product[]; total: number }> {
  const res = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&select=${PRODUCT_FIELDS}`
  );
  if (!res.ok) return { products: [], total: 0 };
  const data = await res.json();
  return { products: data.products as Product[], total: data.total as number };
}
