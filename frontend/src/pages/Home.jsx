import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useProductStore } from "../store/store";
import { getConfiguredCategories, MATERIAL_OPTIONS } from "../utils/catalog";
import Slider from "../components/slider.jsx";

function Home() {
  const location = useLocation();
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const categories = useProductStore((state) => state.categories);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchCategories = useProductStore((state) => state.fetchCategories);
  const searchQuery = useMemo(
    () => new URLSearchParams(location.search).get("search")?.trim() || "",
    [location.search],
  );
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    order: "desc",
    maxPrice: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const displayCategories = useMemo(() => getConfiguredCategories(categories), [categories]);

  useEffect(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      order: filters.order,
    };
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (searchQuery) params.search = searchQuery;
    fetchProducts(params);
    fetchCategories();
  }, [fetchProducts, fetchCategories, filters, searchQuery]);

  useEffect(() => {
    const targetId = location.state?.scrollTo || (location.state?.focusCatalog ? "catalog-section" : "");

    if (!targetId) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.state]);

  const collectionProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = !categoryFilter || [product.category?._id, product.category?.slug, product.category?.name]
          .filter(Boolean)
          .some((value) => String(value).trim().toLowerCase() === categoryFilter);

        const matchesMaterial = !materialFilter
          || String(product.metalType || "").trim().toLowerCase() === materialFilter;

        return matchesCategory && matchesMaterial;
      });
  }, [categoryFilter, materialFilter, products]);
  const updates = useMemo(() => products.slice(6, 9), [products]);
  const clearCollectionFilters = () => {
    setMaterialFilter("");
    setFilters({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      order: "desc",
      maxPrice: "",
    });
    setCategoryFilter("");
  };

  return (
    <div className="bg-base pb-16 text-black">
      <Slider />

      <section id="catalog-section" className="container-shell py-8">
        <div className="rounded-[34px] border border-black/10 bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_16px_40px_rgba(23,23,23,0.05)] backdrop-blur md:p-7">
          <div className="flex flex-col gap-6 border-b border-black/10 pb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">Collections</p>
                <h2 className="mt-3 font-display text-5xl leading-none md:text-6xl">Curated for modern heirloom energy.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-smoke md:text-base">
                {searchQuery
                  ? `Showing results for "${searchQuery}" with your current collection filters.`
                  : "A softer catalogue rail with boutique-inspired filters, rounded cards, and cleaner browsing rhythm."}
              </p>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-smoke">
                  <SlidersHorizontal size={15} />
                  Filters:
                </span>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="min-w-[220px] rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-black outline-none transition-colors hover:border-black/25"
                >
                  <option value="">ALL CATEGORIES</option>
                  {displayCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={materialFilter}
                  onChange={(event) => setMaterialFilter(event.target.value)}
                  className="min-w-[220px] rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-black outline-none transition-colors hover:border-black/25"
                >
                  <option value="">ALL MATERIALS</option>
                  {MATERIAL_OPTIONS.map((material) => (
                    <option key={material} value={material}>
                      {material.toUpperCase()}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value, page: 1 }))}
                  className="min-w-[180px] rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-black outline-none placeholder:text-smoke transition-colors hover:border-black/25"
                />

                <button
                  type="button"
                  onClick={clearCollectionFilters}
                  className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-smoke transition-colors hover:text-black"
                >
                  Clear Filters
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">Sort:</span>
                <select
                  value={`${filters.sortBy}:${filters.order}`}
                  onChange={(event) => {
                    const [sortBy, order] = event.target.value.split(":");
                    setFilters((prev) => ({ ...prev, sortBy, order, page: 1 }));
                  }}
                  className="min-w-[220px] rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-black outline-none transition-colors hover:border-black/25"
                >
                  <option value="createdAt:desc">Featured</option>
                  <option value="price:asc">Price low-high</option>
                  <option value="price:desc">Price high-low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {loading ? (
              <div className="rounded-[28px] border border-black/10 bg-white py-16 text-center text-smoke">
                Loading products...
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {collectionProducts.map((product) => (
                  <ProductCard key={product._id} product={product} variant="collection" />
                ))}
              </div>
            )}

            {!loading && !collectionProducts.length ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-black/20 bg-white px-6 py-12 text-center text-smoke">
                No pieces matched these filters. Try clearing them to see the full collection again.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="about-section" className="container-shell py-8">
        <div className="grid border border-black bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-black p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">About Us</p>
            <h2 className="mt-4 font-display text-5xl leading-none">Designed for modern jewellery shopping.</h2>
          </div>
          <div className="p-8 text-sm leading-8 text-smoke md:text-base">
            The Jewel Bazzar brings bridal classics, daily-wear pieces, and signature collections into one refined
            space. We focus on a simple shopping journey, clear product details, and a premium storefront experience.
          </div>
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="mb-8 flex items-center justify-between border-b border-black pb-4">
          <h2 className="font-display text-5xl">Journal</h2>
          <Link to="/tracking" className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke hover:text-black">
            View tracking
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {updates.map((product) => (
            <article key={product._id} className="border border-black bg-white">
              <img
                src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1200&q=80"}
                alt={product.name}
                className="h-80 w-full object-cover"
              />
              <div className="border-t border-black p-5">
                <h3 className="font-display text-3xl">{product.name}</h3>
                <p className="mt-2 text-sm leading-7 text-smoke">{product.description}</p>
              </div>
            </article>
          ))}
          {!updates.length ? (
            <div className="border border-dashed border-black p-10 text-sm text-smoke lg:col-span-3">
              Add more products to populate the editorial section.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default Home;
