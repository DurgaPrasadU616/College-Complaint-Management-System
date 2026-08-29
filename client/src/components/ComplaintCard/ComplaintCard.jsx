export default function ComplaintCard({ complaint }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-semibold">{complaint?.title || "Complaint Title"}</h3>
      <p className="text-sm text-gray-600 mt-1">
        {complaint?.description || "Description placeholder"}
      </p>
      <div className="mt-2 flex gap-2">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {complaint?.category || "Category"}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
          {complaint?.status || "submitted"}
        </span>
      </div>
    </div>
  );
}
