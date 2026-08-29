export default function StatsWidgets({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-2xl font-bold">{stats?.total || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-500">Open</p>
        <p className="text-2xl font-bold">{stats?.open || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-500">Resolved</p>
        <p className="text-2xl font-bold">{stats?.resolved || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-500">Closed</p>
        <p className="text-2xl font-bold">{stats?.closed || 0}</p>
      </div>
    </div>
  );
}
