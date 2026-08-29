import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";

const STATUSES = ["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [assignForm, setAssignForm] = useState({ assignedDepartment: "", assignedTo: "" });
  const [statusForm, setStatusForm] = useState({ status: "", comment: "" });
  const [priorityForm, setPriorityForm] = useState({ priority: "" });
  const [resolveForm, setResolveForm] = useState({ resolutionDetails: "" });
  const [submitting, setSubmitting] = useState(null);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setUpdates(data.updates);
      setAssignForm({ assignedDepartment: data.complaint.assignedDepartment || "", assignedTo: data.complaint.assignedTo?._id || "" });
      setPriorityForm({ priority: data.complaint.priority });
    } catch (err) {
      toast.error("Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try { const { data } = await api.get("/departments"); setDepartments(data); } catch {}
  };

  useEffect(() => { fetchComplaint(); fetchDepartments(); }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault(); setSubmitting("assign");
    try { await api.patch(`/complaints/${id}/assign`, assignForm); toast.success("Complaint assigned"); fetchComplaint(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to assign"); }
    finally { setSubmitting(null); }
  };

  const handleStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) { toast.error("Select a status"); return; }
    setSubmitting("status");
    try { await api.patch(`/complaints/${id}/status`, statusForm); toast.success("Status updated"); setStatusForm({ status: "", comment: "" }); fetchComplaint(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to update"); }
    finally { setSubmitting(null); }
  };

  const handlePriority = async (e) => {
    e.preventDefault(); setSubmitting("priority");
    try { await api.patch(`/complaints/${id}/priority`, priorityForm); toast.success("Priority updated"); fetchComplaint(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to update"); }
    finally { setSubmitting(null); }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveForm.resolutionDetails.trim()) { toast.error("Resolution details required"); return; }
    setSubmitting("resolve");
    try { await api.post(`/complaints/${id}/resolve`, resolveForm); toast.success("Complaint resolved"); setResolveForm({ resolutionDetails: "" }); fetchComplaint(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to resolve"); }
    finally { setSubmitting(null); }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg w-64" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Complaint not found</h2>
        <Link to="/admin/complaints" className="btn-primary mt-4 inline-flex">Back to complaints</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/admin/complaints" className="btn-ghost text-sm mb-6 inline-flex">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to complaints
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{complaint.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{complaint._id.slice(-8)}</span>
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
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
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
                  <dd className="font-medium text-slate-900 mt-0.5">{value || "—"}</dd>
                </div>
              ))}
              {complaint.resolutionDetails && (
                <div className="col-span-2">
                  <dt className="text-slate-500">Resolution Details</dt>
                  <dd className="font-medium text-slate-900 mt-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100">{complaint.resolutionDetails}</dd>
                </div>
              )}
            </dl>
          </div>

          {complaint.attachments?.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-3">Attachments</h2>
              <div className="flex flex-wrap gap-3">
                {complaint.attachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {a.filename}
                  </a>
                ))}
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
                {updates.map((u, i) => (
                  <div key={u._id} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 z-10 ${u.actorRole === "admin" ? "bg-brand-500" : "bg-emerald-500"}`} />
                      {i < updates.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-slate-900">{u.actor?.name || "System"}</span>
                        <span className="text-[11px] text-slate-400">{new Date(u.createdAt).toLocaleString()}</span>
                      </div>
                      {u.previousStatus && u.newStatus && u.previousStatus !== u.newStatus && (
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                          <StatusBadge status={u.previousStatus} />
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <StatusBadge status={u.newStatus} />
                        </p>
                      )}
                      {u.comment && (
                        <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded-lg px-3 py-2">{u.comment}</p>
                      )}
                    </div>
                  </div>
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
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Assign
            </h3>
            <form onSubmit={handleAssign} className="space-y-2.5">
              <select value={assignForm.assignedDepartment}
                onChange={(e) => setAssignForm({ ...assignForm, assignedDepartment: e.target.value })} className="input text-sm">
                <option value="">Select department</option>
                {departments.map((d) => (<option key={d._id} value={d.name}>{d.name}</option>))}
              </select>
              <button type="submit" disabled={submitting === "assign"} className="btn-primary w-full py-2 text-sm">
                {submitting === "assign" ? "Assigning..." : "Assign"}
              </button>
            </form>
          </div>

          {/* Update Status */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              Update Status
            </h3>
            <form onSubmit={handleStatus} className="space-y-2.5">
              <select value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} className="input text-sm">
                <option value="">Select status</option>
                {STATUSES.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}</option>))}
              </select>
              <textarea value={statusForm.comment}
                onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                placeholder="Comment (optional)" rows={2} className="input text-sm resize-none" />
              <button type="submit" disabled={submitting === "status"} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {submitting === "status" ? "Updating..." : "Update Status"}
              </button>
            </form>
          </div>

          {/* Update Priority */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              Priority
            </h3>
            <form onSubmit={handlePriority} className="space-y-2.5">
              <select value={priorityForm.priority}
                onChange={(e) => setPriorityForm({ priority: e.target.value })} className="input text-sm">
                {PRIORITIES.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
              </select>
              <button type="submit" disabled={submitting === "priority"} className="w-full py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition">
                {submitting === "priority" ? "Updating..." : "Update Priority"}
              </button>
            </form>
          </div>

          {/* Resolve */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Resolve
            </h3>
            <form onSubmit={handleResolve} className="space-y-2.5">
              <textarea value={resolveForm.resolutionDetails}
                onChange={(e) => setResolveForm({ resolutionDetails: e.target.value })}
                placeholder="How was it resolved?" rows={3} className="input text-sm resize-none" />
              <button type="submit" disabled={submitting === "resolve"} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition">
                {submitting === "resolve" ? "Resolving..." : "Mark Resolved"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
