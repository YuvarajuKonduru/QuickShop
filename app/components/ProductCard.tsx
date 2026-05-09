import Image from "next/image";
import type { Product } from "@/app/types/product";

const CARD_HEIGHT = 280;
const IMAGE_HEIGHT = 150;

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+";

export { CARD_HEIGHT };

export default function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick?: (product: Product) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(product);
        }
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md cursor-pointer"
      style={{ height: CARD_HEIGHT }}
    >
      <div
        className="flex shrink-0 items-center justify-center bg-slate-50"
        style={{ height: IMAGE_HEIGHT }}
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={110}
          height={110}
          unoptimized
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-amber-500">
            {product.category}
          </p>
          <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
            {product.title}
          </h2>
        </div>
        <p className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
