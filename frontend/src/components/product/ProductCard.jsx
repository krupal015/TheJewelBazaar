import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { cn, formatCurrency, placeholderImage } from "../../utils/helpers";
import { useCartStore, useWishlistStore } from "../../store/store";

function ProductCard({ product, variant = "default" }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const badgeLabel = product.category?.name || product.metalType || "Jewellery";
  const wishlisted = isWishlisted(product._id);

  if (variant === "collection") {
    return (
      <article className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-4 text-black shadow-[0_14px_38px_rgba(23,23,23,0.08)] transition-transform duration-300 hover:-translate-y-1">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-7 top-7 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-sm transition-colors hover:bg-black hover:text-white"
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <Link to={`/products/${product._id}`} className="relative block overflow-hidden rounded-[28px] bg-[#f4efe7]">
          <span className="absolute left-4 top-4 z-10 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke shadow-sm">
            {badgeLabel}
          </span>
          <img
            src={product.images?.[0]?.url || placeholderImage}
            alt={product.name}
            className="aspect-[0.82] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </Link>

        <div className="flex min-h-[190px] flex-col justify-between px-1 pb-1 pt-5">
          <div>
            <Link to={`/products/${product._id}`} className="line-clamp-1 font-display text-[2.15rem] leading-none text-black">
              {product.name}
            </Link>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-smoke">
              {product.description}
            </p>

            <div className="mt-4 flex items-end gap-2">
              {product.discountPrice ? (
                <>
                  <span className="text-sm text-smoke line-through">{formatCurrency(product.price)}</span>
                  <span className="text-[1.6rem] font-semibold text-black">{formatCurrency(product.discountPrice)}</span>
                </>
              ) : (
                <span className="text-[1.6rem] font-semibold text-black">{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className="inline-flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black transition-colors duration-200 hover:bg-black hover:text-white"
            >
              <ShoppingBag size={16} />
              Add To Cart
            </button>
            <Link
              to={`/products/${product._id}`}
              aria-label={`View ${product.name}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/12 text-black transition-colors duration-200 hover:bg-panel"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("relative border border-black bg-white text-black", variant === "default" && "")}>
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-sm transition-colors hover:bg-black hover:text-white"
      >
        <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
      </button>
      <Link to={`/products/${product._id}`} className="block border-b border-black bg-panel p-4">
        <img
          src={product.images?.[0]?.url || placeholderImage}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover"
        />
      </Link>

      <div className="flex min-h-[250px] flex-col justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-smoke">{badgeLabel}</p>
          <Link to={`/products/${product._id}`} className="mt-3 block font-display text-3xl leading-none text-black">
            {product.name}
          </Link>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-smoke">{product.description}</p>
        </div>

        <div>
          <div className="mt-4 flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-sm text-smoke line-through">{formatCurrency(product.price)}</span>
                <span className="text-xl font-semibold text-black">{formatCurrency(product.discountPrice)}</span>
              </>
            ) : (
              <span className="text-xl font-semibold text-black">{formatCurrency(product.price)}</span>
            )}
          </div>
          <Button className="mt-4 w-full gap-2" onClick={() => addItem(product, 1)}>
            <ShoppingBag size={16} className="shrink-0" />
            <span className="whitespace-nowrap">Add to cart</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
