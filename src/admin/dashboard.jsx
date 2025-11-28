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
import { Calendar, ShoppingBag, Users } from "lucide-react";
import { db } from "../firebase"; // Adjust path
import { collection, getDocs } from "firebase/firestore";
import { Link, NavLink } from "react-router-dom";

// Helper to calculate % change
function calcPercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper to check if a date is in this week/month/year
function filterByPeriod(date, period) {
  const d = new Date(date);
  const now = new Date();

  if (period === "Today") {
    const start = new Date(now);
    start.setHours(0,0,0,0);
    const end = new Date(now);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  }

  if (period === "Yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const start = new Date(yesterday);
    start.setHours(0,0,0,0);
    const end = new Date(yesterday);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  }

  if (period === "This Week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    return d >= startOfWeek && d <= endOfWeek;
  }

  if (period === "This Month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  if (period === "This Year") {
    return d.getFullYear() === now.getFullYear();
  }

  return false;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("This Week");
  const [orders, setOrders] = useState([]);

  // New states for Financial Health & Daily Goal
  const [marginPercent, setMarginPercent] = useState(40); // shows "Margin: 40%"
  const [dailyGoal, setDailyGoal] = useState(5000); // default daily goal (₱)

  // New: products for inventory checks
  const [products, setProducts] = useState([]);

  // -------------------------------
  // Fetch Orders from Firestore
  // -------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    // Fetch products for inventory alerts
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const pdata = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(pdata);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchOrders();
    fetchProducts();
  }, []);

  // -------------------------------
  // Compute Dashboard Analytics
  // -------------------------------
  const {
    totalSales,
    totalOrders,
    newCustomersCount,
    menuItemsSold,
    salesData,
    categoryData,
    topItems,
    customerData,
    staffData,
    recentOrders,
    kpiChanges,
    todaySales,
    yesterdaySales,
    trendPercent,
    peakHourSuggestion,
  } = useMemo(() => {
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    // Separate orders by current and previous period
    const now = new Date();
    const getPreviousPeriod = (period) => {
      if (period === "Today") {
        const start = new Date(now); start.setHours(0,0,0,0);
        const end = new Date(now); end.setHours(23,59,59,999);
        const prevStart = new Date(start); prevStart.setDate(start.getDate() - 1);
        const prevEnd = new Date(prevStart); prevEnd.setHours(23,59,59,999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevStart && d <= prevEnd;
        });
      }
      if (period === "Yesterday") {
        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
        const start = new Date(yesterday); start.setHours(0,0,0,0);
        const end = new Date(yesterday); end.setHours(23,59,59,999);
        const prevDay = new Date(yesterday); prevDay.setDate(yesterday.getDate() - 1);
        const prevStart = new Date(prevDay); prevStart.setHours(0,0,0,0);
        const prevEnd = new Date(prevDay); prevEnd.setHours(23,59,59,999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevStart && d <= prevEnd;
        });
      }
      if (period === "This Week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        const startPrevWeek = new Date(startOfWeek);
        startPrevWeek.setDate(startPrevWeek.getDate() - 7);
        const endPrevWeek = new Date(startOfWeek);
        endPrevWeek.setDate(endPrevWeek.getDate() - 1);
        endPrevWeek.setHours(23,59,59,999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= startPrevWeek && d <= endPrevWeek;
        });
      }
      if (period === "This Month") {
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevMonthStart && d <= prevMonthEnd;
        });
      }
      if (period === "This Year") {
        const prevYear = new Date(now.getFullYear() - 1, 0, 1);
        const endPrevYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevYear && d <= endPrevYear;
        });
      }
      return [];
    };

    const previousOrders = getPreviousPeriod(dateRange);

    // KPI calculations
    let totalSales = 0;
    let menuItemsSold = 0;
    let totalOrders = 0;
    const customerSet = new Set();
    const salesMap = {};
    const categoryMap = {};
    const topItemsMap = {};
    const staffMap = {};

    orders.forEach(order => {
      const completedDate = new Date(order.completedAt || order.createdAt);
      if (filterByPeriod(completedDate, dateRange)) {
        totalSales += order.total || 0;
        totalOrders += 1;
        if (order.customerName && !customerSet.has(order.customerName)) customerSet.add(order.customerName);

        (order.items || []).forEach(item => {
          categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
          if (!topItemsMap[item.name]) topItemsMap[item.name] = { id: item.id, name: item.name, sales: 0 };
          topItemsMap[item.name].sales += item.quantity;
          menuItemsSold += item.quantity;
        });

        const staff = order.cashierName || "Unknown";
        staffMap[staff] = (staffMap[staff] || 0) + (order.total || 0);

        // Sales trend
        const day = dayNames[completedDate.getDay()];
        salesMap[day] = (salesMap[day] || 0) + (order.total || 0);
      }
    });

    // Previous period totals
    let prevTotalSales = 0;
    let prevMenuItems = 0;
    let prevTotalOrders = previousOrders.length;
    const prevCustomerSet = new Set();
    previousOrders.forEach(order => {
      prevTotalSales += order.total || 0;
      (order.items || []).forEach(item => prevMenuItems += item.quantity);
      if (order.customerName && !prevCustomerSet.has(order.customerName)) prevCustomerSet.add(order.customerName);
    });
    const prevNewCustomers = prevCustomerSet.size;

    const kpiChanges = {
      totalSales: calcPercentageChange(totalSales, prevTotalSales),
      totalOrders: calcPercentageChange(totalOrders, prevTotalOrders),
      menuItemsSold: calcPercentageChange(menuItemsSold, prevMenuItems),
      newCustomers: calcPercentageChange(customerSet.size, prevNewCustomers),
    };

    // Chart & Table Data
    const salesData = dayNames.map(day => ({ day, sales: salesMap[day] || 0 }));
    const categoryData = Object.entries(categoryMap).map(([category, value]) => ({ category, value }));
    const topItems = Object.values(topItemsMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
    const customerData = [
      { name: "Returning", value: orders.length - customerSet.size },
      { name: "New", value: customerSet.size },
    ];
    const staffData = Object.entries(staffMap).map(([name, value]) => ({ name, value }));
    const recentOrders = [...orders].sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)).slice(0, 10);

    // Compute today's sales (for Daily Goal bar)
    const today = new Date();
    let todaySales = 0;
    orders.forEach(order => {
      const d = new Date(order.completedAt || order.createdAt);
      if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()) {
        todaySales += order.total || 0;
      }
    });

    // Compute yesterday's sales for trend check
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    let yesterdaySales = 0;
    // Also compute hour map to detect peak hours
    const hourMap = {};
    orders.forEach(order => {
      const d = new Date(order.completedAt || order.createdAt);
      const h = d.getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
      if (d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()) {
        yesterdaySales += order.total || 0;
      }
    });

    const trendPercent = yesterdaySales === 0 ? (todaySales > 0 ? 100 : 0) : ((todaySales - yesterdaySales) / Math.max(yesterdaySales,1)) * 100;

    // Peak hour suggestion using known peak hours (example hours) and proximity check
    const knownPeakHours = [11, 12, 13, 18, 19]; // adjust to your business
    const currentHour = new Date().getHours();
    let peakHourSuggestion = null;
    for (const ph of knownPeakHours) {
      if (Math.abs(currentHour - ph) <= 1) {
        // format e.g. "11:00 AM"
        const display = new Date();
        display.setHours(ph, 0, 0, 0);
        peakHourSuggestion = display.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        break;
      }
    }

    return {
      totalSales,
      totalOrders,
      newCustomersCount: customerSet.size,
      menuItemsSold,
      salesData,
      categoryData,
      topItems,
      customerData,
      staffData,
      recentOrders,
      kpiChanges,
      todaySales,
      yesterdaySales,
      trendPercent,
      peakHourSuggestion,
    };
  }, [orders, dateRange]);

  // Financial calculations derived from marginPercent and totalSales
  const expenses = +(totalSales * (1 - marginPercent / 100));
  const netProfit = +(totalSales - expenses);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-coffee-900">☕ Dashboard Overview</h1>
          <p className="text-coffee-600 text-sm">Welcome back! Here's your latest business summary.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-coffee-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition">
          <Calendar className="text-coffee-600 w-4 h-4" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-coffee-700 bg-transparent outline-none text-sm"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

            {/* Daily Goal Bar - full width at top (only show for Today) */}
      {dateRange === "Today" && (
        <div className="w-full bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-coffee-800">Daily Sales Goal</h3>
              <p className="text-xs text-coffee-600">Today's sales vs goal</p>
            </div>
            <div className="text-sm font-medium text-coffee-800">
              ₱{todaySales.toLocaleString()} / ₱{dailyGoal.toLocaleString()} ({Math.min(Math.round((todaySales / Math.max(dailyGoal,1)) * 100), 100)}%)
            </div>
          </div>
          <div className="w-full h-3 bg-coffee-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min((todaySales / Math.max(dailyGoal,1)) * 100, 100)}%` }}
              className="h-3 bg-gradient-to-r from-coffee-600 to-coffee-400"
            />
          </div>
        </div>
      )}

      {/* KPI Cards - Redesigned: Financial Health (hero) + Compact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Financial Health - Hero layout (spans two columns on md and up) */}
        <div className="relative rounded-2xl shadow-sm md:col-span-2 p-6 overflow-hidden"
             style={{ background: "linear-gradient(135deg,#FBF6EE 0%,#F3E8D8 50%,#EFE1C8 100%)", borderLeft: "4px solid #8E5A3A" }}>
          {/* Subtle margin dropdown top-right */}
          <div className="absolute top-4 right-4">
            <label className="sr-only">Margin</label>
            <select
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="text-xs bg-white border border-transparent rounded px-2 py-1 shadow-sm"
              aria-label="Select margin percent"
            >
              <option value={30}>30%</option>
              <option value={40}>40%</option>
              <option value={50}>50%</option>
            </select>
          </div>

          {/* Hero center: Net Profit */}
          <div className="flex flex-col items-center justify-center text-center h-40">
            <p className="text-sm font-medium text-coffee-600 mb-1">Net Profit</p>
            <p className="text-5xl font-extrabold text-green-600">₱{netProfit.toLocaleString()}</p>
            <p className="text-xs text-coffee-600 mt-2">Based on selected period</p>
          </div>

          {/* Bottom smaller secondary data: Gross Revenue & Est. Expenses */}
          <div className="absolute left-6 right-6 bottom-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex flex-col">
              <span className="text-xs">Gross Revenue</span>
              <span className="font-semibold">₱{totalSales.toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs">Est. Expenses</span>
              <span className="font-semibold text-red-600">₱{expenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Orders - big centered number with background icon */}
        <div
          className="relative rounded-2xl shadow-sm p-6 flex items-center justify-center text-center overflow-hidden"
          role="status"
          style={{ background: "linear-gradient(180deg,#FFF9F3,#FBF6EE)" }}
        >
          {/* Background icon (subtle) */}
          <ShoppingBag className="absolute right-4 top-4 opacity-10 w-32 h-32 text-coffee-800" />
          <div className="z-10">
            <p className="text-xs text-coffee-600 mb-2">Total Orders</p>
            <div className="text-[4rem] font-extrabold text-coffee-800 leading-none">{totalOrders}</div>
            <p className="text-sm text-green-600 mt-2">▲ {kpiChanges.totalOrders.toFixed(1)}% vs last period</p>
          </div>
        </div>

        {/* New Customers - big centered number with background icon */}
        <div
          className="relative rounded-2xl shadow-sm p-6 flex items-center justify-center text-center overflow-hidden"
          role="status"
          style={{ background: "linear-gradient(180deg,#FFF9F3,#FBF6EE)" }}
        >
          {/* Background icon (subtle) */}
          <Users className="absolute right-4 top-4 opacity-10 w-32 h-32 text-coffee-800" />
          <div className="z-10">
            <p className="text-xs text-coffee-600 mb-2">New Customers</p>
            <div className="text-[4rem] font-extrabold text-coffee-800 leading-none">{newCustomersCount}</div>
            <p className="text-sm text-green-600 mt-2">▲ {kpiChanges.newCustomers.toFixed(1)}% vs last period</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-coffee-800">📊 Daily Sales Report (₱)</h2>
            <NavLink to="/admin/sales" className="text-coffee-600 text-sm hover:cursor-pointer">View Details →</NavLink>
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

        {/* Manager's Insight - Notification Center */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-coffee-800">🧭 Manager's Insight</h2>
            <a href="#" className="text-coffee-600 text-sm hover:underline">View Details →</a>
          </div>
          {(() => {
            // Determine single high-priority message
            const lowProduct = products.find(p => typeof p.stock === 'number' && p.stock < 5);
            let msg = "✅ No critical alerts. All systems normal.";
            if (lowProduct) {
              msg = `⚠️ Restock Alert: ${lowProduct.name} is running low.`;
            } else if (trendPercent > 0) {
              msg = `🚀 Great Job: Sales are up ${Math.round(trendPercent)}% today.`;
            } else if (peakHourSuggestion) {
              msg = `⚡ Heads Up: Expect a rush around ${peakHourSuggestion}.`;
            }

            return (
              <div className="p-4 border rounded-lg bg-coffee-50">
                <p className="text-sm text-coffee-800">{msg}</p>
              </div>
            );
          })()}
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
    

      {/* Charts Section */}
      {/* ...rest of charts, tables, and layout remain the same, using salesData, categoryData, topItems, customerData, staffData, recentOrders */}
    </div>
    
  );
}
