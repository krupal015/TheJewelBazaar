import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/common/Button";
import SectionHeading from "../components/common/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import { useCartStore, useProductStore, useWishlistStore } from "../store/store";
import { formatCurrency, placeholderImage } from "../utils/helpers";

function ProductDetails() {
  const { productId } = useParams();
  const selectedProduct = useProductStore((state) => state.selectedProduct);
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const fetchProduct = useProductStore((state) => state.fetchProduct);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct(productId);
    fetchProducts({ limit: 4, sortBy: "createdAt", order: "desc" });
  }, [fetchProduct, fetchProducts, productId]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedProduct?._id]);

  if (loading && !selectedProduct) {
    return <div className="container-shell py-24 text-center text-smoke">Loading product details...</div>;
  }

  if (!selectedProduct) {
    return <div className="container-shell py-24 text-center text-smoke">Product not found.</div>;
  }

  const images = selectedProduct.images?.length ? selectedProduct.images : [{ url: placeholderImage }];
  const wishlisted = isWishlisted(selectedProduct._id);

  return (
    <section className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
            <img src={images[activeImage]?.url} alt={selectedProduct.name} className="aspect-[4/4.3] w-full object-cover" />
            {images.length > 1 ? (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 rounded-full border border-white/10 bg-base/70 p-3"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 rounded-full border border-white/10 bg-base/70 p-3"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`overflow-hidden rounded-2xl border ${index === activeImage ? "border-gold" : "border-white/10"}`}
              >
                <img src={image.url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">{selectedProduct.category?.name}</p>
          <h1 className="mt-4 font-display text-5xl">{selectedProduct.name}</h1>
          <p className="mt-6 text-base leading-8 text-smoke">{selectedProduct.description}</p>

          <div className="mt-8 flex items-end gap-3">
            <span className="text-3xl font-semibold text-gold">
              {formatCurrency(selectedProduct.discountPrice || selectedProduct.price)}
            </span>
            {selectedProduct.discountPrice ? (
              <span className="pb-1 text-sm text-smoke line-through">{formatCurrency(selectedProduct.price)}</span>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-smoke">Metal</p>
              <p className="mt-2 font-semibold">{selectedProduct.metalType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-smoke">SKU</p>
              <p className="mt-2 font-semibold">{selectedProduct.sku}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-smoke">Stock</p>
              <p className="mt-2 font-semibold">{selectedProduct.stock} pieces</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="gap-2" onClick={() => addItem(selectedProduct, 1)}>
              <ShoppingBag size={16} />
              Add to cart
            </Button>
            <Button variant="secondary" className="gap-2" onClick={() => toggleWishlist(selectedProduct)}>
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Remove Wishlist" : "Add Wishlist"}
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16">
        <SectionHeading title="More pieces you may love" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products
            .filter((product) => product._id !== selectedProduct._id)
            .slice(0, 4)
            .map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
