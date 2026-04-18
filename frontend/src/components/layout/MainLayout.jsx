import { Heart, LogOut, Menu, Search, ShoppingBag, User2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useCartStore, useWishlistStore } from "../../store/store";
import { formatCurrency } from "../../utils/helpers";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const profilePanelRef = useRef(null);
  const searchPanelRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartSummary = useCartStore((state) => state.cartSummary);
  const totals = cartSummary();
  const isAdmin = user?.role === "ADMIN";
  const navLinks = [
    { label: "Home", type: "route", to: "/" },
    { label: "Collections", type: "section", sectionId: "catalog-section" },
    { label: "About Us", type: "route", to: "/about" },
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
    setProfileOpen(false);
    navigate("/", { replace: true });
  };

  const handleRouteClick = (to) => {
    setMobileOpen(false);
    setProfileOpen(false);
    navigate(to);
  };

  const profilePath = isAdmin ? "/admin/dashboard" : "/orders";

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  useEffect(() => {
    const currentSearch = new URLSearchParams(location.search).get("search") || "";
    setSearchValue(currentSearch);
  }, [location.search]);

  useEffect(() => {
    if (!profileOpen && !searchOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!profilePanelRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }

      if (!searchPanelRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [profileOpen, searchOpen]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setProfileMessage("");
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      setProfileMessage("Profile updated successfully.");
    } catch {
      // Store error is shown inside the profile panel.
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmedSearch = searchValue.trim();
    const nextSearch = new URLSearchParams(location.search);

    if (trimmedSearch) {
      nextSearch.set("search", trimmedSearch);
    } else {
      nextSearch.delete("search");
    }

    setMobileOpen(false);

    navigate({
      pathname: "/",
      search: nextSearch.toString() ? `?${nextSearch.toString()}` : "",
    }, {
      state: { scrollTo: "catalog-section" },
    });
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchOpen(false);
    setMobileOpen(false);
    navigate("/", { state: { scrollTo: "catalog-section" } });
  };

  const renderProfileCard = (compact = false) =>
    user ? (
      <div
        className={`${
          compact ? "mt-4 border border-black/10 bg-white p-4" : "absolute right-0 top-[calc(100%+14px)] w-[340px] border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(23,23,23,0.12)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-smoke">User Profile</p>
            <p className="mt-2 font-display text-2xl leading-none text-black">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={() => handleRouteClick(profilePath)}
            className="rounded-full border border-black/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-panel"
          >
            {isAdmin ? "Dashboard" : "Orders"}
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleProfileSubmit}>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke">Username</span>
            <input
              name="name"
              value={profileForm.name}
              onChange={handleProfileFieldChange}
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:bg-panel"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke">Email ID</span>
            <input
              name="email"
              value={profileForm.email}
              readOnly
              disabled
              className="w-full border border-black/10 bg-panel px-4 py-3 text-sm text-black/65 outline-none"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke">Mobile Number</span>
            <input
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileFieldChange}
              placeholder="Optional mobile number"
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:bg-panel"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-smoke">Address</span>
            <textarea
              name="address"
              rows="3"
              value={profileForm.address}
              onChange={handleProfileFieldChange}
              placeholder="Optional address"
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:bg-panel"
            />
          </label>

          {error ? <p className="border border-black/10 bg-panel px-4 py-3 text-sm text-black">{error}</p> : null}
          {profileMessage ? <p className="border border-black/10 bg-white px-4 py-3 text-sm text-black">{profileMessage}</p> : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-black bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/65 transition-colors hover:text-black"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </form>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-base text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f8f4ef]/95 text-black backdrop-blur">
        <div className="container-shell py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="shrink-0 text-left font-display text-2xl tracking-[0.14em] text-black sm:text-3xl">
              JEWEL BAZAAR
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center px-6 lg:flex">
              <nav className="flex min-w-0 items-center gap-10 overflow-x-auto">
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
            </div>

            <div className="hidden items-center gap-5 lg:flex">
              <div className="relative" ref={searchPanelRef}>
                <form
                  onSubmit={submitSearch}
                  className={`flex items-center overflow-hidden rounded-full border border-black/15 bg-white transition-all duration-300 ${
                    searchOpen ? "w-[320px] pl-4 pr-2" : "w-auto px-4"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-black"
                    aria-label="Open search"
                  >
                    <Search size={17} />
                    {!searchOpen ? <span>Search</span> : null}
                  </button>

                  {searchOpen ? (
                    <>
                      <input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search jewellery"
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-black outline-none placeholder:text-black/45"
                        autoFocus
                      />
                      {searchValue ? (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-panel hover:text-black"
                          aria-label="Clear search"
                        >
                          <X size={15} />
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </form>
              </div>

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
                <div className="relative" ref={profilePanelRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMessage("");
                      setProfileOpen((value) => !value);
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-black transition-colors hover:bg-panel"
                    aria-label="Open user profile"
                  >
                    <User2 size={18} />
                  </button>
                  {profileOpen ? renderProfileCard() : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-white"
                >
                  Sign In
                </button>
              )}
            </div>

            <button type="button" className="text-black lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              <Menu size={20} />
            </button>
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
                  <form
                    onSubmit={submitSearch}
                    className="flex min-w-0 flex-1 items-center rounded-full border border-black/15 bg-white px-4"
                  >
                    <Search size={17} className="shrink-0 text-black" />
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search"
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-black outline-none placeholder:text-black/45"
                    />
                    {searchValue ? (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black/55"
                        aria-label="Clear search"
                      >
                        <X size={15} />
                      </button>
                    ) : null}
                  </form>
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
                      Sign In
                    </button>
                  )}
                </div>
                {user ? renderProfileCard(true) : null}
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
