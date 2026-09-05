import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, ImageIcon, Sparkles, Check, AlertCircle } from "lucide-react";
import api from "../../services/api";
import AppShell from "../../components/AppShell/AppShell";

const CATEGORIES = [
  { value: "Classroom", icon: "🏫" },
  { value: "Lab", icon: "🔬" },
  { value: "Hostel", icon: "🏠" },
  { value: "Wi-Fi/Network", icon: "📶" },
  { value: "Infrastructure", icon: "🏗️" },
  { value: "Transportation", icon: "🚌" },
  { value: "Cleanliness", icon: "🧹" },
  { value: "Other", icon: "📋" },
];

const PRIORITY_LABELS = {
  low: "Low - Minor issue, no immediate impact",
  medium: "Medium - Standard issue, needs attention",
  high: "High - Significant impact on studies/life",
  critical: "Critical - Emergency, immediate action required",
};

export default function NewComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "medium",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  useEffect(() => {
    api
      .get("/ai/status")
      .then(({ data }) => setAiEnabled(data.enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim())
      newErrors.title = "Please enter a short title describing your complaint.";
    else if (form.title.trim().length > 100)
      newErrors.title = "Title must be under 100 characters.";

    if (!form.description.trim())
      newErrors.description = "Please provide more details about your complaint.";
    else if (form.description.trim().length > 2000)
      newErrors.description = "Description is too long (max 2000 characters).";

    if (!form.category) newErrors.category = "Please select a category.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", form.location);
      formData.append("priority", form.priority);
      if (aiSuggestion) {
        formData.append(
          "ai",
          JSON.stringify({
            category: aiSuggestion.category,
            priority: aiSuggestion.priority,
            summary: aiSuggestion.summary,
            tags: aiSuggestion.tags,
            model: aiSuggestion.model,
          })
        );
      }
      for (const file of files) formData.append("attachments", file);
      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Complaint submitted!");
      navigate("/student/my-complaints");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    if (aiAccepted) setAiAccepted(false);
  };

  const handleFiles = (newFiles) => {
    const selected = Array.from(newFiles).slice(0, 5);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));

    selected.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [
            ...prev,
            { name: file.name, url: e.target.result, type: file.type },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = useCallback(async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter a title and description first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    setAiAccepted(false);
    try {
      const { data } = await api.post("/ai/classify", {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setAiSuggestion(data);
    } catch (err) {
      const msg =
        err.response?.data?.message || "AI analysis is temporarily unavailable.";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  }, [form.title, form.description]);

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    setForm((f) => ({
      ...f,
      category: aiSuggestion.category,
      priority: aiSuggestion.priority,
    }));
    setAiAccepted(true);
    if (errors.category) setErrors((e) => ({ ...e, category: null }));
    toast.success("AI suggestions applied!");
  };

  const handleDismissSuggestion = () => {
    setAiSuggestion(null);
    setAiError(null);
    setAiAccepted(false);
  };

  const canAnalyze = aiEnabled && form.title.trim().length > 0 && form.description.trim().length > 10;

  return (
    <AppShell>
      <div className="page-container">
        <Link to="/student/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Submit a Complaint
            </h1>
            <p className="text-slate-500 mt-1">
              Describe the issue and we'll get it to the right team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="complaint-title" className="label">
                Title *
              </label>
              <input
                id="complaint-title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={`input ${errors.title ? "input-error" : ""}`}
                placeholder="Brief summary of the issue"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="complaint-description" className="label">
                  Description *
                </label>
                <span
                  className={`text-xs ${
                    form.description.length > 2000 ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {form.description.length} / 2000
                </span>
              </div>
              <textarea
                id="complaint-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className={`input resize-none ${errors.description ? "input-error" : ""}`}
                placeholder="Describe the issue in detail — what's wrong, where exactly, when you noticed it..."
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* AI Analyze Button */}
            {aiEnabled && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || aiLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {aiLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
                {!canAnalyze && !aiLoading && (
                  <span className="text-xs text-slate-400">
                    Enter title and description to analyze
                  </span>
                )}
              </div>
            )}

            {/* AI Error */}
            {aiError && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => setAiError(null)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* AI Suggestion Card */}
            {aiSuggestion && (
              <div
                className={`border rounded-xl p-5 transition-all ${
                  aiAccepted
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      {aiAccepted ? "AI Suggestions Applied" : "AI Suggestion"}
                    </h3>
                  </div>
                  {!aiAccepted ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAcceptSuggestion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={handleDismissSuggestion}
                        className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDismissSuggestion}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Undo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Suggested Category</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {CATEGORIES.find((c) => c.value === aiSuggestion.category)?.icon}{" "}
                      {aiSuggestion.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Suggested Priority</p>
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {aiSuggestion.priority}
                    </p>
                  </div>
                </div>

                {aiSuggestion.summary && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Summary</p>
                    <p className="text-sm text-slate-700">{aiSuggestion.summary}</p>
                  </div>
                )}

                {aiSuggestion.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestion.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/80 text-slate-600 text-xs rounded-full border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="label">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, category: c.value });
                      if (errors.category) setErrors({ ...errors, category: null });
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.category === c.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    {c.value}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Location & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="complaint-location" className="label">
                  Location
                </label>
                <input
                  id="complaint-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Room 301, Block B, Hostel 2"
                />
              </div>

              <div>
                <label htmlFor="complaint-priority" className="label">
                  Suggested Priority
                </label>
                <select
                  id="complaint-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input"
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="label">Attachments</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {previews.map((preview, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {files.length > 0 ? (
                    <ImageIcon className="w-5 h-5 text-brand-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Click to upload or drag files"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Images, PDF, DOC up to 5MB each (max 5)
                </p>
              </button>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 py-3"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    Submit Complaint
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
