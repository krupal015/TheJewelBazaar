import { LayoutDashboard, Package2, Truck, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package2 },
  { to: "/admin/orders", label: "Orders", icon: Truck },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  return (
    <div className="container-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass-panel p-5">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold">Admin Control</p>
          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                    isActive ? "bg-gold text-base" : "text-pearl/80 hover:bg-white/5 hover:text-pearl"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default AdminLayout;
