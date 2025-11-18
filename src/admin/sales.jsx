import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase"; // adjust path if needed
import { collection, getDocs } from "firebase/firestore";

function parseDate(value) {
  // Firestore Timestamps have toDate(), others might be ISO strings
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day + 1; // start Monday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function dayNameFromIndex(i) {
  // Return Mon..Sun for 0..6 index mapping used in charts below
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
}

export default function Sales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------
  // Fetch orders from Firestore
  // ---------------------------
  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, "orders"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (!mounted) return;
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------
  // Derived analytics
  // ---------------------------
  const {
    totalRevenue,
    avgOrderValue,
    ordersToday,
    totalDiscounts,
    dailySales,
    categorySales,
    recentOrders,
    totalOrdersCount,
  } = useMemo(() => {
    // KPIs
    let totalRevenue = 0;
    let totalDiscounts = 0;
    let ordersToday = 0;
    const now = new Date();

    // daily sales for current week (Mon-Sun)
    const weekStart = startOfWeek(now); // Monday
    const dailyMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=>Mon ...6=>Sun

    // category revenue map
    const categoryMap = {};

    // recent orders (we'll sort later)
    const recent = [];

    // total orders count
    let totalOrdersCount = 0;

    orders.forEach((order) => {
      const completed = parseDate(order.completedAt) || parseDate(order.createdAt);
      // skip if no date
      if (!completed) return;

      // Only consider orders with numeric total (safety)
      const orderTotal = Number(order.total || 0);
      const orderDiscount = Number(order.discountAmount || 0);

      totalRevenue += orderTotal;
      totalDiscounts += orderDiscount;
      totalOrdersCount += 1;

      // Orders today
      const isToday =
        completed.getFullYear() === now.getFullYear() &&
        completed.getMonth() === now.getMonth() &&
        completed.getDate() === now.getDate();
      if (isToday) ordersToday += 1;

      // Weekly daily aggregation (map Monday..Sunday)
      if (completed >= weekStart) {
        // get day index Monday=0..Sunday=6
        const jsDay = completed.getDay(); // 0 Sun..6 Sat
        const idx = jsDay === 0 ? 6 : jsDay - 1; // convert: Mon(1)->0 ... Sun(0)->6
        dailyMap[idx] = (dailyMap[idx] || 0) + orderTotal;
      }

      // Category aggregation (revenue)
      // items might be undefined or empty
      if (Array.isArray(order.items)) {
        order.items.forEach((it) => {
          const qty = Number(it.quantity ?? it.qty ?? 0);
          const price = Number(it.price ?? 0);
          const revenue = qty * price;
          const cat = it.category || "Uncategorized";
          categoryMap[cat] = (categoryMap[cat] || 0) + revenue;
        });
      }

      // Recent order entry
      recent.push({
        id: order.id || order?.orderId || `#${Math.floor(Math.random() * 10000)}`,
        // pick first item's name as the item summary
        item:
          (Array.isArray(order.items) && order.items[0] && (order.items[0].name || order.items[0].item)) ||
          "—",
        date: completed.toLocaleString(),
        total: `₱${orderTotal.toLocaleString()}`,
        rawTotal: orderTotal,
        completedAt: completed,
      });
    });

    // Daily sales array (Mon..Sun)
    const dailySales = Object.keys(dailyMap).map((k) => ({
      day: dayNameFromIndex(Number(k)),
      amount: dailyMap[k],
    }));

    // Category sales array (sorted desc)
    const categorySales = Object.entries(categoryMap)
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales);

    // recent orders sorted by date desc, take 10
    const recentOrders = recent
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 10)
      .map((r) => ({ ...r, completedAt: undefined })); // remove raw date object for UI

    const avgOrderValue = totalOrdersCount ? totalRevenue / totalOrdersCount : 0;

    return {
      totalRevenue,
      avgOrderValue,
      ordersToday,
      totalDiscounts,
      dailySales,
      categorySales,
      recentOrders,
      totalOrdersCount,
    };
  }, [orders]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 space-y-8 font-sans">
      <h1 className="text-3xl font-bold text-coffee-800 mb-4">☕ Sales Analytics</h1>

      {loading && <div className="text-sm text-coffee-600">Loading...</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Total Revenue</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{Number(totalRevenue).toLocaleString()}</p>
          <p className="text-green-600 text-sm">derived from orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Average Order Value</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{avgOrderValue.toFixed(2)}</p>
          <p className="text-green-600 text-sm">based on {totalOrdersCount} orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Orders Today</h2>
          <p className="text-3xl font-bold text-coffee-700">{ordersToday}</p>
          <p className="text-green-600 text-sm">updated from orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Total Discounts</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{Number(totalDiscounts).toLocaleString()}</p>
          <p className="text-green-600 text-sm">sum of discountAmount</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">Daily Sales (₱)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6A3D26" />
              <YAxis stroke="#6A3D26" />
              <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#8E5A3A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">Sales by Category (₱)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" stroke="#6A3D26" />
              <YAxis stroke="#6A3D26" />
              <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
              <Bar dataKey="sales" fill="#C28F5E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-coffee-800">Recent Orders</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-coffee-100 text-coffee-800">
              <th className="py-2 px-4 rounded-l-lg">Order ID</th>
              <th className="py-2 px-4">Item</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4 rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-coffee-100 text-coffee-900 hover:bg-coffee-800 hover:text-coffee-50 transition"
              >
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">{order.item}</td>
                <td className="py-2 px-4">{order.date}</td>
                <td className="py-2 px-4 text-coffee-600 font-semibold">{order.total}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-coffee-500">No recent orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
