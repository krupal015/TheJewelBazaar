import { apiClient } from "./api";

export const orderService = {
  myOrders: () => apiClient.get("/orders"),
  getById: (orderId) => apiClient.get(`/orders/${orderId}`),
  create: (payload) => apiClient.post("/orders", payload),
  verifyPayment: (orderId, payload) => apiClient.post(`/orders/${orderId}/verify-payment`, payload),
  cart: () => apiClient.get("/cart"),
  addToCart: (payload) => apiClient.post("/cart", payload),
  updateCartItem: (productId, payload) => apiClient.patch(`/cart/${productId}`, payload),
  removeCartItem: (productId) => apiClient.delete(`/cart/${productId}`),
  clearCart: () => apiClient.delete("/cart"),
};
