import { Heart, Menu, ShoppingBag, User2 } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useCartStore, useWishlistStore } from "../../store/store";
import { formatCurrency } from "../../utils/helpers";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartSummary = useCartStore((state) => state.cartSummary);
  const totals = cartSummary();
  const isAdmin = user?.role === "ADMIN";
  const navLinks = [
    { label: "Home", type: "route", to: "/" },
    { label: "Collections", type: "section", sectionId: "catalog-section" },
    { label: "About Us", type: "section", sectionId: "about-section" },
    { label: "Orders", type: "route", to: "/orders" },
  ];

  const navigateToSection = (sectionId) => {
    setMobileOpen(false);

    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate("/", { state: { scrollTo: sectionId } });
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const handleRouteClick = (to) => {
    setMobileOpen(false);
    navigate(to);
  };

  const profilePath = isAdmin ? "/admin/dashboard" : "/orders";

  return (
    <div className="min-h-screen bg-base text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f8f4ef]/95 text-black backdrop-blur">
        <div className="container-shell py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0 font-display text-2xl tracking-[0.14em] text-black sm:text-3xl">
              JEWEL BAZAAR
            </Link>
            <button type="button" className="ml-auto text-black lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              <Menu size={20} />
            </button>

            <div className="hidden min-w-0 flex-1 items-center gap-6 lg:flex">
              <nav className="flex min-w-0 flex-1 items-center gap-10 overflow-x-auto pr-6">
                {navLinks.map((link) =>
                  link.type === "route" ? (
                    <NavLink
                      key={link.label}
                      to={link.to}
                      className={({ isActive }) =>
                        `border-b pb-2 text-xs font-semibold uppercase tracking-[0.28em] ${
                          isActive ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
                        }`
                      }
                      end={link.to === "/"}
                    >
                      {link.label}
                    </NavLink>
                  ) : (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => navigateToSection(link.sectionId)}
                      className="border-b border-transparent pb-2 text-xs font-semibold uppercase tracking-[0.28em] text-black/60 transition-colors hover:text-black"
                    >
                      {link.label}
                    </button>
                  ),
                )}
              </nav>

              <div className="flex items-center gap-5 border-l border-black/15 pl-6">
                <button
                  type="button"
                  onClick={() => navigate("/wishlist")}
                  className="relative text-black transition-colors hover:text-black/70"
                  aria-label="Open wishlist"
                >
                  <Heart size={19} />
                  {wishlistItems.length ? (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                      {wishlistItems.length}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="relative text-black transition-colors hover:text-black/70"
                  aria-label="Open cart"
                >
                  <ShoppingBag size={19} />
                  {items.length ? (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                      {items.length}
                    </span>
                  ) : null}
                </button>

                {user ? (
                  <button
                    type="button"
                    onClick={() => navigate(profilePath)}
                    className="text-black transition-colors hover:text-black/70"
                    aria-label="Open account"
                  >
                    <User2 size={19} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-white"
                  >
                    Login / Register
                  </button>
                )}

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55 transition-colors hover:text-black"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {mobileOpen ? (
            <div className="mt-4 border-t border-black/10 pt-4 lg:hidden">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) =>
                  link.type === "route" ? (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => handleRouteClick(link.to)}
                      className="text-left text-xs font-semibold uppercase tracking-[0.28em] text-black/70"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => navigateToSection(link.sectionId)}
                      className="text-left text-xs font-semibold uppercase tracking-[0.28em] text-black/70"
                    >
                      {link.label}
                    </button>
                  ),
                )}

                <div className="mt-2 flex items-center gap-5">
                  <button type="button" onClick={() => handleRouteClick("/wishlist")} className="relative text-black" aria-label="Open wishlist">
                    <Heart size={19} />
                    {wishlistItems.length ? (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                        {wishlistItems.length}
                      </span>
                    ) : null}
                  </button>
                  <button type="button" onClick={() => handleRouteClick("/cart")} className="relative text-black" aria-label="Open cart">
                    <ShoppingBag size={19} />
                    {items.length ? (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                        {items.length}
                      </span>
                    ) : null}
                  </button>
                  {user ? (
                    <button type="button" onClick={() => handleRouteClick(profilePath)} className="text-black" aria-label="Open account">
                      <User2 size={19} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRouteClick("/login")}
                      className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black"
                    >
                      Login / Register
                    </button>
                  )}
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55"
                    >
                      Logout
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-black bg-white py-8 text-black">
        <div className="container-shell flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-display text-2xl">The Jewel Bazzar</p>
          <p className="uppercase tracking-[0.16em] text-smoke">
            Cart total: <span className="text-black">{formatCurrency(totals.total)}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
