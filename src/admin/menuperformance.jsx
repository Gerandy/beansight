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
import { db } from "../firebase"; // adjust path if needed
import { collection, getDocs } from "firebase/firestore";

export default function MenuPerformance() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // NEW: products list
  const [loading, setLoading] = useState(true);

  // --- NEW: control for chart sorting/metric ---
  const [sortBy, setSortBy] = useState("quantity"); // 'quantity' = By Volume, 'revenue' = By Sales (₱)

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "orders"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (!mounted) return;
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => (mounted = false);
  }, []);

  // NEW: fetch products collection (to access createdAt and product list)
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map((doc) => {
          const d = doc.data();
          // normalize createdAt if Firestore Timestamp
          const createdAt = d?.createdAt && typeof d.createdAt.toDate === "function"
            ? d.createdAt.toDate()
            : d?.createdAt || null;
          return { id: doc.id, name: d?.name || "Unknown", createdAt, ...d };
        });
        if (!mounted) return;
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
    return () => (mounted = false);
  }, []);

  const { categoryData, itemsList, totalItemsSold, avgSales, topPair } = useMemo(() => {
    const categoryMap = {};
    const itemMap = {};

    let totalItems = 0;

    orders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const qty = Number(item.quantity ?? 0);
        const price = Number(item.price ?? 0);
        totalItems += qty;

        // Category aggregation (by quantity)
        const cat = item?.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + qty;

        // Item aggregation: keep both quantity and revenue
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

    // --- co-purchase pair logic (unchanged) ---
    const pairCounts = {};
    orders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      const names = Array.from(new Set(order.items.map((i) => i.name || "Unknown")));
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const a = names[i];
          const b = names[j];
          const key = a < b ? `${a}|||${b}` : `${b}|||${a}`;
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    });
    let topPair = null;
    const pairEntries = Object.entries(pairCounts);
    if (pairEntries.length) {
      pairEntries.sort(([, cA], [, cB]) => cB - cA);
      const [key, count] = pairEntries[0];
      const [a, b] = key.split("|||");
      topPair = { a, b, count };
    }

    // --- NEW: compute Rising Star (This Week vs Last Week) ---
    const toDate = (ts) => {
      if (!ts) return null;
      if (typeof ts === "string" || typeof ts === "number") return new Date(ts);
      if (typeof ts.toDate === "function") return ts.toDate();
      return ts instanceof Date ? ts : new Date(ts);
    };

    const getMonday = (d) => {
      const copy = new Date(d);
      const day = copy.getDay(); // 0 (Sun) - 6
      const diff = (day + 6) % 7; // shift so Monday is 0
      copy.setHours(0,0,0,0);
      copy.setDate(copy.getDate() - diff);
      return copy;
    };

    const now = new Date();
    const thisWeekStart = getMonday(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const weekCounts = {}; // name -> { thisWeek, lastWeek }
    orders.forEach(order => {
      const ts = toDate(order.createdAt ?? order.created_at ?? order.timestamp ?? order.created_at_timestamp);
      if (!ts) return;
      const isThisWeek = ts >= thisWeekStart;
      const isLastWeek = ts >= lastWeekStart && ts < thisWeekStart;
      if (!Array.isArray(order.items)) return;
      order.items.forEach(item => {
        const name = item?.name || "Unknown";
        const qty = Number(item?.quantity ?? 0) || 0;
        if (!weekCounts[name]) weekCounts[name] = { thisWeek: 0, lastWeek: 0 };
        if (isThisWeek) weekCounts[name].thisWeek += qty;
        else if (isLastWeek) weekCounts[name].lastWeek += qty;
      });
    });

    // compute growth percentage and pick highest positive growth
    const growthEntries = Object.entries(weekCounts).map(([name, vals]) => {
      const { thisWeek = 0, lastWeek = 0 } = vals;
      let growthPercent = 0;
      if (lastWeek === 0) {
        growthPercent = thisWeek > 0 ? 100 : 0; // treat new activity as 100% growth
      } else {
        growthPercent = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      }
      return { name, thisWeek, lastWeek, growthPercent };
    });
    growthEntries.sort((a, b) => b.growthPercent - a.growthPercent);
    const risingStar = (growthEntries.length && growthEntries[0].growthPercent > 0) ? growthEntries[0] : null;
    // --- end Rising Star logic ---

    return { categoryData, itemsList, totalItemsSold: totalItems, avgSales, topPair, risingStar };
  }, [orders]);

  // --- NEW: derive top 5 based on sortBy ---
  const topItems = useMemo(() => {
    const key = sortBy === "revenue" ? "revenue" : "quantity";
    return [...itemsList]
      .sort((a, b) => (b[key] || 0) - (a[key] || 0))
      .slice(0, 5)
      .map((it) => ({ ...it, value: Math.round(it[key] * (key === "revenue" ? 100 : 1)) / (key === "revenue" ? 100 : 1) /* keep revenue/quantity as value */ }));
  }, [itemsList, sortBy]);

  // NEW: total of topItems values (used for insight %s)
  const topItemsTotal = topItems.reduce((s, x) => s + (x.value || 0), 0) || 1;
  
  // NEW: compute underperforming items (exclude products created today)
  const underperformingItems = useMemo(() => {
    // helper: is same day
    const isSameDay = (d1, d2) => {
      if (!d1 || !d2) return false;
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    };

    const today = new Date();
    // map sold counts by product name from itemsList
    const soldMap = {};
    itemsList.forEach((it) => { soldMap[it.name] = it.quantity || 0; });

    // Build candidate list from products. If products list empty (no fetch), fall back to itemsList names.
    let candidatesSource = products && products.length ? products : itemsList.map(it => ({ name: it.name, createdAt: null }));
    // normalize objects
    const normalized = candidatesSource.map(p => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt || null,
      sold: soldMap[p.name] ?? 0,
    }));

    // exclude products created today
    const filtered = normalized.filter(p => !(p.createdAt && isSameDay(new Date(p.createdAt), today)));

    // select those with low sales (<5), sort ascending by sold, put zero-sold first
    const low = filtered
      .filter(p => p.sold < 5)
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 12); // limit the list

    return low;
  }, [products, itemsList]);

  // NEW: Best Time to Sell per category (Beverage, Burger, Dessert)
  const bestTimesByCategory = useMemo(() => {
    const targetCategories = ["Beverage", "Burger", "Dessert"];
    // initialize map of category -> hour buckets
    const hoursByCat = {};
    targetCategories.forEach(c => { hoursByCat[c] = new Array(24).fill(0); });

    const toDate = (ts) => {
      if (!ts) return null;
      if (typeof ts === "string" || typeof ts === "number") return new Date(ts);
      if (typeof ts.toDate === "function") return ts.toDate();
      return ts instanceof Date ? ts : new Date(ts);
    };

    orders.forEach(order => {
      const ts = toDate(order.createdAt ?? order.created_at ?? order.timestamp ?? order.created_at_timestamp);
      if (!ts) return;
      const hour = ts.getHours();
      if (!Array.isArray(order.items)) return;
      order.items.forEach(item => {
        const cat = item?.category || "Uncategorized";
        const qty = Number(item?.quantity ?? 0) || 0;
        if (targetCategories.includes(cat)) {
          hoursByCat[cat][hour] += qty;
        }
      });
    });

    const formatHour = (h) => {
      const suffix = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
      return suffix;
    };

    const bucketLabel = (h) => {
      if (h >= 6 && h <= 10) return "Morning Rush";
      if (h >= 11 && h <= 14) return "Lunch Crowd";
      if (h >= 15 && h <= 18) return "Merienda";
      return null;
    };

    return targetCategories.map(cat => {
      const arr = hoursByCat[cat] ?? new Array(24).fill(0);
      const max = Math.max(...arr);
      if (max === 0) return { category: cat, peakHour: null, peakCount: 0, label: null, icon: "🕒" };
      const peakHour = arr.findIndex(v => v === max);
      const label = bucketLabel(peakHour);
      const icon = (peakHour >= 6 && peakHour <= 18) ? "🌞" : "🌙";
      return { category: cat, peakHour, peakCount: max, timeText: formatHour(peakHour), label, icon };
    });
  }, [orders]);

  if (loading) return <div className="p-6 text-coffee-600">Loading menu performance...</div>;

  const pieColors = ["var(--color-coffee-400)", "var(--color-coffee-500)", "var(--color-coffee-600)", "var(--color-coffee-700)", "var(--color-coffee-800)"];

  return (
    <div className="p-6 space-y-8 min-h-screen font-[var(--font-sans)]">
      <h1 className="text-3xl font-bold text-[var(--color-coffee-900)] mb-6">☕ Menu Performance</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <h2 className="text-[var(--color-coffee-700)] text-sm">Avg. Sales per Item</h2>
          <p className="text-2xl font-bold text-[var(--color-coffee-800)]">₱{avgSales}</p>
        </div>
      </div>

      {/* --- MOVED: Smart Recommendation card placed directly below KPI cards --- */}
      <div className="mt-2">
        <div className="bg-white p-4 rounded-[var(--radius-2xl)] border-l-4 border-yellow-400 flex items-start gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-coffee-800)]">Smart Recommendation</h3>
            <p className="text-[var(--color-coffee-700)] mt-1">
              {topPair ? `People who buy ${topPair.a} often buy ${topPair.b}.` : "No co-purchase data available."}
            </p>
            {topPair ? (
              <p className="text-xs text-[var(--color-coffee-600)] mt-1">Seen together in {topPair.count} orders</p>
            ) : null}
          </div>
        </div>
      </div>
      {/* --- end moved Smart Recommendation --- */}

      {/* --- NEW: Best Time to Sell widget --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h3 className="sr-only">Peak Order Times</h3>
        {bestTimesByCategory.map(bt => (
          <div key={bt.category} className="bg-white p-4 rounded-[var(--radius-2xl)] flex items-start gap-4 border">
            <div className="text-2xl">{bt.icon}</div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-coffee-800)]">{bt.category}</div>
              {bt.peakHour === null ? (
                <div className="text-[var(--color-coffee-700)] text-sm">No peak data</div>
              ) : (
                <div className="text-[var(--color-coffee-700)] text-sm">
                  {bt.category} sells best at <span className="font-medium">{bt.timeText}</span>.
                  {bt.label ? <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-[var(--color-coffee-50)] text-[var(--color-coffee-700)]">{bt.label}</span> : null}
                </div>
              )}
              {bt.peakHour !== null ? (
                <div className="text-xs text-[var(--color-coffee-600)] mt-1">{bt.peakCount} items sold during this hour</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {/* --- end Best Time to Sell widget --- */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Updated: Top 5 Bestsellers Horizontal Bar Chart ===== */}
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-coffee-800)]">🏆 Top 5 Bestsellers</h2>

            {/* --- NEW: Toggle Controls --- */}
            <div className="inline-flex rounded-md shadow-sm bg-[var(--color-coffee-50)] p-1">
              <button
                onClick={() => setSortBy("quantity")}
                className={`px-3 py-1 text-sm font-medium rounded ${sortBy === "quantity" ? "bg-[var(--color-coffee-600)] text-white" : "text-[var(--color-coffee-700)]"}`}
                aria-pressed={sortBy === "quantity"}
                title="By Volume"
              >
                By Volume
              </button>
              <button
                onClick={() => setSortBy("revenue")}
                className={`px-3 py-1 text-sm font-medium rounded ${sortBy === "revenue" ? "bg-[var(--color-coffee-600)] text-white" : "text-[var(--color-coffee-700)]"}`}
                aria-pressed={sortBy === "revenue"}
                title="By Sales (₱)"
              >
                By Sales (₱)
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {/* key={sortBy} helps re-mount/animate when metric changes */}
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
                    fill={index === 0 ? "#D4AF37" /* gold for #1 */ : "var(--color-coffee-600)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* --- NEW: Insights for Top 5 Bestsellers --- */}
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
                    <div className="text-xs text-[var(--color-coffee-600)]">{pct}% of top 5</div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-[var(--color-coffee-600)]">
              Tip: Promote the top seller with a bundle including the #2 item to increase AOV.
            </p>
          </div>
        </div>

        {/* Category Share Donut (Smart Donut Chart) */}
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Category Sales Share</h2>

          {/* compute largest % and any small category */}
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

                    {/* Center text showing largest category % */}
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

                {/* Dynamic Legend: show name + % (growth not available) */}
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

                {/* Actionable insight if any category < 5% */}
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

      {/* --- NEW: Menu Cleanup Candidates (Underperforming Items) --- */}
      <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[var(--color-coffee-800)]">⚠️ Menu Cleanup Candidates</h3>
          <p className="text-sm text-[var(--color-coffee-600)]">These items have low sales. </p>
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
      {/* --- end Menu Cleanup Candidates --- */}

    </div>
  );
}
