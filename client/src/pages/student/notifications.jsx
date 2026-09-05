import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserPlus,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import AppShell from "../../components/AppShell/AppShell";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";

const TYPE_ICONS = {
  COMPLAINT_SUBMITTED: { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  COMPLAINT_ASSIGNED: { Icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-50" },
  COMPLAINT_REASSIGNED: { Icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-50" },
  STATUS_CHANGED: { Icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  NEW_COMMENT: { Icon: MessageCircle, color: "text-cyan-500", bg: "bg-cyan-50" },
  COMPLAINT_RESOLVED: { Icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  COMPLAINT_CLOSED: { Icon: XCircle, color: "text-slate-400", bg: "bg-slate-50" },
  FEEDBACK_RECEIVED: { Icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  NEW_COMPLAINT: { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
};

function getNotificationRoute(notification, userRole) {
  if (!notification.complaintId) return null;
  const id =
    typeof notification.complaintId === "object"
      ? notification.complaintId._id
      : notification.complaintId;
  return userRole === "admin" ? `/admin/complaint/${id}` : `/student/complaint/${id}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    fetchMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.isRead) markAsRead(notification._id);
      const route = getNotificationRoute(notification, user?.role);
      if (route) navigate(route);
    },
    [markAsRead, navigate, user?.role]
  );

  const handleDelete = useCallback(
    async (e, id) => {
      e.stopPropagation();
      setDeleting(id);
      await deleteNotification(id);
      setDeleting(null);
    },
    [deleteNotification]
  );

  const handleMarkRead = useCallback(
    (e, id) => {
      e.stopPropagation();
      markAsRead(id);
    },
    [markAsRead]
  );

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary flex-shrink-0">
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded skeleton" />
                    <div className="h-3 w-full rounded skeleton" />
                    <div className="h-3 w-24 rounded skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center animate-slide-up">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No notifications</h3>
            <p className="text-slate-500">
              When something happens with your complaints, you'll see it here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((n, i) => {
                const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.STATUS_CHANGED;
                const IconComp = typeConfig.Icon;
                const route = getNotificationRoute(n, user?.role);
                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`card p-4 cursor-pointer hover:shadow-card-hover transition-all animate-slide-up ${
                      !n.isRead ? "border-l-4 border-l-brand-500 bg-brand-50/30" : ""
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}
                      >
                        <IconComp className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm leading-snug ${
                                !n.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                              }`}
                            >
                              {n.title}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            {n.complaintId && (
                              <p className="text-xs text-slate-400 mt-1.5">
                                Complaint:{" "}
                                {typeof n.complaintId === "object"
                                  ? n.complaintId.title
                                  : "View details"}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(n.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.isRead && (
                              <button
                                onClick={(e) => handleMarkRead(e, n._id)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, n._id)}
                              disabled={deleting === n._id}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {route && (
                          <Link
                            to={route}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium mt-2"
                          >
                            View complaint →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNotifications(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-ghost px-3 py-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-ghost px-3 py-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
