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
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { NavLink } from "react-router-dom";
import DrillDownModal from "./layouts/dmodal";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonPieChart,
  SkeletonFinancialCard,
  SkeletonGoalWidget,
} from "../components/SkeletonLoader";

// Helper to calculate % change
function calcPercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper to check if a date is in the selected period
function filterByPeriod(date, period, customStart, customEnd) {
  const d = new Date(date);
  const now = new Date();

  if (period === "Today") {
    const start = new Date(now);
    start.setHours(0,0,0,0);
    const end = new Date(now);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  }

  if (period === "This Month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  if (period === "Custom Range" && customStart && customEnd) {
    const start = new Date(customStart);
    start.setHours(0,0,0,0);
    const end = new Date(customEnd);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  }

  return false;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("Today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [marginPercent, setMarginPercent] = useState(40); // shows "Margin: 40%"
  const [dailyGoal, setDailyGoal] = useState(5000); // default daily goal (₱)

  // New: products for inventory checks
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]); // Add inventory state
  const [expensesData, setExpensesData] = useState([]); // Add expenses state

  // Modal states
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [financialView, setFinancialView] = useState("gross"); // 'gross', 'net', 'expenses'
  const [expandedSections, setExpandedSections] = useState({ daily: false, category: false, gross: false, expenses: false });

  // -------------------------------
  // Fetch Orders from Firestore
  // -------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersSnap, productsSnap, inventorySnap, expensesSnap] = await Promise.all([
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "products")),
          getDocs(collection(db, "inventory")),
          getDocs(collection(db, "expenses")),
        ]);

        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setInventory(inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setExpensesData(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -------------------------------
  // Compute today's sales, yesterday's sales, trend, and peak hour suggestion
  // -------------------------------
  const { todaySales, yesterdaySales, trendPercent, peakHourSuggestion } = useMemo(() => {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    let todaySales = 0;
    let yesterdaySales = 0;
    const hourMap = {};

    orders.forEach(order => {
      const d = new Date(order.completedAt || order.createdAt);
      const h = d.getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;

      if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()) {
        todaySales += order.total || 0;
      }
      if (d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()) {
        yesterdaySales += order.total || 0;
      }
    });

    const trendPercent = yesterdaySales === 0 ? (todaySales > 0 ? 100 : 0) : ((todaySales - yesterdaySales) / Math.max(yesterdaySales,1)) * 100;

    // Peak hour suggestion using known peak hours and proximity check
    const knownPeakHours = [11, 12, 13, 18, 19]; // adjust to your business
    const currentHour = new Date().getHours();
    let peakHourSuggestion = null;
    for (const ph of knownPeakHours) {
      if (Math.abs(currentHour - ph) <= 1) {
        const display = new Date();
        display.setHours(ph, 0, 0, 0);
        peakHourSuggestion = display.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        break;
      }
    }

    return { todaySales, yesterdaySales, trendPercent, peakHourSuggestion };
  }, [orders]);

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
    totalExpenses,
    categorySalesData,
    periodTitle,
    periodUnit,
  } = useMemo(() => {
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    // Get previous period for comparison
    const getPreviousPeriod = (period, customStart, customEnd) => {
      const now = new Date();
      if (period === "Today") {
        const start = new Date(now); start.setHours(0,0,0,0);
        const prevStart = new Date(start); prevStart.setDate(start.getDate() - 1);
        const prevEnd = new Date(prevStart); prevEnd.setHours(23,59,59,999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevStart && d <= prevEnd;
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
      if (period === "Custom Range" && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - daysDiff);
        const prevEnd = new Date(start);
        prevEnd.setDate(start.getDate() - 1);
        prevEnd.setHours(23,59,59,999);
        return orders.filter(o => {
          const d = new Date(o.completedAt || o.createdAt);
          return d >= prevStart && d <= prevEnd;
        });
      }
      return [];
    };

    const previousOrders = getPreviousPeriod(dateRange, customStartDate, customEndDate);

    // KPI calculations
    let totalSales = 0;
    let menuItemsSold = 0;
    let totalOrders = 0;
    const customerSet = new Set();
    const salesMap = {};
    const categoryMap = {};
    const categorySalesMap = {};
    const topItemsMap = {};
    const staffMap = {};

    orders.forEach(order => {
      const completedDate = new Date(order.completedAt || order.createdAt);
      if (filterByPeriod(completedDate, dateRange, customStartDate, customEndDate)) {
        totalSales += order.total || 0;
        totalOrders += 1;
        if (order.customerName && !customerSet.has(order.customerName)) customerSet.add(order.customerName);

        (order.items || []).forEach(item => {
          categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
          categorySalesMap[item.category] = (categorySalesMap[item.category] || 0) + (item.quantity * (item.price || 0));
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

    // Calculate total expenses for the period
    let totalExpenses = 0;
    expensesData.forEach(exp => {
      const d = new Date(exp.date);
      if (filterByPeriod(d, dateRange, customStartDate, customEndDate)) {
        totalExpenses += exp.amount || 0;
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

    // Dynamic sales data based on period
    let salesData = [];
    let periodTitle = "Sales Report";
    let periodUnit = "day";

    if (dateRange === "Today") {
      // By hour (0-23)
      const hourMap = {};
      orders.forEach(order => {
        const d = new Date(order.completedAt || order.createdAt);
        if (filterByPeriod(d, dateRange, customStartDate, customEndDate)) {
          const hour = d.getHours();
          hourMap[hour] = (hourMap[hour] || 0) + (order.total || 0);
        }
      });
      salesData = Array.from({ length: 24 }, (_, i) => ({ unit: i, sales: hourMap[i] || 0 }));
      periodTitle = "Today's Sales Report";
      periodUnit = "hour";
    } else if (dateRange === "This Month") {
      // By day of month (1-31)
      const dayMap = {};
      orders.forEach(order => {
        const d = new Date(order.completedAt || order.createdAt);
        if (filterByPeriod(d, dateRange, customStartDate, customEndDate)) {
          const day = d.getDate();
          dayMap[day] = (dayMap[day] || 0) + (order.total || 0);
        }
      });
      salesData = Array.from({ length: 31 }, (_, i) => ({ unit: i + 1, sales: dayMap[i + 1] || 0 }));
      periodTitle = "Monthly Sales Report";
      periodUnit = "day";
    } else if (dateRange === "Custom Range" && customStartDate && customEndDate) {
      // By day in custom range
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const dayMap = {};
      orders.forEach(order => {
        const d = new Date(order.completedAt || order.createdAt);
        if (filterByPeriod(d, dateRange, customStartDate, customEndDate)) {
          const dateKey = d.toLocaleDateString();
          dayMap[dateKey] = (dayMap[dateKey] || 0) + (order.total || 0);
        }
      });
      salesData = Array.from({ length: daysDiff }, (_, i) => {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateKey = currentDate.toLocaleDateString();
        return { unit: dateKey, sales: dayMap[dateKey] || 0 };
      });
      periodTitle = "Custom Range Sales Report";
      periodUnit = "day";
    }

    // Chart & Table Data
    const categoryData = Object.entries(categoryMap).map(([category, value]) => ({ category, value }));
    const categorySalesData = Object.entries(categorySalesMap).map(([category, sales]) => ({ category, sales }));
    const topItems = Object.values(topItemsMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
    const customerData = [
      { name: "Returning", value: orders.length - customerSet.size },
      { name: "New", value: customerSet.size },
    ];
    const staffData = Object.entries(staffMap).map(([name, value]) => ({ name, value }));
    const recentOrders = [...orders].sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)).slice(0, 10);

    return {
      totalSales,
      totalOrders,
      newCustomersCount: customerSet.size,
      menuItemsSold,
      salesData,
      periodTitle,
      periodUnit,
      categoryData,
      topItems,
      customerData,
      staffData,
      recentOrders,
      kpiChanges,
      totalExpenses,
      categorySalesData,
    };
  }, [orders, dateRange, customStartDate, customEndDate, expensesData]);

  // Financial calculations: use real expenses
  const expenses = totalExpenses;
  const netProfit = totalSales - expenses;

  // Functions to get data and columns for financial modal
  const getFinancialData = (view) => {
    if (view === "gross") {
      const dailyTotal = salesData.reduce((s, d) => s + d.sales, 0);
      const categoryTotal = categorySalesData.reduce((s, c) => s + c.sales, 0);
      let data = [
        { Detail: "Daily Sales", Value: `₱${dailyTotal.toLocaleString()}`, Breakdown: "Click to expand", expandable: true, type: "daily" },
      ];
      if (expandedSections.daily) {
        data.push(...salesData.map(d => ({ Detail: `  ${d.unit}`, Value: `₱${d.sales.toLocaleString()}`, Breakdown: "Daily contribution" })));
      }
      data.push({ Detail: "Category Sales", Value: `₱${categoryTotal.toLocaleString()}`, Breakdown: "Click to expand", expandable: true, type: "category" });
      if (expandedSections.category) {
        data.push(...categorySalesData.sort((a, b) => b.sales - a.sales).map(c => ({ Detail: `  ${c.category}`, Value: `₱${c.sales.toLocaleString()}`, Breakdown: "By category" })));
      }
      data.push({ Detail: "Total Gross Revenue", Value: `₱${totalSales.toLocaleString()}`, Breakdown: "Sum of all sales in the selected period" });
      return data;
    }
    if (view === "net") {
      let data = [
        { Detail: "Gross Revenue", Value: `₱${totalSales.toLocaleString()}`, Breakdown: "Click to expand", expandable: true, type: "gross" },
      ];
      if (expandedSections.gross) {
        data.push(...salesData.map(d => ({ Detail: `  ${d.unit}`, Value: `₱${d.sales.toLocaleString()}`, Breakdown: "Daily contribution" })));
        data.push(...categorySalesData.sort((a, b) => b.sales - a.sales).map(c => ({ Detail: `  ${c.category}`, Value: `₱${c.sales.toLocaleString()}`, Breakdown: "By category" })));
      }
      data.push({ Detail: "Expenses", Value: `₱${expenses.toLocaleString()}`, Breakdown: "Click to expand", expandable: true, type: "expenses" });
      if (expandedSections.expenses) {
        const periodExpenses = expensesData.filter(exp => filterByPeriod(new Date(exp.date), dateRange, customStartDate, customEndDate)).sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        data.push(...periodExpenses.map(exp => ({ Detail: `  ${exp.category || "Uncategorized"}`, Value: `₱${exp.amount.toLocaleString()}`, Breakdown: new Date(exp.date).toLocaleDateString() })));
      }
      data.push({ Detail: "Net Profit", Value: `₱${netProfit.toLocaleString()}`, Breakdown: `Gross - Expenses = Net` });
      return data;
    }
    if (view === "expenses") {
      const periodExpenses = expensesData.filter(exp => filterByPeriod(new Date(exp.date), dateRange, customStartDate, customEndDate)).sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      if (periodExpenses.length === 0) {
        return [{ Detail: "No expenses data available", Value: "", Breakdown: "" }];
      }
      return periodExpenses.map(exp => ({
        Detail: exp.category || "Uncategorized",
        Value: `₱${exp.amount.toLocaleString()}`,
        Breakdown: new Date(exp.date).toLocaleDateString()
      }));
    }
    return [];
  };

  const getFinancialColumns = (view) => ["Detail", "Value", "Breakdown"];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Daily Goal Skeleton */}
        {dateRange === "Today" && <SkeletonGoalWidget />}

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <SkeletonFinancialCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Customer Analytics + Top Selling Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonPieChart />
          <SkeletonTable rows={5} />
        </div>

        {/* Staff Performance + Recent Orders Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonTable rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-coffee-900">☕ Dashboard Overview</h1>
          <p className="text-coffee-600 text-sm">Welcome back! Here's your latest business summary.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-coffee-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition">
            <Calendar className="text-coffee-600 w-4 h-4" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-coffee-700 bg-transparent outline-none text-sm"
            >
              <option>Today</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
          {dateRange === "Custom Range" && (
            <div className="flex items-center gap-2 bg-white border border-coffee-200 px-3 py-2 rounded-lg shadow-sm">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-coffee-700 bg-transparent outline-none text-sm"
              />
              <span className="text-coffee-600">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-coffee-700 bg-transparent outline-none text-sm"
              />
            </div>
          )}
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
          {/* View Details button to open modal */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => { setFinancialModalOpen(true); setFinancialView("gross"); }}
              className="text-coffee-600 text-sm hover:underline cursor-pointer bg-transparent border-none"
            >
              View Details →
            </button>
          </div>

          {/* Hero center: Net Profit/Loss */}
          <div className="flex flex-col items-center justify-center text-center h-40">
            <p className="text-sm font-medium text-coffee-600 mb-1">
              {netProfit < 0 ? "Net Loss" : "Net Profit"}
            </p>
            <p className={`text-5xl font-extrabold ${netProfit < 0 ? "text-red-600" : "text-green-600"}`}>
              ₱{Math.abs(netProfit).toLocaleString()}
            </p>
            <p className="text-xs text-coffee-600 mt-2">Based on selected period</p>
          </div>

          {/* Bottom smaller secondary data: Gross Revenue & Expenses */}
          <div className="absolute left-6 right-6 bottom-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex flex-col">
              <span className="text-xs">Gross Revenue</span>
              <span className="font-semibold">₱{totalSales.toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs">Expenses</span>
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
            <h2 className="text-lg font-semibold text-coffee-800">📊 {periodTitle} (₱)</h2>
            <NavLink to="/admin/sales" className="text-coffee-600 text-sm hover:cursor-pointer">View Details →</NavLink>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6E3CC" />
              <XAxis dataKey="unit" stroke="#8E5A3A" />
              <YAxis stroke="#8E5A3A" />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#C28F5E" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Insights Section */}
          <div className="mt-4 pt-4 border-t border-coffee-100">
            <h4 className="text-sm font-semibold text-coffee-800 mb-3">💡 Key Insights</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-green-600">💰</span>
                <div>
                  <p className="text-sm font-medium text-coffee-800">Total Sales</p>
                  <p className="text-lg font-bold text-green-600">₱{totalSales.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🏆</span>
                <div>
                  <p className="text-sm font-medium text-coffee-800">Highest {periodUnit.charAt(0).toUpperCase() + periodUnit.slice(1)}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {salesData.reduce((max, d) => d.sales > max.sales ? d : max, salesData[0])?.unit || "N/A"} (₱{Math.max(...salesData.map(d => d.sales)).toLocaleString()})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">📈</span>
                <div>
                  <p className="text-sm font-medium text-coffee-800">Average {periodUnit.charAt(0).toUpperCase() + periodUnit.slice(1)}ly</p>
                  <p className="text-lg font-bold text-purple-600">₱{salesData.length ? (totalSales / salesData.length).toFixed(2) : 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {kpiChanges.totalSales > 0 ? <span className="text-green-600">📊</span> : kpiChanges.totalSales < 0 ? <span className="text-red-600">📉</span> : <span className="text-gray-600">➡️</span>}
                <div>
                  <p className="text-sm font-medium text-coffee-800">vs Last Period</p>
                  <p className={`text-lg font-bold ${kpiChanges.totalSales > 0 ? 'text-green-600' : kpiChanges.totalSales < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {kpiChanges.totalSales > 0 ? `▲ ${kpiChanges.totalSales.toFixed(1)}%` : kpiChanges.totalSales < 0 ? `▼ ${Math.abs(kpiChanges.totalSales).toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-coffee-50 rounded-lg">
              <p className="text-xs text-coffee-700">
                <strong>Tip:</strong> Focus efforts on the highest-performing {periodUnit} to maximize revenue.
              </p>
            </div>
          </div>
        </div>

        {/* Manager's Insight - Notification Center */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-coffee-800">🧭 Manager's Insight</h2>
          </div>
          {(() => {
            // Collect up to 3 messages
            const messages = [];
            const lowProduct = inventory.find(p => typeof p.stock === 'number' && p.stock < (p.reorderLevel || 0));
            if (lowProduct) {
              messages.push(`⚠️ Restock Alert: ${lowProduct.item} is running low.`);
            }
            if (trendPercent > 0) {
              messages.push(`🚀 Great Job: Sales are up ${Math.round(trendPercent)}% today.`);
            }
            if (peakHourSuggestion) {
              messages.push(`⚡ Heads Up: Expect a rush around ${peakHourSuggestion}.`);
            }
            const pendingOrders = orders.filter(o => o.status === "Pending").length;
            if (pendingOrders > 0) {
              messages.push(`⏳ Pending Orders: ${pendingOrders} orders awaiting completion.`);
            }
            // Always add profit/loss status
            if (netProfit > 0) {
              messages.push(`💰 Business profited: Net profit ₱${netProfit.toLocaleString()}.`);
            } else if (netProfit < 0) {
              messages.push(`💸 Business did not profit: Net loss ₱${Math.abs(netProfit).toLocaleString()}.`);
            } else {
              messages.push(`😐 Business broke even: No net profit or loss.`);
            }

            // Function to get color style based on message type
            const getMessageStyle = (msg) => {
              if (msg.startsWith('⚠️')) return 'bg-red-50 border-red-200 text-red-800';
              if (msg.startsWith('🚀') || msg.startsWith('💰')) return 'bg-green-50 border-green-200 text-green-800';
              if (msg.startsWith('⚡')) return 'bg-blue-50 border-blue-200 text-blue-800';
              if (msg.startsWith('💸')) return 'bg-red-50 border-red-200 text-red-800';
              if (msg.startsWith('⏳')) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
              return 'bg-gray-50 border-gray-200 text-gray-800';
            };

            return (
              <div className="p-4 border rounded-lg bg-coffee-50 space-y-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-md border shadow-sm text-sm ${getMessageStyle(msg)}`}>
                    {msg}
                  </div>
                ))}
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
    
      {/* Financial Modal */}
      <DrillDownModal
        isOpen={financialModalOpen}
        onClose={() => setFinancialModalOpen(false)}
        title="Financial Details"
        data={getFinancialData(financialView)}
        columns={getFinancialColumns(financialView)}
        viewOptions={["gross", "net", "expenses"]}
        currentView={financialView}
        onViewChange={(view) => {
          setFinancialView(view);
          setExpandedSections({ daily: false, category: false, gross: false, expenses: false });
        }}
        onRowClick={(type) => setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }))}
      />
    </div>
  );
}
