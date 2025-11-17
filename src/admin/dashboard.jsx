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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { db } from "../firebase"; // Adjust path
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("This Week");
  const [orders, setOrders] = useState([]);

  // -------------------------------
  // Fetch Orders from Firestore
  // -------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const data = snapshot.docs.map(doc => doc.data());
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // -------------------------------
  // Compute Dashboard Analytics
  // -------------------------------
  const {
    totalSalesToday,
    totalOrders,
    newCustomersCount,
    menuItemsSold,
    salesData,
    categoryData,
    topItems,
    customerData,
    staffData,
    recentOrders
  } = useMemo(() => {
    const today = new Date();
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    // KPI Computations
    let totalSalesToday = 0;
    let totalOrders = orders.length;
    let menuItemsSold = 0;
    const customerSet = new Set();

    // Analytics data
    const salesMap = {}; // day -> sales
    const categoryMap = {};
    const topItemsMap = {};
    const staffMap = {}; // adjust if you track cashier/staff

    const recentOrders = [...orders].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 10);

    orders.forEach(order => {
      const completedDate = new Date(order.completedAt);

      // Total Sales Today
      if (completedDate.toDateString() === today.toDateString()) {
        totalSalesToday += order.total;
      }

      // Customer tracking
      if (!customerSet.has(order.customerName)) customerSet.add(order.customerName);

      // Sales trend by day
      const day = dayNames[completedDate.getDay()];
      salesMap[day] = (salesMap[day] || 0) + order.total;

      // Menu Performance & Top Items
      order.items.forEach(item => {
        // Category
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.qty;
        // Top Items
        if (!topItemsMap[item.name]) topItemsMap[item.name] = { id: item.id, name: item.name, sales: 0 };
        topItemsMap[item.name].sales += item.qty;
        // Total items sold
        menuItemsSold += item.qty;
      });

      // Staff performance (if you have cashier/staff field)
      const staff = order.cashierName || "Unknown";
      staffMap[staff] = (staffMap[staff] || 0) + order.total;
    });

    // Sales chart data
    const salesData = dayNames.map(day => ({ day, sales: salesMap[day] || 0 }));

    // Category chart data
    const categoryData = Object.entries(categoryMap).map(([category, value]) => ({ category, value }));

    // Top items chart data (top 5)
    const topItems = Object.values(topItemsMap).sort((a, b) => b.sales - a.sales).slice(0, 5);

    // Customer analytics
    const newCustomersCount = customerSet.size; // total unique customers
    const customerData = [
      { name: "Returning", value: orders.length - newCustomersCount },
      { name: "New", value: newCustomersCount },
    ];

    // Staff analytics
    const staffData = Object.entries(staffMap).map(([name, value]) => ({ name, value }));

    return { totalSalesToday, totalOrders, newCustomersCount, menuItemsSold, salesData, categoryData, topItems, customerData, staffData, recentOrders };
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-coffee-900">
            ☕ Dashboard Overview
          </h1>
          <p className="text-coffee-600 text-sm">
            Welcome back! Here's your latest business summary.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-coffee-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition">
          <Calendar className="text-coffee-600 w-4 h-4" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-coffee-700 bg-transparent outline-none text-sm"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Total Sales Today", value: `₱${totalSalesToday.toLocaleString()}`, change: "▲ 12%" },
          { title: "Total Orders", value: totalOrders, change: "▲ 5%" },
          { title: "New Customers", value: newCustomersCount, change: "▲ 9%" },
          { title: "Menu Items Sold", value: menuItemsSold, change: "▲ 7%" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md border-l-4 border-coffee-600 p-4 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <h2 className="text-sm text-coffee-600">{card.title}</h2>
            <p className="text-3xl font-bold text-coffee-800">{card.value}</p>
            <p className="text-green-600 text-xs mt-1">{card.change} vs last period</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-coffee-800">📊 Sales Report (₱)</h2>
            <a href="#" className="text-coffee-600 text-sm hover:underline">View Details →</a>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6E3CC" />
              <XAxis dataKey="day" stroke="#8E5A3A" />
              <YAxis stroke="#8E5A3A" />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#C28F5E" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Menu Performance */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-coffee-800">🍔 Menu Performance (%)</h2>
            <a href="#" className="text-coffee-600 text-sm hover:underline">View Details →</a>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6E3CC" />
              <XAxis dataKey="category" stroke="#8E5A3A" />
              <YAxis stroke="#8E5A3A" />
              <Tooltip />
              <Bar dataKey="value" fill="#C28F5E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Analytics + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">👥 Customer Analytics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={customerData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                <Cell fill="#8E5A3A" />
                <Cell fill="#E1B788" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">🏆 Top Selling Items</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-200 text-coffee-800">
              <tr>
                <th className="py-2 px-4 rounded-l-lg">#</th>
                <th className="py-2 px-4">Item</th>
                <th className="py-2 px-4 rounded-r-lg">Sales</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-coffee-100 transition">
                  <td className="py-2 px-4 text-coffee-800">{index + 1}</td>
                  <td className="py-2 px-4 text-coffee-800">{item.name}</td>
                  <td className="py-2 px-4 font-semibold text-coffee-800">{item.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Performance + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">👨‍💼 Staff Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={staffData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6E3CC" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" stroke="#8E5A3A" />
              <Tooltip />
              <Bar dataKey="value" fill="#C28F5E" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">🧾 Recent Orders</h2>
          <div className="divide-y divide-coffee-100 max-h-64 overflow-y-auto">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex justify-between items-center hover:bg-coffee-50 px-2 rounded-lg transition">
                <div>
                  <p className="font-semibold text-coffee-800">{order.id}</p>
                  <p className="text-sm text-coffee-600">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-coffee-800">₱{order.total}</p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
