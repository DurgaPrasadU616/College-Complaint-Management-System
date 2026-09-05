import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FileText,
  UserPlus,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";

const TYPE_ICONS = {
  COMPLAINT_SUBMITTED: { Icon: FileText, color: "text-blue-500" },
  COMPLAINT_ASSIGNED: { Icon: UserPlus, color: "text-indigo-500" },
  COMPLAINT_REASSIGNED: { Icon: RefreshCw, color: "text-purple-500" },
  STATUS_CHANGED: { Icon: AlertCircle, color: "text-amber-500" },
  NEW_COMMENT: { Icon: MessageCircle, color: "text-cyan-500" },
  COMPLAINT_RESOLVED: { Icon: CheckCircle2, color: "text-green-500" },
  COMPLAINT_CLOSED: { Icon: XCircle, color: "text-slate-400" },
  FEEDBACK_RECEIVED: { Icon: Star, color: "text-yellow-500" },
  NEW_COMPLAINT: { Icon: FileText, color: "text-blue-500" },
};

function getNotificationRoute(notification, userRole) {
  if (!notification.complaintId) return null;
  const id =
    typeof notification.complaintId === "object"
      ? notification.complaintId._id
      : notification.complaintId;
  return userRole === "admin" ? `/admin/complaint/${id}` : `/student/complaint/${id}`;
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.isRead) markAsRead(notification._id);
      const route = getNotificationRoute(notification, user?.role);
      if (route) {
        setOpen(false);
        navigate(route);
      }
    },
    [markAsRead, navigate, user?.role]
  );

  const handleViewAll = useCallback(() => {
    setOpen(false);
    navigate(user?.role === "admin" ? "/admin/notifications" : "/student/notifications");
  }, [navigate, user?.role]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white rounded-xl shadow-soft border border-slate-200 z-50 max-h-[70vh] sm:max-h-96 overflow-hidden flex flex-col animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 20).map((n) => {
                  const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.STATUS_CHANGED;
                  const IconComp = typeConfig.Icon;
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.isRead ? "bg-brand-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                        )}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            !n.isRead ? "bg-brand-50" : "bg-slate-50"
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${typeConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 leading-snug">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            {getTimeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {notifications.length > 0 && (
                  <button
                    onClick={handleViewAll}
                    className="w-full px-4 py-3 text-sm text-brand-600 hover:text-brand-700 hover:bg-brand-50/50 font-medium text-center transition-colors"
                  >
                    View all notifications
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
