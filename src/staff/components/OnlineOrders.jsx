import React, { useState, useMemo } from "react";

export default function OnlineOrders() {
  const [orders, setOrders] = useState([
    { id: "O-1024", customer: "Maria", items: [{ name: "Latte", qty: 1 }, { name: "Croissant", qty: 1 }], itemCount: 2, total: 220, status: "Pending", placedAt: "2025-10-25T09:12:00" },
    { id: "O-1025", customer: "Alex", items: [{ name: "Americano", qty: 1 }], itemCount: 1, total: 120, status: "Preparing", placedAt: "2025-10-25T09:30:00" },
    { id: "O-1026", customer: "Brian", items: [{ name: "Cappuccino", qty: 2 }], itemCount: 2, total: 260, status: "Ready", placedAt: "2025-10-25T09:34:00" },
  ]);
  const [expanded, setExpanded] = useState([]); // list of expanded order ids
  const [filter, setFilter] = useState("All"); // All | Pending | Preparing | Ready | Completed
  const [search, setSearch] = useState("");
  const [primarySort, setPrimarySort] = useState("placedAt"); // placedAt / total / customer / status
  const [secondarySort, setSecondarySort] = useState("none"); // none or same options
  const [toast, setToast] = useState(null); // { message, tone } or null

  // currency helper (PHP)
  const currency = (v) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(v);

  // small helper: update status
  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    // quick toast feedback
    setToast({ message: `Order ${id} → ${newStatus}`, tone: newStatus === "Ready" || newStatus === "Completed" ? "success" : "info" });
    // auto-hide toast
    setTimeout(() => setToast(null), 2300);
  };

  // toggle expand
  const toggleExpand = (id) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  // StatusBadge component
  const StatusBadge = ({ status }) => {
    const map = {
      Pending: "bg-coffee-200 text-coffee-800",
      Preparing: "bg-sky-100 text-sky-800",
      Ready: "bg-coffee-500 text-white",
      Completed: "bg-slate-100 text-slate-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
  };

  // sorting helpers: returns comparator for key
  const compareForKey = (key, a, b) => {
    if (key === "placedAt") return new Date(b.placedAt) - new Date(a.placedAt); // newest first
    if (key === "total") return b.total - a.total; // highest first
    if (key === "customer") return a.customer.localeCompare(b.customer); // A -> Z
    if (key === "status") return a.status.localeCompare(b.status); // grouped alphabetically - we will keep this
    return 0;
  };

  // filtered + sorted orders (memoized)
  const visibleOrders = useMemo(() => {
    // filter by search and status
    const s = search.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!s) return true;
      return o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s);
    });

    // sort with primary and optional secondary
    const sorted = [...filtered].sort((a, b) => {
      const p = compareForKey(primarySort, a, b);
      if (p !== 0 || secondarySort === "none") return p;
      return compareForKey(secondarySort, a, b);
    });

    return sorted;
  }, [orders, search, filter, primarySort, secondarySort]);

  // small UI helpers
  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateTime = (iso) => new Date(iso).toLocaleString();

  return (
    <>
      <div className="bg-coffee-50 rounded-xl shadow p-3 sm:p-5">
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-coffee-800">📦 Online Orders</h2>
            <p className="text-xs sm:text-sm text-coffee-700">Manage incoming orders from online channels.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center bg-white border border-coffee-200 rounded-md px-2 py-1.5 gap-2 w-full">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-coffee-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
              <input 
                aria-label="Search orders" 
                placeholder="Search by id or customer..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="bg-transparent outline-none text-sm text-coffee-800 w-full" 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 text-xs sm:text-sm py-2 px-3 rounded-md shadow-sm">
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select value={primarySort} onChange={(e) => setPrimarySort(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 text-xs sm:text-sm py-2 px-3 rounded-md shadow-sm">
                <option value="placedAt">Sort: Newest</option>
                <option value="total">Sort: Total</option>
                <option value="customer">Sort: Customer</option>
                <option value="status">Sort: Status</option>
              </select>

              <select value={secondarySort} onChange={(e) => setSecondarySort(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 text-xs sm:text-sm py-2 px-3 rounded-md shadow-sm">
                <option value="none">No secondary</option>
                <option value="placedAt">Then: Newest</option>
                <option value="total">Then: Total</option>
                <option value="customer">Then: Customer</option>
                <option value="status">Then: Status</option>
              </select>
            </div>

            <button 
              onClick={() => { 
                navigator.clipboard?.writeText(JSON.stringify(orders)); 
                setToast({ message: "Orders copied to clipboard", tone: "info" }); 
                setTimeout(()=>setToast(null),2000); 
              }} 
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-md border border-coffee-200 bg-white text-coffee-800 hover:bg-coffee-100 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="py-12 text-center text-coffee-700">
            <p className="mb-3 text-sm">No orders match your filters.</p>
            <small className="text-xs">Try clearing the search or filters.</small>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-auto rounded-md border border-coffee-200">
              <table className="w-full text-sm">
                <thead className="bg-coffee-100 text-coffee-800">
                  <tr>
                    <th className="py-3 px-4 text-left">Order</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order, idx) => (
                    <React.Fragment key={order.id}>
                      <tr className={`border-t hover:bg-coffee-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-coffee-50"}`}>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-coffee-800">{order.id}</div>
                            <div className="text-xs text-coffee-700">{formatTime(order.placedAt)}</div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-coffee-200 text-coffee-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">{order.customer[0]}</div>
                            <div>
                              <div className="font-medium text-coffee-800">{order.customer}</div>
                              <div className="text-xs text-coffee-700">Online</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">{order.itemCount}</td>
                        <td className="py-3 px-4 text-right font-medium text-coffee-800">{currency(order.total)}</td>
                        <td className="py-3 px-4 text-center"><StatusBadge status={order.status} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => toggleExpand(order.id)} className="px-3 py-1.5 text-xs bg-white border border-coffee-200 rounded hover:bg-coffee-50 transition-colors">
                              {expanded.includes(order.id) ? "Hide" : "Details"}
                            </button>

                            {order.status === "Pending" && <button onClick={() => handleStatusChange(order.id, "Preparing")} className="px-3 py-1.5 text-xs bg-coffee-600 text-white rounded hover:bg-coffee-700 transition-colors">Accept</button>}
                            {order.status === "Preparing" && <button onClick={() => handleStatusChange(order.id, "Ready")} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Ready</button>}
                            {order.status === "Ready" && <button onClick={() => handleStatusChange(order.id, "Completed")} className="px-3 py-1.5 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">Complete</button>}
                          </div>
                        </td>
                      </tr>

                      {expanded.includes(order.id) && (
                        <tr className="bg-coffee-50">
                          <td colSpan="6" className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-coffee-700">
                              <div>
                                <div className="text-xs font-semibold mb-2 text-coffee-800">Items</div>
                                <ul className="space-y-1">
                                  {order.items.map((it, i) => (
                                    <li key={i} className="flex justify-between">
                                      <span>{it.name}</span>
                                      <span className="text-coffee-800 font-medium">x{it.qty}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <div className="text-xs font-semibold mb-2 text-coffee-800">Notes</div>
                                <div className="text-sm">No special instructions.</div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold mb-2 text-coffee-800">Order Info</div>
                                <div className="text-xs"><strong>Placed:</strong> {formatDateTime(order.placedAt)}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {visibleOrders.map((order) => (
                <div key={order.id} className="border border-coffee-200 rounded-lg p-3 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-coffee-200 text-coffee-800 flex items-center justify-center font-semibold text-sm flex-shrink-0">{order.customer[0]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-coffee-800 text-sm truncate">{order.customer}</div>
                        <div className="text-xs text-coffee-700">{order.id} · {formatTime(order.placedAt)}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-coffee-800">{currency(order.total)}</div>
                      <div className="mt-1"><StatusBadge status={order.status} /></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button onClick={() => toggleExpand(order.id)} className="text-xs px-3 py-1.5 bg-white border border-coffee-200 rounded hover:bg-coffee-50 transition-colors">
                      {expanded.includes(order.id) ? "Hide" : "Details"}
                    </button>

                    <div className="flex gap-2">
                      {order.status === "Pending" && <button onClick={() => handleStatusChange(order.id, "Preparing")} className="px-3 py-1.5 text-xs bg-coffee-600 text-white rounded hover:bg-coffee-700 transition-colors">Accept</button>}
                      {order.status === "Preparing" && <button onClick={() => handleStatusChange(order.id, "Ready")} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Ready</button>}
                      {order.status === "Ready" && <button onClick={() => handleStatusChange(order.id, "Completed")} className="px-3 py-1.5 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">Complete</button>}
                    </div>
                  </div>

                  {expanded.includes(order.id) && (
                    <div className="mt-3 border-t border-coffee-200 pt-3 text-sm text-coffee-700">
                      <div className="mb-2 font-semibold text-coffee-800 text-xs">Items</div>
                      <ul className="space-y-1.5">
                        {order.items.map((it, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span>{it.name}</span>
                            <span className="text-coffee-800 font-medium">x{it.qty}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 text-xs text-coffee-700">Placed: {formatDateTime(order.placedAt)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className={`fixed right-4 bottom-6 z-50 rounded-lg px-4 py-2.5 shadow-lg text-sm ${toast.tone === "success" ? "bg-green-600 text-white" : "bg-coffee-800 text-white"}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
