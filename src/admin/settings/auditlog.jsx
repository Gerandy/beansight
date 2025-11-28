import React, { useState } from "react";

const sampleLogs = [
  {
    id: 1,
    date: "2025-11-28 09:15",
    user: "admin",
    action: "Order created",
    details: "Order #12345 for ₱500",
    type: "order",
    ip: "192.168.1.10",
  },
  {
    id: 2,
    date: "2025-11-28 10:02",
    user: "staff1",
    action: "Settings changed",
    details: "Updated tax rate to 12%",
    type: "settings",
    ip: "192.168.1.11",
  },
  {
    id: 3,
    date: "2025-11-27 16:44",
    user: "admin",
    action: "User login",
    details: "Logged in from IP 192.168.1.10",
    type: "login",
    ip: "192.168.1.10",
  },
];

const logTypes = [
  { value: "", label: "All Types" },
  { value: "order", label: "Order" },
  { value: "settings", label: "Settings" },
  { value: "login", label: "Login" },
];

export default function AuditLog() {
  const [logs] = useState(sampleLogs);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [modalLog, setModalLog] = useState(null);
  const logsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [error] = useState(""); // Simulate error handling

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const logDate = new Date(log.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesDate =
      (!fromDate || logDate >= fromDate) &&
      (!toDate || logDate <= toDate);
    const matchesType = !type || log.type === type;
    return matchesSearch && matchesDate && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * logsPerPage,
    page * logsPerPage
  );

  // Export logs as CSV
  const handleExport = () => {
    const csv =
      "Date,User,Action,Details,Type,IP\n" +
      filteredLogs
        .map(
          log =>
            `"${log.date}","${log.user}","${log.action}","${log.details}","${log.type}","${log.ip}"`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditlog.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sorting
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const sortedLogs = [...paginatedLogs].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Modal for details
  const DetailsModal = ({ log, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-2 right-3 text-coffee-700 text-xl font-bold cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4 text-coffee-900">Log Details</h3>
        <div className="mb-2"><strong>Date/Time:</strong> {log.date}</div>
        <div className="mb-2"><strong>User:</strong> {log.user}</div>
        <div className="mb-2"><strong>Action:</strong> {log.action}</div>
        <div className="mb-2"><strong>Details:</strong> {log.details}</div>
        <div className="mb-2"><strong>Type:</strong> {log.type}</div>
        <div className="mb-2"><strong>IP Address:</strong> {log.ip}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pt-8">
      <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="audit">📜</span> Audit Log
      </h2>
      <p className="mb-8 text-coffee-700 text-base">
        View all important actions and changes made in your store. Use search and filters to find specific events. Click <span className="text-coffee-700 font-bold">ⓘ</span> for more info about each column. Logs are kept for 90 days.
      </p>
      {loading && (
        <div className="mb-4 text-coffee-700 font-medium">Loading logs...</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 font-medium">Failed to load logs.</div>
      )}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          className="p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg text-coffee-900 font-medium"
          placeholder="Search by user, action, or details"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg text-coffee-900 font-medium"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg text-coffee-900 font-medium"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
        <select
          className="p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg text-coffee-900 font-medium"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {logTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition cursor-pointer"
          onClick={handleExport}
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-soft-xl border border-coffee-100 bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-coffee-50">
              <th className="p-4 font-semibold text-coffee-800 cursor-pointer" onClick={() => {
                setSortBy("date");
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              }}>
                Date/Time
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="When the action happened"
                >ⓘ</button>
              </th>
              <th className="p-4 font-semibold text-coffee-800 cursor-pointer" onClick={() => {
                setSortBy("user");
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              }}>
                User
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="Who performed the action"
                >ⓘ</button>
              </th>
              <th className="p-4 font-semibold text-coffee-800 cursor-pointer" onClick={() => {
                setSortBy("action");
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              }}>
                Action
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="What was done"
                >ⓘ</button>
              </th>
              <th className="p-4 font-semibold text-coffee-800">
                Details
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="More information"
                >ⓘ</button>
              </th>
              <th className="p-4 font-semibold text-coffee-800">
                Type
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="Type of action"
                >ⓘ</button>
              </th>
              <th className="p-4 font-semibold text-coffee-800">
                IP Address
                <button
                  type="button"
                  className="ml-1 text-xs text-coffee-700 cursor-pointer"
                  title="IP address of user"
                >ⓘ</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-coffee-400">
                  No logs found.
                </td>
              </tr>
            ) : (
              sortedLogs.map(log => (
                <tr key={log.id} className="border-t border-coffee-100 hover:bg-coffee-50 transition">
                  <td className="p-4">{log.date}</td>
                  <td className="p-4">
                    <button
                      className="underline text-coffee-700 cursor-pointer"
                      onClick={() => setModalLog(log)}
                      title="View user details"
                    >
                      {log.user}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      className="underline text-coffee-700 cursor-pointer"
                      onClick={() => setModalLog(log)}
                      title="View action details"
                    >
                      {log.action}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      className="underline text-coffee-700 cursor-pointer"
                      onClick={() => setModalLog(log)}
                      title="View full details"
                    >
                      {log.details.length > 30 ? log.details.slice(0, 30) + "..." : log.details}
                    </button>
                  </td>
                  <td className="p-4">{log.type}</td>
                  <td className="p-4">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-6 justify-end">
          <button
            className="px-3 py-1 rounded-xl bg-coffee-200 text-coffee-900 font-semibold shadow cursor-pointer"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="px-3 py-1 rounded-xl bg-coffee-50 text-coffee-700 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-xl bg-coffee-200 text-coffee-900 font-semibold shadow cursor-pointer"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {/* Details Modal */}
      {modalLog && <DetailsModal log={modalLog} onClose={() => setModalLog(null)} />}
    </div>
  );
}