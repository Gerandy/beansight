import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
} from "../components/SkeletonLoader";

function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayNameFromIndex(i) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
}

export default function CustomerAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const analytics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const userMap = {};
    const dailyActiveMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const monthlyGrowthMap = {};

    orders.forEach((order) => {
      const uid = order.user?.uid;
      if (!uid) return;

      // Build user map for aggregation
      if (!userMap[uid]) {
        userMap[uid] = {
          user: order.user,
          orders: 0,
          spent: 0,
          firstOrderDate: new Date(order.createdAt?.seconds * 1000 || order.createdAt),
        };
      }

      userMap[uid].orders += 1;
      userMap[uid].spent += Number(order.total || 0);

      // Daily active (by completedAt or createdAt)
      const completed = order.completedAt
        ? new Date(order.completedAt?.seconds * 1000 || order.completedAt)
        : new Date(order.createdAt?.seconds * 1000 || order.createdAt);
      const dayIdx = completed.getDay();
      dailyActiveMap[dayIdx] = (dailyActiveMap[dayIdx] || 0) + 1;

      // Monthly growth
      const monthKey = completed.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyGrowthMap[monthKey] = (monthlyGrowthMap[monthKey] || 0) + 1;
    });

    const totalCustomers = Object.keys(userMap).length;
    const newCustomersThisMonth = Object.values(userMap).filter(
      (u) => u.firstOrderDate >= monthStart
    ).length;
    const returningCustomers = totalCustomers - newCustomersThisMonth;
    const avgOrdersPerCustomer = totalCustomers
      ? orders.length / totalCustomers
      : 0;

    // Prepare charts
    const customerGrowth = Object.entries(monthlyGrowthMap)
      .map(([month, customers]) => ({ month, customers }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    const activeCustomers = Object.entries(dailyActiveMap)
      .map(([day, active]) => ({ day: dayNameFromIndex(Number(day)), active }));

    // Top customers
    const topCustomers = Object.values(userMap)
      .map(u => ({
        name: u.user?.firstName ?? u.user.customerName,
        orders: u.orders,
        spent: u.spent,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    return {
      totalCustomers,
      newCustomersThisMonth,
      returningCustomers,
      avgOrdersPerCustomer,
      customerGrowth,
      activeCustomers,
      topCustomers,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="p-6 space-y-8 font-sans min-h-screen">
        {/* Header - Keep visible during loading */}
        <h1 className="text-3xl font-bold text-coffee-900 mb-6">👥 Customers Report</h1>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Table Skeleton */}
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const {
    totalCustomers,
    newCustomersThisMonth,
    returningCustomers,
    avgOrdersPerCustomer,
    customerGrowth,
    activeCustomers,
    topCustomers,
  } = analytics;

  return (
    <div className="p-6 space-y-8 font-sans min-h-screen">
      <h1 className="text-3xl font-bold text-coffee-900 mb-6">👥 Customers Report</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Customers", value: totalCustomers },
          { title: "New This Month", value: newCustomersThisMonth },
          { title: "Returning Customers", value: returningCustomers },
          { title: "Avg. Orders per Customer", value: avgOrdersPerCustomer.toFixed(1) },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-coffee-500">
            <h2 className="text-sm text-coffee-700">{card.title}</h2>
            <p className="text-2xl font-bold text-coffee-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">Customer Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-coffee-100)" />
              <XAxis dataKey="month" stroke="var(--color-coffee-400)" tick={{ fill: "var(--color-coffee-700)" }} />
              <YAxis stroke="var(--color-coffee-400)" tick={{ fill: "var(--color-coffee-700)" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-coffee-50)", border: "1px solid var(--color-coffee-200)", color: "var(--color-coffee-900)" }} />
              <Line type="monotone" dataKey="customers" stroke="var(--color-coffee-600)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-coffee-500)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">Active Customers by Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeCustomers}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-coffee-100)" />
              <XAxis dataKey="day" stroke="var(--color-coffee-400)" tick={{ fill: "var(--color-coffee-700)" }} />
              <YAxis stroke="var(--color-coffee-400)" tick={{ fill: "var(--color-coffee-700)" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-coffee-50)", border: "1px solid var(--color-coffee-200)", color: "var(--color-coffee-900)" }} />
              <Bar dataKey="active" fill="var(--color-coffee-400)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-coffee-800">Top Customers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-coffee-800">
            <thead>
              <tr className="border-b text-xs uppercase border-coffee-200 text-coffee-600">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Orders</th>
                <th className="px-4 py-2">Total Spent (₱)</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, idx) => (
                <tr key={idx} className="border-b hover:opacity-90 transition border-coffee-100">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">₱{customer.spent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
