import React, { useState, useEffect } from "react";
import {
  Archive,
  Download,
  Filter,
  Search,
  Calendar,
  Package,
  ShoppingCart,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const sampleArchiveData = [
  {
    id: 1,
    date: "2025-11-15 14:30",
    type: "order",
    name: "Order #12340",
    details: "Customer: John Doe - Total: ₱850",
    archivedBy: "admin",
    reason: "Completed and processed",
  },
  {
    id: 2,
    date: "2025-11-10 09:20",
    type: "product",
    name: "Caramel Macchiato",
    details: "Price: ₱150 - Category: Coffee",
    archivedBy: "staff1",
    reason: "Seasonal item ended",
  },
  {
    id: 3,
    date: "2025-11-05 16:45",
    type: "order",
    name: "Order #12335",
    details: "Customer: Jane Smith - Total: ₱1,200",
    archivedBy: "admin",
    reason: "Completed and processed",
  },
  {
    id: 4,
    date: "2025-11-01 11:15",
    type: "document",
    name: "Sales Report Oct 2025",
    details: "Monthly report - 245 pages",
    archivedBy: "admin",
    reason: "Monthly archival",
  },
  {
    id: 5,
    date: "2025-10-28 13:50",
    type: "product",
    name: "Pumpkin Spice Latte",
    details: "Price: ₱180 - Category: Seasonal",
    archivedBy: "staff2",
    reason: "Out of season",
  },
];

const archiveTypes = [
  { value: "", label: "All Types", color: "gray", icon: Archive },
  { value: "order", label: "Order", color: "blue", icon: ShoppingCart },
  { value: "product", label: "Product", color: "orange", icon: Package },
  { value: "document", label: "Document", color: "purple", icon: FileText },
];

// Type badge component
const TypeBadge = ({ type }) => {
  const typeConfig = archiveTypes.find(t => t.value === type) || archiveTypes[0];
  const colors = {
    gray: "bg-gray-100 text-gray-700 border-gray-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
  };
  
  const Icon = typeConfig.icon;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[typeConfig.color]} flex items-center gap-1.5 w-fit`}>
      <Icon className="w-3.5 h-3.5" />
      {typeConfig.label}
    </span>
  );
};

// Details Modal
const DetailsModal = ({ item, onClose, onRestore, onDelete }) => {
  if (!item) return null;
  
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
          className="absolute top-4 right-4 text-coffee-400 hover:text-coffee-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-coffee-100 p-3 rounded-xl">
            <Archive className="w-6 h-6 text-coffee-700" />
          </div>
          <h3 className="text-2xl font-bold text-coffee-900">Archive Details</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Archived Date</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{item.date}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="text-coffee-600 text-sm font-semibold mb-2">Type</div>
            <div className="ml-0">
              <TypeBadge type={item.type} />
            </div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <Package className="w-4 h-4" />
              <span className="font-semibold">Name</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{item.name}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">Details</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{item.details}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <User className="w-4 h-4" />
              <span className="font-semibold">Archived By</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{item.archivedBy}</div>
          </div>

          <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <div className="flex items-center gap-2 text-coffee-600 text-sm mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Reason</span>
            </div>
            <div className="text-coffee-900 font-medium ml-6">{item.reason}</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              onRestore(item.id);
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
          <button
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function ArchivePage() {
  const [archives, setArchives] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [modalItem, setModalItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = collection(db, "archives");
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setError(null);
      setArchives(data);
      setLoading(false);
    }, (err) => {
      console.error("Failed to load archives:", err);
      setError(err?.message || "Failed to load archives");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRestore = async (archiveId) => {
    const archRef = doc(db, "archives", archiveId);
    const snap = await getDoc(archRef);
    if (!snap.exists()) return alert("Archive not found");

    const item = snap.data();

    try {
      if (item.type === "product") {
        // restore to Inventory (use originalId if available)
        if (item.originalId) {
          await setDoc(doc(db, "Inventory", item.originalId), item.originalData);
        } else {
          await addDoc(collection(db, "Inventory"), item.originalData || {});
        }
      } else if (item.type === "user") {
        if (item.originalId) {
          await setDoc(doc(db, "users", item.originalId), item.originalData);
        } else {
          await addDoc(collection(db, "users"), item.originalData || {});
        }
      } else if (item.type === "order") {
        if (item.originalId) {
          await setDoc(doc(db, "orders", item.originalId), item.originalData);
        } else {
          await addDoc(collection(db, "orders"), item.originalData || {});
        }
      } else {
        // generic restore: save originalData to a collection matching type
        await addDoc(collection(db, item.type || "restored"), item.originalData || {});
      }

      // delete archive doc after successful restore
      await deleteDoc(archRef);
      setArchives(prev => prev.filter(a => a.id !== archiveId));
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore item.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this archive?")) return;
    try {
      await deleteDoc(doc(db, "archives", id));
      setArchives(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete archive:", err);
      alert("Failed to delete archive.");
    }
  };

  // Filter archives
  const filteredArchives = archives.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase()) ||
      item.archivedBy.toLowerCase().includes(search.toLowerCase());
    const itemDate = new Date(item.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesDate =
      (!fromDate || itemDate >= fromDate) &&
      (!toDate || itemDate <= toDate);
    const matchesType = !type || item.type === type;
    return matchesSearch && matchesDate && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArchives.length / itemsPerPage);
  const paginatedItems = filteredArchives.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Export as CSV
  const handleExport = () => {
    const csv =
      "Date,Type,Name,Details,Archived By,Reason\n" +
      filteredArchives
        .map(
          item =>
            `"${item.date}","${item.type}","${item.name}","${item.details}","${item.archivedBy}","${item.reason}"`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archive-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sorting
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const sortedItems = [...paginatedItems].sort((a, b) => {
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
              <Archive className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-coffee-900">Archive</h2>
          </div>
          <p className="text-coffee-600 text-lg leading-relaxed max-w-3xl">
            View and manage archived items from your store. Restore items to active status or permanently delete them. Archived items are kept for 180 days before automatic deletion.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-800 border-l-4 border-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Failed to load archives. Please try again later.</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {archives.filter(a => a.type === "order").length}
              </span>
            </div>
            <p className="text-blue-100 font-medium">Archived Orders</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {archives.filter(a => a.type === "product").length}
              </span>
            </div>
            <p className="text-orange-100 font-medium">Archived Products</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {archives.filter(a => a.type === "document").length}
              </span>
            </div>
            <p className="text-purple-100 font-medium">Archived Documents</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Archive className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{archives.length}</span>
            </div>
            <p className="text-gray-100 font-medium">Total Archived</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-coffee-100 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Filter className="w-5 h-5 text-coffee-700" />
            <h3 className="text-xl font-bold text-coffee-900">Filters & Search</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Name, details, or user..."
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Type
              </label>
              <select
                className={inputClass + " cursor-pointer"}
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {archiveTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-coffee-200">
            <button
              className="bg-coffee-700 hover:bg-coffee-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
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
                      Date Archived
                      <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Type
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left font-bold text-coffee-800 cursor-pointer hover:bg-coffee-200 transition group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Name
                      <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Details
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Archived By
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-coffee-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Archive className="w-12 h-12 text-coffee-300" />
                        <p className="text-coffee-400 text-lg font-medium">No archived items found</p>
                        <p className="text-coffee-500 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`border-t border-coffee-100 hover:bg-coffee-50 transition ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-coffee-50/30'
                      }`}
                    >
                      <td className="p-4 text-coffee-800 font-medium">{item.date}</td>
                      <td className="p-4">
                        <TypeBadge type={item.type} />
                      </td>
                      <td 
                        className="p-4 text-coffee-700 font-semibold hover:underline cursor-pointer"
                        onClick={() => setModalItem(item)}
                      >
                        {item.name}
                      </td>
                      <td className="p-4 text-coffee-600">
                        {item.details.length > 50 ? item.details.slice(0, 50) + "..." : item.details}
                      </td>
                      <td className="p-4 text-coffee-700 font-medium">{item.archivedBy}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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
                Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredArchives.length)} of {filteredArchives.length} items
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
      <DetailsModal 
        item={modalItem} 
        onClose={() => setModalItem(null)}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />

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