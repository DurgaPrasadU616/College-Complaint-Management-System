import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  UserPlus,
  RefreshCw,
  Flag,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../../components/AppShell/AppShell";
import { DetailSkeleton } from "../../../components/Skeleton/Skeleton";

const STATUSES = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];
const PRIORITIES = ["low", "medium", "high", "critical"];

function ConfirmDialog({ open, title, message, onConfirm, onCancel, variant = "danger" }) {
  if (!open) return null;
  const variants = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    primary: "bg-brand-600 hover:bg-brand-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-soft max-w-md w-full p-6 animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white font-medium text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ update, isLast }) {
  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full mt-1 z-10 ring-4 ring-white ${
            update.actorRole === "admin" ? "bg-brand-500" : "bg-emerald-500"
          }`}
        />
        {!isLast && <div className="w-px flex-1 bg-slate-200" />}
      </div>
      <div className="pb-5 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-slate-900">
            {update.actor?.name || "System"}
          </span>
          <span className="text-[11px] text-slate-400">
            {new Date(update.createdAt).toLocaleString()}
          </span>
        </div>
        {update.previousStatus &&
          update.newStatus &&
          update.previousStatus !== update.newStatus && (
            <div className="text-sm text-slate-600 mt-1.5 flex items-center gap-2 flex-wrap">
              <StatusBadge status={update.previousStatus} />
              <svg
                className="w-3 h-3 text-slate-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <StatusBadge status={update.newStatus} />
            </div>
          )}
        {update.comment && (
          <p className="text-sm text-slate-600 mt-1.5 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            {update.comment}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [assignForm, setAssignForm] = useState({
    assignedDepartment: "",
    assignedTo: "",
  });
  const [statusForm, setStatusForm] = useState({ status: "", comment: "" });
  const [priorityForm, setPriorityForm] = useState({ priority: "" });
  const [resolveForm, setResolveForm] = useState({ resolutionDetails: "" });
  const [submitting, setSubmitting] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setUpdates(data.updates);
      setAssignForm({
        assignedDepartment: data.complaint.assignedDepartment || "",
        assignedTo: data.complaint.assignedTo?._id || "",
      });
      setPriorityForm({ priority: data.complaint.priority });
    } catch (err) {
      toast.error("Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data);
    } catch {}
  };

  useEffect(() => {
    fetchComplaint();
    fetchDepartments();
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting("assign");
    try {
      await api.patch(`/complaints/${id}/assign`, assignForm);
      toast.success("Complaint assigned");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign");
    } finally {
      setSubmitting(null);
    }
  };

  const handleStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) {
      toast.error("Select a status");
      return;
    }
    setSubmitting("status");
    try {
      await api.patch(`/complaints/${id}/status`, statusForm);
      toast.success("Status updated");
      setStatusForm({ status: "", comment: "" });
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSubmitting(null);
    }
  };

  const handlePriority = async (e) => {
    e.preventDefault();
    setSubmitting("priority");
    try {
      await api.patch(`/complaints/${id}/priority`, priorityForm);
      toast.success("Priority updated");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSubmitting(null);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveForm.resolutionDetails.trim()) {
      toast.error("Resolution details required");
      return;
    }
    setSubmitting("resolve");
    try {
      await api.post(`/complaints/${id}/resolve`, resolveForm);
      toast.success("Complaint resolved");
      setResolveForm({ resolutionDetails: "" });
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <DetailSkeleton />
      </AppShell>
    );
  }

  if (!complaint) {
    return (
      <AppShell>
        <div className="page-container text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Complaint not found
          </h2>
          <Link to="/admin/complaints" className="btn-primary mt-4 inline-flex">
            Back to complaints
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container">
        <Link to="/admin/complaints" className="btn-ghost text-sm mb-6 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to complaints
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                {complaint._id.slice(-8)}
              </span>
              <span className="mx-2">&middot;</span>
              Created {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="section-title mb-3">Description</h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            <div className="card p-6">
              <h2 className="section-title mb-4">Details</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Category", complaint.category],
                  ["Location", complaint.location],
                  ["Submitted By", complaint.submittedBy?.name],
                  ["Email", complaint.submittedBy?.email],
                  ["Department", complaint.assignedDepartment],
                  ["Assigned To", complaint.assignedTo?.name],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
                {complaint.resolutionDetails && (
                  <div className="col-span-2">
                    <dt className="text-slate-500">Resolution Details</dt>
                    <dd className="font-medium text-slate-900 mt-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      {complaint.resolutionDetails}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {complaint.attachments?.length > 0 && (
              <div className="card p-6">
                <h2 className="section-title mb-3">Attachments</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((a, i) =>
                    a.mimeType?.startsWith("image/") ? (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200 hover:border-brand-300 transition-colors group"
                      >
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={a.url}
                            alt={a.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="px-3 py-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500 truncate">
                            {a.filename}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-all"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{a.filename}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card p-6">
              <h2 className="section-title mb-4">Status Timeline</h2>
              {updates.length === 0 ? (
                <p className="text-slate-500 text-sm">No updates yet</p>
              ) : (
                <div className="space-y-0">
                  {[...updates].reverse().map((u, i) => (
                    <TimelineEntry
                      key={u._id}
                      update={u}
                      isLast={i === updates.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admin Controls Sidebar */}
          <div className="space-y-4">
            {/* Assign */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Assign
              </h3>
              <form onSubmit={handleAssign} className="space-y-2.5">
                <select
                  value={assignForm.assignedDepartment}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, assignedDepartment: e.target.value })
                  }
                  className="input text-sm"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={submitting === "assign"}
                  className="btn-primary w-full py-2 text-sm"
                >
                  {submitting === "assign" ? "Assigning..." : "Assign"}
                </button>
              </form>
            </div>

            {/* Update Status */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                Update Status
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirmDialog({
                    title: "Update Status",
                    message: `Are you sure you want to change the status to "${statusForm.status?.replace(/_/g, " ")}"?`,
                    variant: "primary",
                    onConfirm: () => {
                      handleStatus(e);
                      setConfirmDialog(null);
                    },
                  });
                }}
                className="space-y-2.5"
              >
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                  className="input text-sm"
                >
                  <option value="">Select status</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                <textarea
                  value={statusForm.comment}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, comment: e.target.value })
                  }
                  placeholder="Comment (optional)"
                  rows={2}
                  className="input text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting === "status"}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {submitting === "status" ? "Updating..." : "Update Status"}
                </button>
              </form>
            </div>

            {/* Update Priority */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Flag className="w-3.5 h-3.5 text-amber-600" />
                </div>
                Priority
              </h3>
              <form onSubmit={handlePriority} className="space-y-2.5">
                <select
                  value={priorityForm.priority}
                  onChange={(e) =>
                    setPriorityForm({ priority: e.target.value })
                  }
                  className="input text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={submitting === "priority"}
                  className="w-full py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {submitting === "priority" ? "Updating..." : "Update Priority"}
                </button>
              </form>
            </div>

            {/* Resolve */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                Resolve
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resolveForm.resolutionDetails.trim()) {
                    toast.error("Resolution details required");
                    return;
                  }
                  setConfirmDialog({
                    title: "Mark as Resolved",
                    message:
                      "This will mark the complaint as resolved. Are you sure?",
                    variant: "warning",
                    onConfirm: () => {
                      handleResolve(e);
                      setConfirmDialog(null);
                    },
                  });
                }}
                className="space-y-2.5"
              >
                <textarea
                  value={resolveForm.resolutionDetails}
                  onChange={(e) =>
                    setResolveForm({ resolutionDetails: e.target.value })
                  }
                  placeholder="How was it resolved?"
                  rows={3}
                  className="input text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting === "resolve"}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {submitting === "resolve" ? "Resolving..." : "Mark Resolved"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={!!confirmDialog}
          title={confirmDialog?.title}
          message={confirmDialog?.message}
          variant={confirmDialog?.variant}
          onConfirm={confirmDialog?.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      </div>
    </AppShell>
  );
}
