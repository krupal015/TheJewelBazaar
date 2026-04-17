import { useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import { useProductStore } from "../../store/store";
import { useOrderStore } from "../../store/store";
import { formatCurrency, getApiMessage } from "../../utils/helpers";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

function Orders() {
  const adminOrders = useOrderStore((state) => state.adminOrders);
  const fetchAdminDashboard = useOrderStore((state) => state.fetchAdminDashboard);
  const updateAdminOrderStatus = useOrderStore((state) => state.updateAdminOrderStatus);
  const categories = useProductStore((state) => state.categories);
  const fetchCategories = useProductStore((state) => state.fetchCategories);
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setMessage("");
        await Promise.all([fetchAdminDashboard(), fetchCategories()]);
      } catch (error) {
        setMessage(getApiMessage(error, "Unable to load admin orders"));
      }
    };

    loadOrders();
  }, [fetchAdminDashboard, fetchCategories]);

  const materialOptions = useMemo(
    () =>
      [...new Set(
        adminOrders.flatMap((order) =>
          order.items.map((item) => item.product?.metalType?.trim()).filter(Boolean),
        ),
      )].sort((first, second) => first.localeCompare(second)),
    [adminOrders],
  );

  const filteredOrders = useMemo(
    () =>
      adminOrders.filter((order) => {
        const matchesCategory = !categoryFilter
          || order.items.some((item) => item.product?.category?._id === categoryFilter);
        const matchesMaterial = !materialFilter
          || order.items.some((item) => item.product?.metalType === materialFilter);

        return matchesCategory && matchesMaterial;
      }),
    [adminOrders, categoryFilter, materialFilter],
  );

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Admin Orders</p>
          <h1 className="mt-3 font-display text-4xl">Manage fulfilment and tracking</h1>
        </div>
      </div>

      {message ? <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</p> : null}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="min-w-[220px] rounded-full border border-white/10 bg-base px-4 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white"
        >
          <option value="">ALL CATEGORIES</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={materialFilter}
          onChange={(event) => setMaterialFilter(event.target.value)}
          className="min-w-[220px] rounded-full border border-white/10 bg-base px-4 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white"
        >
          <option value="">ALL MATERIALS</option>
          {materialOptions.map((material) => (
            <option key={material} value={material}>
              {material.toUpperCase()}
            </option>
          ))}
        </select>

        {(categoryFilter || materialFilter) ? (
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("");
              setMaterialFilter("");
            }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:text-white"
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      <div className="mt-8 space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="rounded-[28px] border border-white/10 p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-lg font-semibold">{order.user?.name || "Customer"}</p>
                <p className="text-sm text-smoke">{order.user?.email}</p>
                <p className="mt-2 text-sm text-smoke">
                  {order._id} • {order.items.length} items • {formatCurrency(order.totalPrice)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  defaultValue={order.orderStatus}
                  onChange={async (event) => {
                    try {
                      await updateAdminOrderStatus(order._id, { orderStatus: event.target.value });
                      await fetchAdminDashboard();
                      setMessage("Tracking status updated.");
                    } catch (error) {
                      setMessage(getApiMessage(error, "Unable to update order"));
                    }
                  }}
                  className="rounded-full border border-white/10 bg-base px-4 py-3 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button variant="ghost">{order.paymentStatus}</Button>
              </div>
            </div>
          </div>
        ))}

        {!filteredOrders.length ? (
          <div className="rounded-[28px] border border-dashed border-white/10 px-6 py-12 text-center text-sm text-smoke">
            No orders matched the selected category or material.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Orders;
