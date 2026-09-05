import axios from "axios";
import toast from "react-hot-toast";

const getBaseUrl = () => {
  let url = (import.meta.env.VITE_API_URL || "/api").trim();
  url = url.replace(/\/+$/, "");
  if (url.startsWith("http") && !url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/me");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      toast.error("Session expired. Please sign in again.");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
