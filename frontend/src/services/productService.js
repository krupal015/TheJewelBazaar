import { apiClient } from "./api";

export const productService = {
  list: (params) => apiClient.get("/products", { params }),
  getById: (productId) => apiClient.get(`/products/${productId}`),
  categories: () => apiClient.get("/products/categories"),
  create: (payload) => apiClient.post("/products", payload),
  update: (productId, payload) => apiClient.patch(`/products/${productId}`, payload),
  remove: (productId) => apiClient.delete(`/products/${productId}`),
  uploadImages: (productId, files) => {
    const formData = new FormData();
    [...files].forEach((file) => formData.append("images", file));
    return apiClient.post(`/uploads/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
