import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";

function StarRating({ rating, size = "w-5 h-5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${size} ${s <= rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const { data } = await api.get(`/complaints/${id}`);
        setComplaint(data.complaint);
        setUpdates(data.updates);
      } catch (err) {
        toast.error("Failed to load complaint");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackRating === 0) { toast.error("Please select a rating"); return; }
    setFeedbackSubmitting(true);
    try {
      const { data } = await api.post(`/complaints/${id}/feedback`, { rating: feedbackRating, comment: feedbackComment || undefined });
      setComplaint(data);
      toast.success("Feedback submitted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const canFeedback = complaint && ["resolved", "closed"].includes(complaint.status) && !complaint.feedback?.rating;

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg w-64" />
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="page-container text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Complaint not found</h2>
        <Link to="/student/my-complaints" className="btn-primary mt-4 inline-flex">Back to My Complaints</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/student/my-complaints" className="btn-ghost text-sm mb-6 inline-flex">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Complaints
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{complaint.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
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
          {/* Description */}
          <div className="card p-6">
            <h2 className="section-title mb-3">Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
          </div>

          {/* Details */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Category", complaint.category],
                ["Location", complaint.location],
                ["Department", complaint.assignedDepartment],
                ["Assigned To", complaint.assignedTo?.name],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{value || "—"}</dd>
                </div>
              ))}
              {complaint.resolutionDetails && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Resolution Details</dt>
                  <dd className="font-medium text-slate-900 mt-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100">{complaint.resolutionDetails}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Attachments */}
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

          {/* Feedback Display */}
          {complaint.feedback?.rating && (
            <div className="card p-6">
              <h2 className="section-title mb-3">Your Feedback</h2>
              <StarRating rating={complaint.feedback.rating} />
              {complaint.feedback.comment && <p className="text-slate-700 mt-2">{complaint.feedback.comment}</p>}
              <p className="text-xs text-slate-400 mt-2">
                Submitted {new Date(complaint.feedback.submittedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Feedback Form */}
          {canFeedback && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Rate the Resolution</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="label">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="focus:outline-none transition-transform hover:scale-110">
                        <svg className={`w-8 h-8 cursor-pointer transition-colors ${star <= (hoveredStar || feedbackRating) ? "text-amber-400" : "text-slate-200"}`}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    {feedbackRating > 0 && <span className="ml-2 text-sm text-slate-500 font-medium">{feedbackRating}/5</span>}
                  </div>
                </div>
                <div>
                  <label className="label">Comment (optional)</label>
                  <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3} maxLength={1000} className="input resize-none"
                    placeholder="How was the resolution experience?" />
                </div>
                <button type="submit" disabled={feedbackSubmitting || feedbackRating === 0} className="btn-primary">
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar: Timeline */}
        <div>
          <div className="card p-6 sticky top-6">
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
                        <span className="text-[11px] text-slate-400">
                          {new Date(u.createdAt).toLocaleString()}
                        </span>
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
      </div>
    </div>
  );
}
