import React, { useState, useMemo, useEffect } from "react";
import { Eye, X, ChevronDown, Package, User, MapPin, Clock, Phone, Mail, CreditCard } from "lucide-react";
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
        if (key === "date") {
            // Fix: Use createdAt timestamp instead of date field
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB - dateA; // Most recent first
        }
        if (key === "total") return (b.total || 0) - (a.total || 0);
        return String(a[key] || "").localeCompare(String(b[key] || ""));
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

    const closeOrderModal = () => {
        setSelectedOrder(null);
    };

    const formatTime = (iso) =>
        new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

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
                                                    className="cursor-pointer px-3 py-1.5 text-xs bg-white border border-[var(--color-coffee-200)] rounded-full hover:bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)] font-semibold transition-colors shadow"
                                                >
                                                    View Details
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
                                        className="cursor-pointer w-full px-3 py-2 text-xs bg-white border border-[var(--color-coffee-200] rounded-md hover:bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)] font-semibold transition-colors"
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

            {/* 🪟 Improved Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-[var(--color-coffee-600)] text-white p-4 sm:p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Details
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--color-coffee-100)] mt-1">
                                    {selectedOrder.createdAt &&
                                        formatDate(selectedOrder.createdAt.toDate())} at{" "}
                                    {selectedOrder.createdAt &&
                                        formatTime(selectedOrder.createdAt.toDate())}
                                </p>
                            </div>
                            <button
                                onClick={closeOrderModal}
                                className="cursor-pointer p-2 hover:bg-[var(--color-coffee-700)] rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[var(--color-coffee-50)] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-[var(--color-coffee-600)]" />
                                        <h4 className="font-semibold text-[var(--color-coffee-800)]">
                                            Customer Information
                                        </h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-[var(--color-coffee-600)]">Name:</span>{" "}
                                            <span className="font-medium text-[var(--color-coffee-900)]">
                                                {selectedOrder.user?.firstName || selectedOrder.user?.customerName || "Anonymous"}
                                            </span>
                                        </div>
                                        {selectedOrder.user?.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-[var(--color-coffee-600)]" />
                                                <span className="text-[var(--color-coffee-900)]">
                                                    {selectedOrder.user.email}
                                                </span>
                                            </div>
                                        )}
                                        {selectedOrder.user?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-[var(--color-coffee-600)]" />
                                                <span className="text-[var(--color-coffee-900)]">
                                                    {selectedOrder.user.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[var(--color-coffee-50)] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-4 h-4 text-[var(--color-coffee-600)]" />
                                        <h4 className="font-semibold text-[var(--color-coffee-800)]">
                                            Order Details
                                        </h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-[var(--color-coffee-600)]">Order ID:</span>{" "}
                                            <span className="font-medium text-[var(--color-coffee-900)]">
                                                #{selectedOrder.id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[var(--color-coffee-600)]">Type:</span>{" "}
                                            <span className="font-medium text-[var(--color-coffee-900)] bg-[var(--color-coffee-200)] text-[var(--color-coffee-700)] text-xs px-2 py-1 rounded-full capitalize">
                                                {selectedOrder.source === "POS" ? "Walk In" : "Online"}
                                            </span>
                                        </div>
                                        {selectedOrder.staff && (
                                            <div>
                                                <span className="text-[var(--color-coffee-600)]">Cashier:</span>{" "}
                                                <span className="text-[var(--color-coffee-900)]">
                                                    {selectedOrder.staff}
                                                </span>
                                            </div>
                                        )}
                                        {selectedOrder.user?.address?.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3 h-3 text-[var(--color-coffee-600)] mt-0.5 flex-shrink-0" />
                                                <span className="text-[var(--color-coffee-900)] text-xs">
                                                    {selectedOrder.user.address.address}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Status & Payment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[var(--color-coffee-50)] rounded-lg p-4">
                                    <h4 className="font-semibold text-[var(--color-coffee-800)] mb-2">
                                        Status
                                    </h4>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                                <div className="bg-[var(--color-coffee-50)] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-4 h-4 text-[var(--color-coffee-600)]" />
                                        <h4 className="font-semibold text-[var(--color-coffee-800)]">
                                            Payment Method
                                        </h4>
                                    </div>
                                    <span className="text-sm text-[var(--color-coffee-900)] uppercase font-medium">
                                        {selectedOrder.paymentMethod || selectedOrder.paymentType || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-[var(--color-coffee-800)] mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Order Items
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-[var(--color-coffee-50)] rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-[var(--color-coffee-900)]">
                                                            {item.name}
                                                        </div>
                                                        {item.size && (
                                                            <div className="text-xs text-[var(--color-coffee-600)]">
                                                                Size: {item.size}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-[var(--color-coffee-900)]">
                                                            {currency(item.price * item.quantity)}
                                                        </div>
                                                        <div className="text-xs text-[var(--color-coffee-600)]">
                                                            {currency(item.price)} × {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Add-ons */}
                                                {item.addons && item.addons.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-[var(--color-coffee-200)]">
                                                        <div className="text-xs font-semibold text-[var(--color-coffee-700)] mb-1">
                                                            Add-ons:
                                                        </div>
                                                        <div className="space-y-1">
                                                            {item.addons.map((addon, addonIdx) => (
                                                                <div
                                                                    key={addonIdx}
                                                                    className="flex justify-between text-xs text-[var(--color-coffee-600)]"
                                                                >
                                                                    <span>
                                                                        • {addon.name}{" "}
                                                                        {addon.quantity > 1 &&
                                                                            `(×${addon.quantity})`}
                                                                    </span>
                                                                    <span>
                                                                        {currency(
                                                                            addon.price * addon.quantity
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="bg-[var(--color-coffee-100)] rounded-lg p-4">
                                <h4 className="font-semibold text-[var(--color-coffee-800)] mb-3">
                                    Order Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-coffee-600)]">Subtotal</span>
                                        <span className="text-[var(--color-coffee-900)]">
                                            {currency(
                                                selectedOrder.items?.reduce(
                                                    (sum, i) =>
                                                        sum + (i.price || 0) * (i.quantity || 0),
                                                    0
                                                ) || 0
                                            )}
                                        </span>
                                    </div>
                                    {selectedOrder.deliveryFee > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-[var(--color-coffee-600)]">
                                                Delivery Fee
                                            </span>
                                            <span className="text-[var(--color-coffee-900)]">
                                                {currency(selectedOrder.deliveryFee)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-[var(--color-coffee-300)]">
                                        <span className="font-semibold text-[var(--color-coffee-800)]">
                                            Total
                                        </span>
                                        <span className="font-bold text-[var(--color-coffee-900)] text-lg">
                                            {currency(selectedOrder.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-[var(--color-coffee-50)] p-4 flex items-center justify-end gap-3 border-t border-[var(--color-coffee-200)]">
                            <button
                                onClick={closeOrderModal}
                                className="cursor-pointer px-4 py-2 text-sm bg-white border border-[var(--color-coffee-200)] rounded-lg hover:bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)] font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
