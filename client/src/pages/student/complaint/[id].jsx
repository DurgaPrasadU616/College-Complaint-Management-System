import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, AlertCircle, ExternalLink, Star, Sparkles } from "lucide-react";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../../components/AppShell/AppShell";
import { DetailSkeleton } from "../../../components/Skeleton/Skeleton";

function StarRating({ rating, size = "w-5 h-5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
          }`}
        />
      ))}
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

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  
  // Two-way Comments
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

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
    if (feedbackRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const { data } = await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment || undefined,
      });
      setComplaint(data);
      toast.success("Feedback submitted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      await api.post(`/complaints/${id}/comments`, { comment: newComment });
      toast.success("Comment added");
      setNewComment("");
      
      // Refresh the complaint data to pull the latest timeline updates
      const { data } = await api.get(`/complaints/${id}`);
      setUpdates(data.updates);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const canFeedback =
    complaint &&
    ["resolved", "closed"].includes(complaint.status) &&
    !complaint.feedback?.rating;

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
          <Link to="/student/my-complaints" className="btn-primary mt-4 inline-flex">
            Back to My Complaints
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container">
        <Link to="/student/my-complaints" className="btn-ghost text-sm mb-6 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to My Complaints
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
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
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
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
                    <dd className="font-medium text-slate-900 mt-0.5">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
                {complaint.resolutionDetails && (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Resolution Details</dt>
                    <dd className="font-medium text-slate-900 mt-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      {complaint.resolutionDetails}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {complaint.ai?.category && (
              <div className="card p-6 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <h2 className="section-title text-violet-900">AI Analysis</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <dt className="text-xs text-violet-600">Suggested Category</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">
                      {complaint.ai.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-violet-600">Suggested Priority</dt>
                    <dd className="font-medium text-slate-900 mt-0.5 capitalize">
                      {complaint.ai.priority}
                    </dd>
                  </div>
                </div>
                {complaint.ai.summary && (
                  <div className="mb-3">
                    <dt className="text-xs text-violet-600 mb-1">Summary</dt>
                    <dd className="text-sm text-slate-700">{complaint.ai.summary}</dd>
                  </div>
                )}
                {complaint.ai.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {complaint.ai.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/80 text-slate-600 text-xs rounded-full border border-violet-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
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
                          <p className="text-xs text-slate-500 truncate">{a.filename}</p>
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

            {/* Feedback Display */}
            {complaint.feedback?.rating && (
              <div className="card p-6">
                <h2 className="section-title mb-3">Your Feedback</h2>
                <StarRating rating={complaint.feedback.rating} />
                {complaint.feedback.comment && (
                  <p className="text-slate-700 mt-2">{complaint.feedback.comment}</p>
                )}
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
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                              star <= (hoveredStar || feedbackRating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                      {feedbackRating > 0 && (
                        <span className="ml-2 text-sm text-slate-500 font-medium">
                          {feedbackRating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="feedback-comment" className="label">
                      Comment (optional)
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="input resize-none"
                      placeholder="How was the resolution experience?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting || feedbackRating === 0}
                    className="btn-primary"
                  >
                    {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar: Timeline */}
          <div>
            <div className="card p-6 sticky top-24">
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
              
              {/* Comment Input */}
              {!["resolved", "closed"].includes(complaint.status) && (
                <form onSubmit={handleCommentSubmit} className="mt-6 border-t border-slate-100 pt-5">
                  <label htmlFor="timeline-comment" className="sr-only">Add a comment</label>
                  <textarea
                    id="timeline-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a message to the support team..."
                    className="input resize-none mb-3 text-sm"
                    rows={3}
                    maxLength={1000}
                  />
                  <button 
                    type="submit" 
                    disabled={commentSubmitting || !newComment.trim()}
                    className="btn-primary w-full py-2 text-sm"
                  >
                    {commentSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
