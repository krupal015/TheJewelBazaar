import axios from "axios";

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value));

const backendOrigin = trimTrailingSlash(import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5000");
const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = configuredApiBaseUrl
  ? isAbsoluteUrl(configuredApiBaseUrl)
    ? trimTrailingSlash(configuredApiBaseUrl)
    : `${backendOrigin}${configuredApiBaseUrl.startsWith("/") ? configuredApiBaseUrl : `/${configuredApiBaseUrl}`}`
  : `${backendOrigin}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("tjb_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = window.localStorage.getItem("tjb_refresh_token");

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry &&
      !String(originalRequest.url || "").includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        const token = await new Promise((resolve, reject) => queue.push({ resolve, reject }));
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        const nextAccessToken = data.data.accessToken;
        const nextRefreshToken = data.data.refreshToken;

        window.localStorage.setItem("tjb_access_token", nextAccessToken);
        window.localStorage.setItem("tjb_refresh_token", nextRefreshToken);
        flushQueue(null, nextAccessToken);

        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.localStorage.removeItem("tjb_access_token");
        window.localStorage.removeItem("tjb_refresh_token");
        flushQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const unwrap = async (promise) => {
  const response = await promise;
  return response.data.data;
};

export const apiClient = {
  get: (url, config) => unwrap(api.get(url, config)),
  post: (url, data, config) => unwrap(api.post(url, data, config)),
  patch: (url, data, config) => unwrap(api.patch(url, data, config)),
  delete: (url, config) => unwrap(api.delete(url, config)),
};

export default api;
