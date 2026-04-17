import { Link } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useWishlistStore } from "../store/store";

function Wishlist() {
  const items = useWishlistStore((state) => state.items);

  return (
    <section className="container-shell py-12">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Wishlist</p>
          <h1 className="mt-4 font-display text-4xl">Saved pieces you love</h1>
        </div>
        <p className="text-sm text-smoke">{items.length} items</p>
      </div>

      {!items.length ? (
        <div className="glass-panel p-12 text-center">
          <p className="font-display text-3xl">Your wishlist is empty</p>
          <p className="mt-4 text-sm text-smoke">Tap the heart icon on any product to save it here.</p>
          <Link to="/" className="mt-8 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-base">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} variant="collection" />
          ))}
        </div>
      )}
    </section>
  );
}

export default Wishlist;
