import ProductCatalog from "./ProductCatalog";
import { fetchInitialProducts } from "@/app/helpers/api";

export default async function ProductsPage() {
  const { products, total } = await fetchInitialProducts();
  return <ProductCatalog initialProducts={products} total={total} />;
}