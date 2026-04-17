import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import CartItemRow from "../components/cart/CartItemRow";
import { useAuthStore, useCartStore } from "../store/store";
import { formatCurrency } from "../utils/helpers";

function Cart() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const syncing = useCartStore((state) => state.syncing);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const cartSummary = useCartStore((state) => state.cartSummary);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totals = cartSummary();

  useEffect(() => {
    fetchCart().catch(() => {
      // Cart error is already stored for the UI.
    });
  }, [fetchCart, user?.id]);

  return (
    <section className="container-shell py-12">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Cart</p>
          <h1 className="mt-4 font-display text-4xl">Your selected jewellery</h1>
        </div>
        <p className="text-sm text-smoke">{items.length} items</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {syncing && !items.length ? (
        <div className="glass-panel p-12 text-center">
          <p className="font-display text-3xl">Loading your cart</p>
        </div>
      ) : null}

      {!syncing && !items.length ? (
        <div className="glass-panel p-12 text-center">
          <p className="font-display text-3xl">Your cart is empty</p>
          <p className="mt-4 text-sm text-smoke">Browse the featured collection and add a few pieces to continue.</p>
          <Link to="/" className="mt-8 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-base">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} onUpdate={updateQuantity} onRemove={removeItem} />
            ))}
          </div>

          <aside className="glass-panel h-fit p-6">
            <h2 className="font-display text-3xl">Order summary</h2>
            <div className="mt-8 space-y-4 text-sm text-smoke">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-pearl">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="text-pearl">{formatCurrency(totals.shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span className="text-pearl">{formatCurrency(totals.tax)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-smoke">Total</span>
                <span className="text-2xl font-semibold text-gold">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <Button className="mt-8 w-full" onClick={() => navigate("/checkout")}>
              Proceed to checkout
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
