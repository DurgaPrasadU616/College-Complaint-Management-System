import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react";
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

export default function NewComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Category is required";
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

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
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

            {/* Location */}
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

            {/* Description */}
            <div>
              <label htmlFor="complaint-description" className="label">
                Description *
              </label>
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

              {/* Previews */}
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
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
