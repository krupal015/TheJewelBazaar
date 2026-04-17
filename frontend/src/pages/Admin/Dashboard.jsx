import { BarChart3, ShoppingCart, Sparkles, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrderStore } from "../../store/store";
import { formatCurrency, getApiMessage } from "../../utils/helpers";

function Dashboard() {
  const dashboard = useOrderStore((state) => state.dashboard);
  const adminOrders = useOrderStore((state) => state.adminOrders);
  const users = useOrderStore((state) => state.users);
  const fetchAdminDashboard = useOrderStore((state) => state.fetchAdminDashboard);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setMessage("");
        await fetchAdminDashboard();
      } catch (error) {
        setMessage(getApiMessage(error, "Unable to load admin dashboard"));
      }
    };

    loadDashboard();
  }, [fetchAdminDashboard]);

  const cards = [
    ["Revenue", formatCurrency(dashboard?.totalSales || 0), BarChart3],
    ["Orders", String(dashboard?.totalOrders || adminOrders.length || 0), ShoppingCart],
    ["Customers", String(dashboard?.totalUsers || users.length || 0), Users2],
    ["Open Orders", String(dashboard?.pendingOrders || 0), Sparkles],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Admin Dashboard</p>
        <h1 className="mt-4 font-display text-4xl">Store health at a glance</h1>
      </div>

      {message ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</p> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="glass-panel p-6">
            <Icon className="text-gold" />
            <p className="mt-4 text-sm text-smoke">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="font-display text-3xl">Recent orders</h2>
          <div className="mt-6 space-y-4">
            {adminOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <div>
                  <p className="font-semibold">{order.user?.name || "Customer"}</p>
                  <p className="text-sm text-smoke">{order.orderStatus}</p>
                </div>
                <p className="text-sm font-semibold text-gold">{formatCurrency(order.totalPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-3xl">Customer snapshot</h2>
          <div className="mt-6 space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-smoke">{user.email}</p>
                </div>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
