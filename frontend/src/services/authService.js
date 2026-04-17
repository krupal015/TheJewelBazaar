import { apiClient } from "./api";

export const authService = {
  register: (payload) => apiClient.post("/auth/register", payload),
  verifyRegistrationOtp: (payload) => apiClient.post("/auth/register/verify-otp", payload),
  resendRegistrationOtp: (payload) => apiClient.post("/auth/register/resend-otp", payload),
  forgotPassword: (payload) => apiClient.post("/auth/forgot-password", payload),
  verifyForgotPasswordOtp: (payload) => apiClient.post("/auth/forgot-password/verify-otp", payload),
  resendForgotPasswordOtp: (payload) => apiClient.post("/auth/forgot-password/resend-otp", payload),
  resetForgotPassword: (payload) => apiClient.post("/auth/forgot-password/reset", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  adminLogin: (payload) => apiClient.post("/auth/admin/login", payload),
  me: () => apiClient.get("/auth/me"),
};
