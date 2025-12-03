import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Activity,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  MapPin
} from "lucide-react";

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
  {
    id: 4,
    date: "2025-11-27 14:20",
    user: "staff2",
    action: "Product updated",
    details: "Changed price of Coffee Latte to ₱120",
    type: "product",
    ip: "192.168.1.12",
  },
  {
    id: 5,
    date: "2025-11-27 11:30",
    user: "admin",
    action: "User created",
    details: "New staff account: staff3",
    type: "user",
    ip: "192.168.1.10",
  },
];

const logTypes = [
  { value: "", label: "All Types", color: "gray" },
  { value: "order", label: "Order", color: "blue" },
  { value: "settings", label: "Settings", color: "purple" },
  { value: "login", label: "Login", color: "green" },
  { value: "product", label: "Product", color: "orange" },
  { value: "user", label: "User", color: "pink" },
];

// Type badge component
const TypeBadge = ({ type }) => {
  const typeConfig = logTypes.find(t => t.value === type) || logTypes[0];
  const colors = {
    gray: "bg-gray-100 text-gray-700 border-gray-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    green: "bg-green-100 text-green-700 border-green-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    pink: "bg-pink-100 text-pink-700 border-pink-300",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[typeConfig.color]}`}>
      {typeConfig.label}
    </span>
  );
};

// Details Modal
const DetailsModal = ({ log, onClose }) => {
  if (!log) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 relative transform transition-all animate-scaleIn" 
        onClick={e => e.stopPropagation()}
      >
        <button
          className="cursor-pointer absolute top-4 right-4 text-coffee-400 hover:text-coffee-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-coffee-100 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-coffee-700" />
          </div>
          <h3 className="text-2xl font-bold text-coffee-900">Log Details</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Date & Time</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{log.date}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <User className="w-4 h-4" />
              <span className="font-semibold">User</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{log.user}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <Activity className="w-4 h-4" />
              <span className="font-semibold">Action</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{log.action}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <Info className="w-4 h-4" />
              <span className="font-semibold">Details</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{log.details}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
              <div className="text-coffee-600 text-sm font-semibold mb-2">Type</div>
              <TypeBadge type={log.type} />
            </div>

            <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
              <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">IP Address</span>
              </div>
              <div className="text-coffee-900 font-medium font-mono text-sm">{log.ip}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="cursor-pointer w-full mt-6 bg-coffee-700 hover:bg-coffee-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function AuditLog() {
  const [logs] = useState(sampleLogs);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [modalLog, setModalLog] = useState(null);
  const logsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error] = useState("");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, []);

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
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const inputClass = "p-3 rounded-xl border-2 border-coffee-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition placeholder:text-coffee-400 text-coffee-900 font-medium hover:border-coffee-300";

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-coffee-600 p-3 rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-coffee-900">Audit Log</h2>
          </div>
          <p className="text-coffee-600 text-lg leading-relaxed max-w-3xl">
            Track all important actions and changes made in your store. Search, filter, and export logs for compliance and security monitoring. Logs are retained for 90 days.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-800 border-l-4 border-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Failed to load logs. Please try again later.</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-coffee-100 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Filter className="w-5 h-5 text-coffee-700" />
            <h3 className="text-xl font-bold text-coffee-900">Filters & Search</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="User, action, or details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Type
              </label>
              <select
                className={inputClass + " cursor-pointer"}
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {logTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-coffee-200">
            <button
              className="cursor-pointer bg-coffee-700 hover:bg-coffee-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
                setType("");
                setPage(1);
              }}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-coffee-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-coffee-100 to-coffee-50 border-b-2 border-coffee-200">
                  <th 
                    className="p-4 text-left font-bold text-coffee-800 cursor-pointer hover:bg-coffee-200 transition group"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date/Time
                      <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left font-bold text-coffee-800 cursor-pointer hover:bg-coffee-200 transition group"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                      <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortBy === "user" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left font-bold text-coffee-800 cursor-pointer hover:bg-coffee-200 transition group"
                    onClick={() => handleSort("action")}
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Action
                      <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortBy === "action" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Details
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">Type</th>
                  <th className="p-4 text-left font-bold text-coffee-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      IP
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-coffee-300" />
                        <p className="text-coffee-400 text-lg font-medium">No logs found</p>
                        <p className="text-coffee-500 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedLogs.map((log, idx) => (
                    <tr 
                      key={log.id} 
                      className={`border-t border-coffee-100 hover:bg-coffee-50 transition cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-coffee-50/30'
                      }`}
                      onClick={() => setModalLog(log)}
                    >
                      <td className="p-4 text-coffee-800 font-medium">{log.date}</td>
                      <td className="p-4">
                        <span className="text-coffee-700 font-semibold hover:underline">
                          {log.user}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-coffee-700 font-medium hover:underline">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-coffee-600">
                        {log.details.length > 40 ? log.details.slice(0, 40) + "..." : log.details}
                      </td>
                      <td className="p-4">
                        <TypeBadge type={log.type} />
                      </td>
                      <td className="p-4 text-coffee-600 font-mono text-sm">{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-coffee-200 bg-coffee-50">
              <div className="text-sm text-coffee-600">
                Showing {((page - 1) * logsPerPage) + 1} to {Math.min(page * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-white border-2 border-coffee-300 text-coffee-700 font-semibold hover:bg-coffee-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`px-4 py-2 rounded-xl font-semibold transition ${
                            page === pageNum
                              ? 'bg-coffee-700 text-white shadow-md'
                              : 'bg-white border-2 border-coffee-300 text-coffee-700 hover:bg-coffee-100'
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-2 text-coffee-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className="px-4 py-2 rounded-xl bg-white border-2 border-coffee-300 text-coffee-700 font-semibold hover:bg-coffee-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal log={modalLog} onClose={() => setModalLog(null)} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}