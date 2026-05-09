"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Product, Category } from "@/app/types/product";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useVoiceCommands } from "@/app/hooks/useVoiceCommands";
import { fetchCategories, fetchProducts, fetchProductsByCategory, searchProducts } from "@/app/helpers/api";
import ProductCard, { CARD_HEIGHT } from "@/app/components/ProductCard";
import ProductModal from "@/app/components/ProductModal";
import CartButton from "@/app/components/CartButton";
import SearchBar from "@/app/components/SearchBar";
import VoiceControl from "@/app/components/VoiceControl";
import { useCartStore } from "@/app/store/cartStore";

const MIN_CARD_WIDTH = 140;
const MAX_CARD_WIDTH = 200;
const GAP = 16;
const ROW_HEIGHT = CARD_HEIGHT + GAP;
const BATCH_SIZE = 20;

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
}

export default function ProductCatalog({
  initialProducts,
  total,
}: {
  initialProducts: Product[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [columns, setColumns] = useState(4);
  const [containerWidth, setContainerWidth] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addToCart = useCartStore((s) => s.addToCart);

  const displayedProducts = filteredProducts ?? products;
  const isFiltered = filteredProducts !== null;
  const hasMore = !isFiltered && products.length < total;

  // Voice command handlers
  const voice = useVoiceCommands({
    products: displayedProducts,
    onSearch: (q: string) => {
      setSelectedCategory(null);
      setQuery(q);
    },
    onSelect: (product: Product) => {
      setSelectedProduct(product);
    },
    onAddToCart: (product: Product) => {
      addToCart(product);
    },
    onClear: () => {
      setQuery("");
      setSelectedCategory(null);
      setFilteredProducts(null);
    },
    onScrollDown: () => {
      parentRef.current?.scrollBy({ top: 400, behavior: "smooth" });
    },
    onScrollUp: () => {
      parentRef.current?.scrollBy({ top: -400, behavior: "smooth" });
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch products: by category OR by search query
  useEffect(() => {
    if (selectedCategory) {
      let cancelled = false;
      setSearching(true);
      fetchProductsByCategory(selectedCategory.slug)
        .then((products) => { if (!cancelled) setFilteredProducts(products); })
        .finally(() => { if (!cancelled) setSearching(false); });
      return () => { cancelled = true; };
    }

    const q = debouncedQuery.trim();
    if (!q) {
      setFilteredProducts(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchProducts(q)
      .then((data) => {
        if (!cancelled) {
          setFilteredProducts(data.products);
        }
      })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedCategory]);

  // Reset scroll position when filtered results change
  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0 });
  }, [filteredProducts]);

  // Select a category from typeahead
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setQuery(cat.name);
  };

  // Clear everything
  const handleClear = () => {
    setQuery("");
    setSelectedCategory(null);
    setFilteredProducts(null);
  };

  // Input change resets category selection
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedCategory(null);
  };

  // Resize observer
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = (width: number) => {
      setContainerWidth(width);
      const cols = Math.max(1, Math.min(4, Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP))));
      setColumns(cols);
    };
    const ro = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    ro.observe(el);
    update(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const cardWidth =
    containerWidth > 0
      ? Math.min(MAX_CARD_WIDTH, (containerWidth - (columns - 1) * GAP) / columns)
      : MAX_CARD_WIDTH;

  const rows = chunk(displayedProducts, columns);

  const virtualizer = useVirtualizer({
    count: hasMore ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 2,
  });

  // Infinite scroll fetch
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newProducts = await fetchProducts(BATCH_SIZE, products.length);
      setProducts((prev) => [...prev, ...newProducts]);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, products.length]);

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastVirtualItem) return;
    if (lastVirtualItem.index >= rows.length - 1 && hasMore && !loading) {
      fetchMore();
    }
  }, [lastVirtualItem, rows.length, hasMore, loading, fetchMore]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 border-b border-gray-100 sm:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to QuickShop</h1>
          <div className="flex flex-1 justify-end">
            <CartButton />
          </div>
        </div>

        <SearchBar
          query={query}
          debouncedQuery={debouncedQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          searching={searching}
          onQueryChange={handleInputChange}
          onSelectCategory={handleSelectCategory}
          onClear={handleClear}
        />

        {/* Voice Controls */}
        <div className="flex items-center justify-between">
          <VoiceControl
            isListening={voice.isListening}
            transcript={voice.transcript}
            lastCommand={voice.lastCommand}
            supported={voice.browserSupportsSpeechRecognition}
            onStart={voice.startListening}
            onStop={voice.stopListening}
          />
        </div>
      </div>

      {/* Virtualized scroll container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        style={{ scrollbarGutter: "stable" }}
      >
        {isFiltered && filteredProducts?.length === 0 && !searching ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium text-gray-700">No results found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different search term</p>
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isSentinel = virtualRow.index >= rows.length;
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: GAP,
                  }}
                >
                  {isSentinel ? (
                    <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                      {loading ? "Loading more products…" : null}
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: GAP, justifyContent: "center" }}>
                      {rows[virtualRow.index].map((product) => (
                        <div key={product.id} style={{ flex: "0 0 auto", width: cardWidth }}>
                          <ProductCard product={product} onClick={setSelectedProduct} />
                        </div>
                      ))}
                      {Array.from({ length: columns - rows[virtualRow.index].length }).map((_, i) => (
                        <div key={`spacer-${i}`} style={{ flex: "0 0 auto", width: cardWidth }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}
