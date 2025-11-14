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
			className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getStatusClasses(
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
		const q = search.trim();
		const filtered = orders.filter((o) => {
			if (!q) return true;
			return (
				o.customer?.toLowerCase().includes(q) ||
				String(o.id).includes(q) ||
				o.status?.toLowerCase().includes(q)
			);
		});
		const sorted = [...filtered].sort((a, b) => {
			const p = compareValues(a, b, primarySort);
			if (p !== 0 || secondarySort === "none") return p;
			return compareValues(a, b, secondarySort);
		});
		return sorted;
	}, [orders, search, primarySort, secondarySort]);

	return (
		<>
			<div className="p-6 bg-[var(--color-coffee-50)] rounded-2xl border border-[var(--color-coffee-100)] shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
					<div>
						<h2 className="text-2xl font-semibold text-[var(--color-coffee-800)]">
							📜 Order History
						</h2>
						<p className="text-sm text-[var(--color-coffee-700)]">
							Completed orders only — search, sort, and view details.
						</p>
					</div>

					{/* 🔍 Search + Sorting Controls */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
						<div className="flex items-center bg-white border border-[var(--color-coffee-100)] rounded-md px-2 py-1 gap-2 w-full sm:w-[260px]">
							<svg
								className="w-5 h-5 text-[var(--color-coffee-600)]"
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
								placeholder="Search Order id#"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="bg-transparent outline-none text-sm text-[var(--color-coffee-800)] w-full"
							/>
						</div>

						{/* Sort dropdowns */}
						<div className="flex items-center gap-2">
							<div className="relative">
								<select
									value={primarySort}
									onChange={(e) => setPrimarySort(e.target.value)}
									className="appearance-none bg-white border border-[var(--color-coffee-100)] text-[var(--color-coffee-800)] font-medium py-2 pl-3 pr-8 rounded-md text-sm shadow-sm"
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
				</div>

				{/* 🧾 Orders Table */}
				{visibleOrders.length === 0 ? (
					<div className="py-12 text-center text-[var(--color-coffee-700)]">
						<p className="mb-3">No completed orders yet.</p>
						<small className="text-xs">
							Completed orders will appear here once marked as done.
						</small>
					</div>
				) : (
					<>
						{/* Desktop Table */}
						<div className="hidden md:block overflow-auto rounded-md border border-[var(--color-coffee-100)] bg-white">
							<table className="w-full text-sm table-fixed">
								<thead className="bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)]">
									<tr>
										<th className="py-3 px-4 text-left w-[120px]">Order</th>
										<th className="py-3 px-50 text-left">Customer</th>
										<th className="py-3 px-4 text-left w-36">Date</th>
										<th className="py-3 px-4 text-right w-28">Total</th>
										<th className="py-3 px-4 text-center w-36">Status</th>
										<th className="py-3 px-4 text-right w-28">Action</th>
									</tr>
								</thead>
								<tbody>
									{visibleOrders.map((o, idx) => (

										
										<tr
											key={o.id}
											className={`whitespace-nowrap border-t hover:bg-[var(--color-coffee-50)] transition-colors ${
												idx % 2 === 0 ? "bg-white" : "bg-[var(--color-coffee-50)]"
											}`}
										>
											<td className="py-3 px-4 font-medium text-[var(--color-coffee-800)]">
												#{o.id}
											</td>
											<td className="py-3 px-50">{o.user?.firstName}</td>
											<td className="py-3 px-0">
												{o.date}
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
													className="px-3 py-1 text-sm bg-white border border-[var(--color-coffee-100)] rounded hover:bg-[var(--color-coffee-50)]"
												>
													View
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Cards */}
						<div className="md:hidden space-y-4">
							{visibleOrders.map((o) => (
								<div
									key={o.id}
									className="bg-white rounded-xl shadow-sm border border-[var(--color-coffee-100)] p-4"
								>
									<div className="flex justify-between items-start gap-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)] flex items-center justify-center font-semibold">
												{o.customer?.[0]}
											</div>
											<div>
												<div className="font-medium text-[var(--color-coffee-800)]">
													#{o.id} · {o.customer}
												</div>
												<div className="text-xs text-[var(--color-coffee-700)]">
													{o.date} · {o.time}
												</div>
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

									<div className="mt-3 flex gap-2">
										<button
											onClick={() => setSelectedOrder(o)}
											className="mt-2 w-full px-3 py-2 bg-[var(--color-coffee-500)] hover:bg-[var(--color-coffee-600)] text-white rounded"
										>
											View Details
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>

			{/* 🪟 Modal */}
			{selectedOrder && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
					<div className="bg-white rounded-2xl shadow-2xl w-[90%] sm:w-full sm:max-w-md p-6 relative">
						<button
							onClick={() => setSelectedOrder(null)}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
						>
							<X size={20} />
						</button>
						<h3 className="text-xl font-bold text-[var(--color-coffee-800)] mb-3">
							Order #{selectedOrder.id}
						</h3>

						<div className="text-sm text-[var(--color-coffee-700)] space-y-1">
							<p>
								<strong>Date:</strong> {selectedOrder &&
													 selectedOrder.createdAt.toDate().toLocaleString("en-US", {
													 month: "short",
													 day: "numeric",
													 year: "numeric",
													 hour: "numeric",
													 minute: "2-digit",
													})} 
							</p>
							<p>
								<strong>Customer:</strong> {selectedOrder.user?.firstName}
							</p>
							<p>
								<strong>Payment:</strong> {selectedOrder.paymentMethod}
							</p>
							<p>
								<strong>Type:</strong> {selectedOrder.type}
							</p>
							<p>
								<strong>Cashier:</strong> {selectedOrder.staff}
							</p>
							<p>
								<strong>Status:</strong>{" "}
								<StatusBadge status={selectedOrder.status} />
							</p>
						</div>

						{selectedOrder.items && (
							<div className="mt-4 border-t pt-3">
								<h4 className="font-semibold mb-2 text-[var(--color-coffee-800)]">
									Items
								</h4>
								
								<ul className="space-y-1 text-sm text-[var(--color-coffee-700)]">
									{selectedOrder.items.map((i, idx) => (
										<li key={idx} className="flex justify-between">
											<span>
												{i.name} x{i.quantity}
												<br></br>
												Delivery Fee 
											</span>
											<span className="font-medium">
												{currency(i.price * i.quantity + 50)}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="mt-4 border-t pt-3 text-right">
							<p className="text-lg font-bold text-[var(--color-coffee-800)]">
								Total: {currency(selectedOrder.total)}
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
