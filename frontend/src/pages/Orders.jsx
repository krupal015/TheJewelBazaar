import { useEffect } from "react";
import { useOrderStore } from "../store/store";
import { formatCurrency } from "../utils/helpers";

function Orders() {
  const orders = useOrderStore((state) => state.orders);
  const loading = useOrderStore((state) => state.loading);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <section className="container-shell py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Order History</p>
        <h1 className="mt-4 font-display text-4xl">Your purchases</h1>
      </div>

      {loading ? (
        <div className="text-smoke">Loading orders...</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="glass-panel p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-smoke">Order ID</p>
                  <p className="mt-2 text-lg font-semibold text-pearl">{order._id}</p>
                  <p className="mt-2 text-sm text-smoke">
                    {order.items.length} items • {formatCurrency(order.totalPrice)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!orders.length ? <div className="text-smoke">No orders yet.</div> : null}
        </div>
      )}
    </section>
  );
}

export default Orders;
