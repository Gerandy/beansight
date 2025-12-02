import React, { useState, useMemo, useEffect } from "react";
import { Eye, X, ChevronDown } from "lucide-react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

export default function History() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [primarySort, setPrimarySort] = useState("date");
    const [secondarySort, setSecondarySort] = useState("none");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 🔥 Fetch only completed orders from Firestore (real-time)
    useEffect(() => {
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("status", "==", "Completed"),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(data);
        });

        return () => unsubscribe();
    }, []);

    // 💰 Currency formatter
    const currency = (v) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0,
        }).format(v);

    const sortOptions = [
        { value: "date", label: "Date" },
        { value: "total", label: "Total" },
    ];

    const getStatusClasses = (s) =>
        s === "Completed"
            ? "bg-[var(--color-coffee-600)] text-white"
            : s === "Pending"
            ? "bg-[var(--color-coffee-400)] text-[var(--color-coffee-900)]"
            : s === "Cancelled"
            ? "bg-red-200 text-red-800"
            : "bg-[var(--color-coffee-200)] text-[var(--color-coffee-900)]";

    const StatusBadge = ({ status }) => (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${getStatusClasses(
                status
            )}`}
        >
            {status}
        </span>
    );

    const compareValues = (a, b, key) => {
        if (key === "date") return new Date(b.date) - new Date(a.date);
        if (key === "total") return b.total - a.total;
        return a[key]?.toString().localeCompare(b[key]?.toString());
    };

    const visibleOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        const filtered = orders.filter((o) => {
            if (!q) return true;
            return (
                o.customer?.toLowerCase().includes(q) ||
                String(o.id).toLowerCase().includes(q) ||
                o.status?.toLowerCase().includes(q) ||
                o.user?.firstName?.toLowerCase().includes(q) ||
                o.user?.customerName?.toLowerCase().includes(q)
            );
        });
        const sorted = [...filtered].sort((a, b) => {
            const p = compareValues(a, b, primarySort);
            if (p !== 0 || secondarySort === "none") return p;
            return compareValues(a, b, secondarySort);
        });
        return sorted;
    }, [orders, search, primarySort, secondarySort]);

    // 📄 Pagination logic
    const totalPages = Math.ceil(visibleOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return visibleOrders.slice(start, start + itemsPerPage);
    }, [visibleOrders, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, primarySort, secondarySort]);

    return (
        <>
            <div className="p-3 sm:p-4 lg:p-6 bg-[var(--color-coffee-50)] rounded-xl lg:rounded-2xl border border-[var(--color-coffee-100)] shadow-sm">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                    {/* Header */}
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[var(--color-coffee-800)]">
                            📜 Order History
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--color-coffee-700)] mt-1">
                            Completed orders only — search, sort, and view details.
                        </p>
                    </div>

                    {/* 🔍 Search + Sorting Controls */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center bg-white border border-[var(--color-coffee-100)] rounded-md px-2 sm:px-3 py-2 gap-2 w-full">
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-600)] flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                                />
                            </svg>
                            <input
                                aria-label="Search history"
                                placeholder="Search Order ID or Customer"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-xs sm:text-sm text-[var(--color-coffee-800)] w-full"
                            />
                        </div>

                        {/* Sort dropdown */}
                        <div className="relative">
                            <select
                                value={primarySort}
                                onChange={(e) => setPrimarySort(e.target.value)}
                                className="cursor-pointer appearance-none bg-white border border-[var(--color-coffee-100)] text-[var(--color-coffee-800)] font-medium py-2 pl-3 pr-8 rounded-md text-xs sm:text-sm shadow-sm w-full"
                            >
                                {sortOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        Sort: {o.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Items per page selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-[var(--color-coffee-700)]">Show:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="cursor-pointer bg-white border border-[var(--color-coffee-100)] text-[var(--color-coffee-800)] rounded-md px-2 py-1 text-xs shadow-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <span className="text-xs text-[var(--color-coffee-700)]">
                        {Math.min((currentPage - 1) * itemsPerPage + 1, visibleOrders.length)} - {Math.min(currentPage * itemsPerPage, visibleOrders.length)} of {visibleOrders.length}
                    </span>
                </div>

                {/* 🧾 Orders Table/Cards */}
                {visibleOrders.length === 0 ? (
                    <div className="py-8 sm:py-12 text-center text-[var(--color-coffee-700)]">
                        <p className="mb-3 text-sm">No completed orders yet.</p>
                        <small className="text-xs">
                            Completed orders will appear here once marked as done.
                        </small>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-auto rounded-md border border-[var(--color-coffee-100)] bg-white">
                            <table className="w-full text-sm table-auto">
                                <thead className="bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)]">
                                    <tr>
                                        <th className="py-3 px-4 text-left">Order</th>
                                        <th className="py-3 px-4 text-left">Customer</th>
                                        <th className="py-3 px-4 text-left">Date</th>
                                        <th className="py-3 px-4 text-right">Total</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map((o, idx) => (
                                        <tr
                                            key={o.id}
                                            className={`border-t hover:bg-[var(--color-coffee-50)] transition-colors ${
                                                idx % 2 === 0 ? "bg-white" : "bg-[var(--color-coffee-50)]"
                                            }`}
                                        >
                                            <td className="py-3 px-4 font-medium text-[var(--color-coffee-800)]">
                                                #{o.id}
                                            </td>
                                            <td className="py-3 px-4">
                                                {o.user?.firstName || o.user?.customerName || "Anonymous"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-xs text-[var(--color-coffee-700)]">
                                                    {o.createdAt &&
                                                        o.createdAt.toDate().toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        })}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {currency(o.total)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <StatusBadge status={o.status} />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(o)}
                                                    className="cursor-pointer px-3 py-1.5 text-sm bg-white border border-[var(--color-coffee-100)] rounded hover:bg-[var(--color-coffee-50)] transition-colors"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet Cards */}
                        <div className="lg:hidden space-y-3">
                            {paginatedOrders.map((o) => (
                                <div
                                    key={o.id}
                                    className="bg-white rounded-lg shadow-sm border border-[var(--color-coffee-100)] p-3 sm:p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-sm text-[var(--color-coffee-800)]">
                                                #{o.id}
                                            </div>
                                            <div className="text-xs text-[var(--color-coffee-700)] mt-1">
                                                {o.user?.firstName || o.user?.customerName || "Anonymous"}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mt-1">
                                                {o.createdAt &&
                                                    o.createdAt.toDate().toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-[var(--color-coffee-800)]">
                                                {currency(o.total)}
                                            </div>
                                            <div className="mt-2">
                                                <StatusBadge status={o.status} />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedOrder(o)}
                                        className="cursor-pointer w-full px-3 py-2 bg-[var(--color-coffee-500)] hover:bg-[var(--color-coffee-600)] text-white rounded text-xs sm:text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 📄 Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-[var(--color-coffee-100)] rounded-md hover:bg-[var(--color-coffee-50)] text-[var(--color-coffee-800)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ← Previous
                                </button>

                                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`cursor-pointer px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-semibold transition-colors ${
                                                        currentPage === page
                                                            ? "bg-[var(--color-coffee-600)] text-white"
                                                            : "bg-white border border-[var(--color-coffee-100)] text-[var(--color-coffee-800)] hover:bg-[var(--color-coffee-50)]"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return (
                                                <span key={page} className="text-[var(--color-coffee-700)] text-xs">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-[var(--color-coffee-100)] rounded-md hover:bg-[var(--color-coffee-50)] text-[var(--color-coffee-800)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 🪟 Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-800 bg-white rounded-full p-1 shadow-sm"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg sm:text-xl font-bold text-[var(--color-coffee-800)] mb-3 pr-8">
                            Order #{selectedOrder.id}
                        </h3>

                        <div className="text-xs sm:text-sm text-[var(--color-coffee-700)] space-y-2">
                            <div className="flex justify-between">
                                <strong>Date:</strong>
                                <span className="text-right">
                                    {selectedOrder.createdAt &&
                                        selectedOrder.createdAt.toDate().toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <strong>Customer:</strong>
                                <span>{selectedOrder.user?.firstName || selectedOrder.user?.customerName || "Anonymous"}</span>
                            </div>
                            <div className="flex justify-between">
                                <strong>Payment:</strong>
                                <span>{selectedOrder.paymentMethod || selectedOrder.paymentType || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <strong>Type:</strong>
                                <span>{selectedOrder.source === "POS" ? "Walk In" : "Online"}</span>
                            </div>
                            {selectedOrder.staff && (
                                <div className="flex justify-between">
                                    <strong>Cashier:</strong>
                                    <span>{selectedOrder.staff}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <strong>Status:</strong>
                                <StatusBadge status={selectedOrder.status} />
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="mt-4 border-t pt-3">
                                <h4 className="font-semibold mb-2 text-sm sm:text-base text-[var(--color-coffee-800)]">
                                    Items
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-coffee-700)]">
                                    {selectedOrder.items.map((i, idx) => (
                                        <li key={idx} className="flex justify-between gap-2">
                                            <span className="flex-1">
                                                {i.name} <span className="text-[var(--color-coffee-600)]">x{i.quantity}</span>
                                            </span>
                                            <span className="font-medium text-[var(--color-coffee-800)]">
                                                {currency(i.price * i.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-4 border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm sm:text-base font-bold text-[var(--color-coffee-800)]">Total:</span>
                                <span className="text-lg sm:text-xl font-bold text-[var(--color-coffee-800)]">
                                    {currency(selectedOrder.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
