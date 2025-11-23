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
  const [loading, setLoading] = useState(true);

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

  const { categoryData, topItems, lowPerformingItems, totalItemsSold, avgSales } = useMemo(() => {
    const categoryMap = {};
    const itemMap = {};

    let totalItems = 0;

    orders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const qty = Number(item.quantity ?? 0);
        totalItems += qty;

        // Category aggregation
        const cat = item?.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + qty;

        // Item aggregation
        const name = item.name || "Unknown";
        itemMap[name] = (itemMap[name] || 0) + qty;
      });
    });

    const categoryData = Object.entries(categoryMap).map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);

    const sortedItems = Object.entries(itemMap)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold);

    const topItems = sortedItems.slice(0, 5);
    const lowPerformingItems = sortedItems.slice(-5);

    const avgSales = totalItems && sortedItems.length ? Math.round(totalItems / sortedItems.length) : 0;

    return { categoryData, topItems, lowPerformingItems, totalItemsSold: totalItems, avgSales };
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-coffee-200)" />
              <XAxis dataKey="name" stroke="var(--color-coffee-700)" />
              <YAxis stroke="var(--color-coffee-700)" />
              <Tooltip />
              <Bar dataKey="sales" fill="var(--color-coffee-600)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Category Sales Share</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="sales"
                label={({ name }) => name}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Low Performing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Top 5 Best-Selling Items</h2>
          <ul className="divide-y divide-[var(--color-coffee-200)]">
            {topItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-[var(--color-coffee-900)]">{item.name}</span>
                <span className="text-[var(--color-coffee-700)]">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">Low Performing Items</h2>
          <ul className="divide-y divide-[var(--color-coffee-200)]">
            {lowPerformingItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-[var(--color-coffee-900)]">{item.name}</span>
                <span className="text-[var(--color-coffee-700)]">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
