import { create } from "zustand";
import api from "../services/api";

const getUserFromStorage = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const getTokenFromStorage = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
};

const useAuthStore = create((set, get) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      // Register always logs in with localStorage by default
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed";
      set({ loading: false, error: message });
      throw err;
    }
  },

  login: async (email, password, rememberMe = true) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      let message = "Login failed";
      if (!err.response) {
        message = "Network error. Please check your internet connection.";
      } else if (err.response.status >= 500) {
        message = "Unable to connect to the server. Please try again.";
      } else if (err.response.status === 401) {
        message = "Invalid email or password.";
      } else {
        message = err.response?.data?.message || "Invalid email or password.";
      }
      set({ loading: false, error: message });
      throw err;
    }
  },

  loadUser: async () => {
    const token = getTokenFromStorage();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      // Update the correct storage
      if (localStorage.getItem("token")) {
        localStorage.setItem("user", JSON.stringify(data));
      } else if (sessionStorage.getItem("token")) {
        sessionStorage.setItem("user", JSON.stringify(data));
      }
      set({ user: data, token, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset link";
      set({ loading: false, error: message });
      throw err;
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password";
      set({ loading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
