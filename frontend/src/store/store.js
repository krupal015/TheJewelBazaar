import { create } from "zustand";
import { authService } from "../services/authService";
import { adminService } from "../services/adminService";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { getApiMessage } from "../utils/helpers";

const readCartStorage = () => {
  try {
    return JSON.parse(window.localStorage.getItem("tjb_guest_cart") || "[]");
  } catch {
    return [];
  }
};

const writeCartStorage = (items) => window.localStorage.setItem("tjb_guest_cart", JSON.stringify(items));

const readWishlistStorage = () => {
  try {
    return JSON.parse(window.localStorage.getItem("tjb_wishlist") || "[]");
  } catch {
    return [];
  }
};

const writeWishlistStorage = (items) =>
  window.localStorage.setItem("tjb_wishlist", JSON.stringify(items));

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: window.localStorage.getItem("tjb_access_token"),
  refreshToken: window.localStorage.getItem("tjb_refresh_token"),
  loading: false,
  initialized: false,
  error: "",
  resetError: () => set({ error: "" }),
  setTokens: (payload) => {
    window.localStorage.setItem("tjb_access_token", payload.accessToken);
    window.localStorage.setItem("tjb_refresh_token", payload.refreshToken);
    set({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
  },
  clearSession: () => {
    window.localStorage.removeItem("tjb_access_token");
    window.localStorage.removeItem("tjb_refresh_token");
    set({ user: null, accessToken: null, refreshToken: null, loading: false, error: "" });
  },
  bootstrap: async () => {
    if (get().initialized) return;
    if (!get().accessToken) {
      set({ initialized: true, error: "" });
      return;
    }

    try {
      const user = await authService.me();
      set({ user, error: "" });
      try {
        await get().hydrateServerCart();
      } catch {
        // Keep the authenticated session even if cart hydration fails.
      }
    } catch {
      get().clearSession();
    } finally {
      set({ initialized: true });
    }
  },
  hydrateServerCart: async () => {
    try {
      const cart = await orderService.cart();
      useCartStore.getState().setServerCart(cart);
    } catch {
      // Ignore background hydration errors.
    }
  },
  submitAuth: async (mode, payload) => {
    set({ loading: true, error: "" });
    try {
      if (mode === "register") {
        const response = await authService.register(payload);
        set({ loading: false, error: "" });
        return response;
      }

      const response = await authService.login(payload);
      get().setTokens(response);
      set({ user: response.user, loading: false, initialized: true, error: "" });
      try {
        await get().syncGuestCart();
      } catch {
        // Successful auth should not be treated as failed because cart sync had an issue.
      }
      return response.user;
    } catch (error) {
      const message = getApiMessage(error, "Unable to continue");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  startRegistration: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.register(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to send verification OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  verifyRegistrationOtp: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.verifyRegistrationOtp(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to verify OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  resendRegistrationOtp: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.resendRegistrationOtp(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to resend verification OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  startForgotPassword: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.forgotPassword(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to send password reset OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  verifyForgotPasswordOtp: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.verifyForgotPasswordOtp(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to verify password reset OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  resendForgotPasswordOtp: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.resendForgotPasswordOtp(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to resend password reset OTP");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  resetForgotPassword: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.resetForgotPassword(payload);
      set({ loading: false, error: "" });
      return response;
    } catch (error) {
      const message = getApiMessage(error, "Unable to reset password");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  submitAdminAuth: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const response = await authService.adminLogin(payload);
      get().setTokens(response);
      set({ user: response.user, loading: false, initialized: true, error: "" });
      try {
        await get().syncGuestCart();
      } catch {
        // Successful admin auth should not fail because cart sync had an issue.
      }
      try {
        await get().hydrateServerCart();
      } catch {
        // Ignore background cart hydration errors after admin auth.
      }
      return response.user;
    } catch (error) {
      const message = getApiMessage(error, "Unable to continue");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  logout: () => {
    get().clearSession();
    useCartStore.getState().resetCart();
  },
  updateProfile: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const user = await authService.updateProfile(payload);
      set({ user, loading: false, error: "" });
      return user;
    } catch (error) {
      const message = getApiMessage(error, "Unable to update profile");
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  syncGuestCart: async () => {
    const items = readCartStorage();
    if (!items.length) return;
    for (const item of items) {
      await orderService.addToCart({ productId: item.productId, quantity: item.quantity });
    }
    writeCartStorage([]);
    await get().hydrateServerCart();
  },
}));

export const useProductStore = create((set) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  pagination: null,
  loading: false,
  adminLoading: false,
  async fetchProducts(params = {}) {
    set({ loading: true });
    try {
      const data = await productService.list(params);
      set({
        products: data.products || [],
        pagination: data.pagination || null,
        loading: false,
      });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async fetchCategories() {
    const categories = await productService.categories();
    set({ categories });
    return categories;
  },
  async fetchProduct(productId) {
    set({ loading: true });
    try {
      const product = await productService.getById(productId);
      set({ selectedProduct: product, loading: false });
      return product;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async createProduct(payload, files) {
    set({ adminLoading: true });
    try {
      const product = await productService.create(payload);
      let imageUploadError = "";

      if (files?.length) {
        try {
          await productService.uploadImages(product._id, files);
        } catch (error) {
          imageUploadError = getApiMessage(error, "Product created, but image upload failed.");
        }
      }

      set({ adminLoading: false });
      return { product, imageUploadError };
    } catch (error) {
      set({ adminLoading: false });
      throw error;
    }
  },
  async uploadProductImages(productId, files) {
    set({ adminLoading: true });
    try {
      const product = await productService.uploadImages(productId, files);
      set({ adminLoading: false });
      return product;
    } catch (error) {
      set({ adminLoading: false });
      throw error;
    }
  },
  updateProduct: (productId, payload) => productService.update(productId, payload),
  deleteProduct: (productId) => productService.remove(productId),
}));

export const useCartStore = create((set, get) => ({
  items: readCartStorage(),
  syncing: false,
  error: "",
  setServerCart: (cart) => {
    const items = (cart?.items || []).map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      product: item.product,
    }));
    set({ items, error: "" });
  },
  fetchCart: async () => {
    const auth = useAuthStore.getState();
    if (!auth.user) {
      set({ items: readCartStorage(), error: "" });
      return get().items;
    }

    set({ syncing: true, error: "" });
    try {
      const cart = await orderService.cart();
      get().setServerCart(cart);
      return cart;
    } catch (error) {
      const message = getApiMessage(error, "Unable to load cart");
      set({ error: message });
      throw error;
    } finally {
      set({ syncing: false });
    }
  },
  resetCart: () => {
    writeCartStorage([]);
    set({ items: [], error: "" });
  },
  addItem: async (product, quantity = 1) => {
    const auth = useAuthStore.getState();
    if (auth.user) {
      set({ syncing: true, error: "" });
      try {
        const cart = await orderService.addToCart({ productId: product._id, quantity });
        get().setServerCart(cart);
      } catch (error) {
        const message = getApiMessage(error, "Unable to add item to cart");
        set({ error: message });
        throw error;
      } finally {
        set({ syncing: false });
      }
      return;
    }

    const nextItems = [...get().items];
    const index = nextItems.findIndex((item) => item.productId === product._id);
    if (index > -1) nextItems[index].quantity += quantity;
    else nextItems.push({ productId: product._id, quantity, product });
    writeCartStorage(nextItems);
    set({ items: nextItems, error: "" });
  },
  updateQuantity: async (productId, quantity) => {
    const auth = useAuthStore.getState();
    if (auth.user) {
      set({ syncing: true, error: "" });
      try {
        const cart = await orderService.updateCartItem(productId, { quantity });
        get().setServerCart(cart);
        return;
      } catch (error) {
        const message = getApiMessage(error, "Unable to update cart item");
        set({ error: message });
        throw error;
      } finally {
        set({ syncing: false });
      }
    }
    const nextItems = get().items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
    writeCartStorage(nextItems);
    set({ items: nextItems, error: "" });
  },
  removeItem: async (productId) => {
    const auth = useAuthStore.getState();
    if (auth.user) {
      set({ syncing: true, error: "" });
      try {
        const cart = await orderService.removeCartItem(productId);
        get().setServerCart(cart);
        return;
      } catch (error) {
        const message = getApiMessage(error, "Unable to remove cart item");
        set({ error: message });
        throw error;
      } finally {
        set({ syncing: false });
      }
    }
    const nextItems = get().items.filter((item) => item.productId !== productId);
    writeCartStorage(nextItems);
    set({ items: nextItems, error: "" });
  },
  cartSummary: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 499;
    const tax = subtotal * 0.03;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  },
}));

export const useWishlistStore = create((set, get) => ({
  items: readWishlistStorage(),
  toggleItem: (product) => {
    const exists = get().items.some((item) => item._id === product._id);
    const nextItems = exists
      ? get().items.filter((item) => item._id !== product._id)
      : [...get().items, product];

    writeWishlistStorage(nextItems);
    set({ items: nextItems });
  },
  removeItem: (productId) => {
    const nextItems = get().items.filter((item) => item._id !== productId);
    writeWishlistStorage(nextItems);
    set({ items: nextItems });
  },
  isWishlisted: (productId) => get().items.some((item) => item._id === productId),
  resetWishlist: () => {
    writeWishlistStorage([]);
    set({ items: [] });
  },
}));

export const useOrderStore = create((set) => ({
  orders: [],
  selectedOrder: null,
  adminOrders: [],
  dashboard: null,
  users: [],
  loading: false,
  async fetchOrders() {
    set({ loading: true });
    try {
      const orders = await orderService.myOrders();
      set({ orders, loading: false });
      return orders;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async fetchOrder(orderId) {
    set({ loading: true });
    try {
      const order = await orderService.getById(orderId);
      set({ selectedOrder: order, loading: false });
      return order;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  createOrder: (payload) => orderService.create(payload),
  verifyPayment: (orderId, payload) => orderService.verifyPayment(orderId, payload),
  async fetchAdminDashboard() {
    const [dashboard, orders, users] = await Promise.all([
      adminService.dashboard(),
      adminService.orders(),
      adminService.users(),
    ]);
    set({ dashboard, adminOrders: orders, users });
  },
  updateAdminOrderStatus: (orderId, payload) => adminService.updateOrderStatus(orderId, payload),
}));
