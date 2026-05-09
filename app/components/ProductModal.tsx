"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Product } from "@/app/types/product";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm backdrop-blur transition hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Image */}
        <div className="flex items-center justify-center bg-slate-50 p-6" style={{ height: 220 }}>
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={180}
            height={180}
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Details */}
        <div className="space-y-3 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-500">
            {product.category}
          </p>
          <h2 className="text-lg font-bold text-gray-900">{product.title}</h2>
          <p className="text-sm leading-relaxed text-gray-500">{product.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95 cursor-pointer"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
