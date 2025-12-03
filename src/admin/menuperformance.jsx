import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonPieChart,
} from "../components/SkeletonLoader";

// Helper to read Firestore Timestamp | ISO string | Date
function parseDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export default function MenuPerformance() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("quantity");
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState("all"); // "7", "30", "90", "all", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "products")),
        ]);

        if (!mounted) return;

        const ordersData = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const productsData = productsSnap.docs.map((doc) => {
          const d = doc.data();
          const createdAt = d?.createdAt && typeof d.createdAt.toDate === "function"
            ? d.createdAt.toDate()
            : d?.createdAt || null;
          return { id: doc.id, name: d?.name || "Unknown", createdAt, ...d };
        });

        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  // Filter orders by date range (use completedAt || createdAt like Sales)
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;

    const now = new Date();
    let startDate = null;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "custom") {
      if (!customStartDate || !customEndDate) return orders;
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(dateRange, 10);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    return orders.filter((order) => {
      const orderDate = parseDate(order.completedAt || order.createdAt);
      return orderDate && orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, dateRange, customStartDate, customEndDate]);

  const { categoryData, itemsList, totalItemsSold, avgSales, totalRevenue } = useMemo(() => {
    const categoryMap = {};
    const itemMap = {};

    let totalItems = 0;
    let totalRev = 0;

    filteredOrders.forEach((order) => {
      // Make revenue match Sales page: prefer order.total, fallback to sum of items
      const numericTotal = Number(order.total);
      if (!isNaN(numericTotal) && numericTotal > 0) {
        totalRev += numericTotal;
      } else if (Array.isArray(order.items)) {
        totalRev += order.items.reduce(
          (s, it) => s + Number(it.quantity ?? 0) * Number(it.price ?? 0),
          0
        );
      }

      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const qty = Number(item.quantity ?? 0);
        const price = Number(item.price ?? 0);

        totalItems += qty;

        const cat = item?.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + qty; // units share

        const name = item.name || "Unknown";
        if (!itemMap[name]) itemMap[name] = { quantity: 0, revenue: 0 };
        itemMap[name].quantity += qty;
        itemMap[name].revenue += qty * price; // keep for "By Sales (₱)" toggle
      });
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);

    const itemsList = Object.entries(itemMap).map(([name, m]) => ({
      name,
      quantity: m.quantity,
      revenue: m.revenue,
    }));

    const avgSales =
      totalItems && itemsList.length ? Math.round(totalItems / itemsList.length) : 0;

    return { categoryData, itemsList, totalItemsSold: totalItems, avgSales, totalRevenue: totalRev };
  }, [filteredOrders]);

  const topItems = useMemo(() => {
    const key = sortBy === "revenue" ? "revenue" : "quantity";
    return [...itemsList]
      .sort((a, b) => (b[key] || 0) - (a[key] || 0))
      .slice(0, 5)
      .map((it) => ({ ...it, value: Math.round(it[key] * (key === "revenue" ? 100 : 1)) / (key === "revenue" ? 100 : 1) }));
  }, [itemsList, sortBy]);

  const topItemsTotal = topItems.reduce((s, x) => s + (x.value || 0), 0) || 1;
  
  // Human-readable label for the selected date range
  const rangeLabel = useMemo(() => {
    if (dateRange === "7") return "past 7 days";
    if (dateRange === "30") return "past 30 days";
    if (dateRange === "90") return "past 90 days";
    if (dateRange === "all") return "all time";
    if (dateRange === "custom" && customStartDate && customEndDate) {
      const opts = { month: "short", day: "numeric" };
      const s = new Date(customStartDate).toLocaleDateString(undefined, opts);
      const e = new Date(customEndDate).toLocaleDateString(undefined, opts);
      return `${s}–${e}`;
    }
    return "selected period";
  }, [dateRange, customStartDate, customEndDate]);

  const underperformingItems = useMemo(() => {
    const now = new Date();
    let startDate;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "all") {
      startDate = new Date(0);
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(dateRange || "30", 10);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    const soldMap = {};
    itemsList.forEach((it) => { soldMap[it.name] = it.quantity || 0; });

    const base = (products && products.length)
      ? products
      : itemsList.map(it => ({ name: it.name, createdAt: null }));

    const MS = 24 * 60 * 60 * 1000;
    const records = base.map((p) => {
      const created = p.createdAt ? new Date(p.createdAt) : null;
      const activeStart = created ? new Date(Math.max(created.getTime(), startDate.getTime())) : startDate;
      const activeDays = Math.max(1, Math.ceil((endDate.getTime() - activeStart.getTime()) / MS));
      const ageDays = created ? Math.floor((endDate.getTime() - created.getTime()) / MS) : Infinity;
      const sold = soldMap[p.name] ?? 0;
      return {
        id: p.id,
        name: p.name,
        sold,
        activeDays,
        ageDays,
        salesPerDay: sold / activeDays,
      };
    });

    const minActiveDays = (dateRange === "90" || dateRange === "all") ? 14 : 7;

    // Exclude items that are too new to judge
    const eligible = records.filter(r => r.activeDays >= minActiveDays && r.ageDays >= minActiveDays);
    if (!eligible) return [];

    const nonZeroRates = eligible.map(r => r.salesPerDay).filter(v => v > 0).sort((a,b) => a - b);
    const median = nonZeroRates.length ? nonZeroRates[Math.floor(nonZeroRates.length / 2)] : 0;
    const threshold = median > 0 ? median * 0.3 : 0;

    const low = eligible
      .map(r => ({
        id: r.id,
        name: r.name,
        sold: r.sold,
        status: r.sold === 0 ? "Dead Stock" : (r.salesPerDay < threshold ? "Slow Moving" : null),
        score: r.sold === 0 ? -Infinity : r.salesPerDay,
      }))
      .filter(r => r.status)
      .sort((a, b) =>
        a.status === "Dead Stock" && b.status !== "Dead Stock" ? -1 :
        b.status === "Dead Stock" && a.status !== "Dead Stock" ? 1 :
        a.score - b.score
      )
      .slice(0, 12);

    return low;
  }, [products, itemsList, dateRange, customStartDate, customEndDate]);

  if (loading) {
    return (
      <div className="p-6 space-y-8 min-h-screen font-[var(--font-sans)]">
        <h1 className="text-3xl font-bold text-[var(--color-coffee-900)] mb-6">☕ Menu Performance</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonChart />
          <SkeletonPieChart />
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  const pieColors = ["var(--color-coffee-400)", "var(--color-coffee-500)", "var(--color-coffee-600)", "var(--color-coffee-700)", "var(--color-coffee-800)"];

  return (
    <div className="p-6 space-y-8 min-h-screen font-[var(--font-sans)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-coffee-900)]">☕ Menu Performance</h1>
        
        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--color-coffee-700)] font-medium">Date Range:</span>
          
          <div className="inline-flex rounded-lg shadow-sm bg-[var(--color-coffee-50)] p-1">
            <button
              onClick={() => setDateRange("7")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === "7" 
                  ? "bg-[var(--color-coffee-600)] text-white shadow-sm" 
                  : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange("30")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === "30" 
                  ? "bg-[var(--color-coffee-600)] text-white shadow-sm" 
                  : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange("90")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === "90" 
                  ? "bg-[var(--color-coffee-600)] text-white shadow-sm" 
                  : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === "all" 
                  ? "bg-[var(--color-coffee-600)] text-white shadow-sm" 
                  : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => setDateRange("custom")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === "custom" 
                ? "bg-[var(--color-coffee-600)] text-white shadow-sm" 
                : "bg-[var(--color-coffee-50)] text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
            }`}
          >
            📅 Custom
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {dateRange === "custom" && (
        <div className="bg-[var(--color-coffee-50)] p-4 rounded-lg border border-[var(--color-coffee-200)] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--color-coffee-700)]">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 border border-[var(--color-coffee-300)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-500)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--color-coffee-700)]">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 border border-[var(--color-coffee-300)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-500)]"
            />
          </div>
          {customStartDate && customEndDate && new Date(customStartDate) > new Date(customEndDate) && (
            <span className="text-xs text-red-600">⚠️ Start date must be before end date</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white p-12 rounded-[var(--radius-2xl)] text-center">
          <p className="text-lg text-[var(--color-coffee-600]">📭 No orders found for the selected date range.</p>
          <button
            onClick={() => setDateRange("all")}
            className="mt-4 px-4 py-2 bg-[var(--color-coffee-600)] text-white rounded-md hover:bg-[var(--color-coffee-700)] transition-colors"
          >
            View All Orders
          </button>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
              <h2 className="text-[var(--color-coffee-700)] text-sm">Total Revenue</h2>
              <p className="text-2xl font-bold text-[var(--color-coffee-800)]">₱{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
              <h2 className="text-[var(--color-coffee-700)] text-sm">Top Category</h2>
              <p className="text-2xl font-bold text-[var(--color-coffee-800)]">
                {categoryData[0]?.name || "—"}
              </p>
            </div>
            <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
              <h2 className="text-[var(--color-coffee-700)] text-sm">Total Items Sold</h2>
              <p className="text-2xl font-bold text-[var(--color-coffee-800)]">{totalItemsSold}</p>
            </div>
            <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
              <h2 className="text-[var(--color-coffee-700)] text-sm">Avg. Quantity per Item</h2>
              <p className="text-2xl font-bold text-[var(--color-coffee-800)]">{avgSales}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Bestsellers Horizontal Bar Chart */}
            <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-coffee-800)]">🏆 Top 5 Bestsellers</h2>

                <div className="inline-flex rounded-md shadow-sm bg-[var(--color-coffee-50)] p-1">
                  <button
                    onClick={() => setSortBy("quantity")}
                    className={`px-3 py-1 text-sm font-medium rounded ${sortBy === "quantity" ? "bg-[var(--color-coffee-600)] text-white" : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"}`}
                    aria-pressed={sortBy === "quantity"}
                    title="By Volume"
                  >
                    By Volume
                  </button>
                  <button
                    onClick={() => setSortBy("revenue")}
                    className={`px-3 py-1 text-sm font-medium rounded ${sortBy === "revenue" ? "bg-[var(--color-coffee-600)] text-white" : "text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"}`}
                    aria-pressed={sortBy === "revenue"}
                    title="By Sales (₱)"
                  >
                    By Sales (₱)
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  key={sortBy}
                  layout="vertical"
                  data={topItems}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-coffee-200)" />
                  <XAxis type="number" stroke="var(--color-coffee-700)" />
                  <YAxis dataKey="name" type="category" width={160} stroke="var(--color-coffee-700)" />
                  <Tooltip formatter={(value) => (sortBy === "revenue" ? `₱${Number(value).toFixed(2)}` : `${value} sold`)} />
                  <Bar dataKey="value" radius={[5, 5, 5, 5]} isAnimationActive>
                    {topItems.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#D4AF37" : "var(--color-coffee-600)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Insights for Top 5 Bestsellers */}
              <div className="mt-4 pt-4 border-t border-[var(--color-coffee-100)]">
                <h4 className="text-sm font-semibold text-[var(--color-coffee-800)] mb-2">Insights</h4>
                <ul className="text-[var(--color-coffee-700)] text-sm space-y-2">
                  {topItems.map((it, idx) => {
                    const pct = Math.round(((it.value || 0) / topItemsTotal) * 100);
                    return (
                      <li key={it.name} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium mr-2">{idx + 1}. {it.name}</span>
                          <span className="text-[var(--color-coffee-600)]">
                            {sortBy === "revenue" ? `₱${(it.value||0).toFixed(2)}` : `${it.value} sold`}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--color-coffee-600)]">{pct}% within top 5</div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-xs text-[var(--color-coffee-600)]">
                  💡 Tip: The {topItems[0]?.name || "top item"} is the top seller for the {rangeLabel}. Consider restocking more ingredients to prevent stock‑outs.
                </p>
              </div>
            </div>

            {/* Category Share Donut (Smart Donut Chart) */}
            <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
              <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Category Sales Share</h2>

              {(() => {
                const total = totalItemsSold || 0;
                const largest = categoryData[0];
                const largestPct = total ? Math.round((largest?.sales || 0) / total * 100) : 0;
                const smallCategory = categoryData.find(c => total ? (c.sales / total * 100) < 5 : false);
                return (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          dataKey="sales"
                          paddingAngle={2}
                          labelLine={false}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>

                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ fontSize: 18, fontWeight: 700, fill: "var(--color-coffee-800)" }}
                        >
                          {total ? `${largestPct}%` : "—"}
                        </text>

                        <Tooltip formatter={(value) => `${value} sold`} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 grid gap-2">
                      {categoryData.map((cat, i) => {
                        const pct = total ? Math.round((cat.sales / total) * 100) : 0;
                        return (
                          <div key={cat.name} className="flex items-center justify-between text-[var(--color-coffee-700)]">
                            <div className="flex items-center gap-3">
                              <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{ background: pieColors[i % pieColors.length] }}
                              />
                              <span className="font-medium text-[var(--color-coffee-900)]">{cat.name}</span>
                            </div>
                            <div className="text-sm">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>

                    {smallCategory ? (
                      <div className="mt-4 text-sm text-[var(--color-coffee-700)]">
                        💡 Tip: {smallCategory.name} contributes only {total ? Math.round((smallCategory.sales / total) * 100) : 0}% of sales for the {rangeLabel}. Improve visibility (move it higher in the menu or feature it in the slider) and review pricing/flavors.
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Menu Cleanup Candidates (Underperforming Items) */}
          <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[var(--color-coffee-800)]">⚠️ Low Performing Products</h3>
              <p className="text-sm text-[var(--color-coffee-600)]">These items have low sales in the selected period.</p>
            </div>

            {underperformingItems && underperformingItems.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-[var(--color-coffee-600)]">
                      <th className="py-2">Product Name</th>
                      <th className="py-2">Sold</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {underperformingItems.map((item) => (
                      <tr key={item.id || item.name} className="border-t border-[var(--color-coffee-100)]">
                        <td className="py-3 text-[var(--color-coffee-900)]">{item.name}</td>
                        <td className="py-3 text-[var(--color-coffee-700)]">{item.sold} sold</td>
                        <td className="py-3">
                          {item.status === "Dead Stock" ? (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Dead Stock</span>
                          ) : item.status === "Slow Moving" ? (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Slow Moving</span>
                          ) : (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-[var(--color-coffee-700)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[var(--color-coffee-600)]">No menu cleanup candidates found.</p>
            )}
            <p className="mt-3 text-xs text-[var(--color-coffee-600)]">
              Note: Newly added products are excluded until they have at least {dateRange === "90" || dateRange === "all" ? 14 : 7} days of sales data.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
