import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";

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

  const canFeedback = complaint && ["resolved", "closed"].includes(complaint.status) && !complaint.feedback?.rating;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-center">
        <p className="text-gray-500 mb-4">Complaint not found</p>
        <Link to="/student/my-complaints" className="text-blue-600 hover:underline">
          Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <Link to="/student/my-complaints" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to My Complaints
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{complaint.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Department</dt>
                <dd className="font-medium">{complaint.assignedDepartment || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Assigned To</dt>
                <dd className="font-medium">{complaint.assignedTo?.name || "—"}</dd>
              </div>
              {complaint.resolutionDetails && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Resolution Details</dt>
                  <dd className="font-medium mt-1">{complaint.resolutionDetails}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-3">Attachments</h2>
              <div className="flex flex-wrap gap-3">
                {complaint.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-50 border rounded-lg text-sm text-blue-600 hover:bg-gray-100"
                  >
                    {a.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {complaint.feedback?.rating && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-3">Your Feedback</h2>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= complaint.feedback.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {complaint.feedback.comment && (
                <p className="text-gray-700">{complaint.feedback.comment}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Submitted {new Date(complaint.feedback.submittedAt).toLocaleString()}
              </p>
            </div>
          )}

          {canFeedback && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-3">Leave Feedback</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 cursor-pointer transition ${
                            star <= (hoveredStar || feedbackRating) ? "text-yellow-400" : "text-gray-200"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    {feedbackRating > 0 && (
                      <span className="ml-2 text-sm text-gray-500">{feedbackRating}/5</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with the resolution..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={feedbackSubmitting || feedbackRating === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar: Timeline */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>
            {updates.length === 0 ? (
              <p className="text-gray-500 text-sm">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        u.actorRole === "admin" ? "bg-blue-500" : "bg-green-500"
                      }`} />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{u.actor?.name || "System"}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {u.previousStatus && u.newStatus && u.previousStatus !== u.newStatus && (
                        <p className="text-sm text-gray-600 mt-1">
                          <StatusBadge status={u.previousStatus} /> → <StatusBadge status={u.newStatus} />
                        </p>
                      )}
                      {u.comment && (
                        <p className="text-sm text-gray-700 mt-1">{u.comment}</p>
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
