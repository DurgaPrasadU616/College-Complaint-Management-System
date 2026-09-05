import { create } from "zustand";
import api from "../services/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: null,

  fetchNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications", { params: { page, limit: 20 } }),
        api.get("/notifications/unread-count"),
      ]);
      set({
        notifications: notifRes.data.notifications,
        unreadCount: countRes.data.count,
        pagination: notifRes.data.pagination,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchMoreNotifications: async () => {
    const { pagination, notifications } = get();
    if (!pagination || pagination.page >= pagination.pages) return;
    try {
      const notifRes = await api.get("/notifications", {
        params: { page: pagination.page + 1, limit: 20 },
      });
      set({
        notifications: [...notifications, ...notifRes.data.notifications],
        pagination: notifRes.data.pagination,
      });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
    } catch {
      // ignore
    }
  },
}));

export default useNotificationStore;
