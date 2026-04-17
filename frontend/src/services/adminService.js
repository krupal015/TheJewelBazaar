import { apiClient } from "./api";

export const adminService = {
  dashboard: () => apiClient.get("/admin/dashboard"),
  users: () => apiClient.get("/admin/users"),
  orders: () => apiClient.get("/admin/orders"),
  updateOrderStatus: (orderId, payload) => apiClient.patch(`/admin/orders/${orderId}/status`, payload),
  createCategory: (payload) => apiClient.post("/products/categories", payload),
};
