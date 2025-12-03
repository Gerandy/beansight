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

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;

    const now = new Date();
    let startDate = null;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (dateRange === "custom") {
      if (!customStartDate || !customEndDate) return orders;
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(dateRange);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    return orders.filter(order => {
      let orderDate = null;
      
      if (order.createdAt) {
        if (typeof order.createdAt.toDate === "function") {
          orderDate = order.createdAt.toDate();
        } else if (order.createdAt instanceof Date) {
          orderDate = order.createdAt;
        } else if (typeof order.createdAt === "string") {
          orderDate = new Date(order.createdAt);
        }
      }

      if (!orderDate || isNaN(orderDate.getTime())) return false;
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, dateRange, customStartDate, customEndDate]);

  const { categoryData, itemsList, totalItemsSold, avgSales, totalRevenue } = useMemo(() => {
    const categoryMap = {};
    const itemMap = {};

    let totalItems = 0;
    let totalRev = 0;

    filteredOrders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const qty = Number(item.quantity ?? 0);
        const price = Number(item.price ?? 0);
        totalItems += qty;
        totalRev += qty * price;

        const cat = item?.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + qty;

        const name = item.name || "Unknown";
        if (!itemMap[name]) itemMap[name] = { quantity: 0, revenue: 0 };
        itemMap[name].quantity += qty;
        itemMap[name].revenue += qty * price;
      });
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);

    const itemsList = Object.entries(itemMap)
      .map(([name, metrics]) => ({ name, quantity: metrics.quantity, revenue: metrics.revenue }));

    const avgSales = totalItems && itemsList.length ? Math.round(totalItems / itemsList.length) : 0;

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
  
  const underperformingItems = useMemo(() => {
    const isSameDay = (d1, d2) => {
      if (!d1 || !d2) return false;
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    };

    const today = new Date();
    const soldMap = {};
    itemsList.forEach((it) => { soldMap[it.name] = it.quantity || 0; });

    let candidatesSource = products && products.length ? products : itemsList.map(it => ({ name: it.name, createdAt: null }));
    const normalized = candidatesSource.map(p => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt || null,
      sold: soldMap[p.name] ?? 0,
    }));

    const filtered = normalized.filter(p => !(p.createdAt && isSameDay(new Date(p.createdAt), today)));

    const low = filtered
      .filter(p => p.sold < 5)
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 12);

    return low;
  }, [products, itemsList]);

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
          <p className="text-lg text-[var(--color-coffee-600)]">📭 No orders found for the selected date range.</p>
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
                  💡 Tip: Promote the top seller with a bundle including the #2 item to increase AOV.
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
                        💡 Tip: Create a bundle deal to boost {smallCategory.name} sales.
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
              <h3 className="text-lg font-semibold text-[var(--color-coffee-800)]">⚠️ Menu Cleanup Candidates</h3>
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
                          {item.sold === 0 ? (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Dead Stock</span>
                          ) : item.sold < 5 ? (
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
          </div>
        </>
      )}
    </div>
  );
}
