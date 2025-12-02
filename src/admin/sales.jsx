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
  Cell,
  PieChart,
  Pie,
  Legend,
  Area, // <-- Added Area import
  
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase"; // adjust path if needed
import { collection, getDocs,getDoc, doc } from "firebase/firestore";
import DrillDownModal from "./layouts/dmodal"; // adjust path if needed

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

  // --- DrillDownModal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalColumns, setModalColumns] = useState([]);

  // Profit margin state (default 40%)
  const [profitMargin, setProfitMargin] = useState(0.4);

  // --- Daily Goal State & Manual Override ---
  const [manualGoal, setManualGoal] = useState(null); // number or null
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [todaySales, setTodaySales] = useState(0);

  // helper: weekday name (Sunday..Saturday)
  const weekdayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  

  // --- Date Range Filter State ---
  const [dateRangeOption, setDateRangeOption] = useState("last7"); // last7(default), thisMonth, last3, custom
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // --- Handlers for chart/table clicks ---
  function handleSummaryClick(type) {
  let title = "";
  let columns = [];
  let data = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time

  switch (type) {

    // ================= ALL CATEGORIES (ALL-TIME) =================
    case "allCategories":
    title = "All-Time Sales Summary";
    columns = ["Category", "Total"];

    // Flatten all items from all orders
    const allItems = orders.flatMap(order => order.items || []);

    // Compute totals per category
    const categoryTotals = {};
    allItems.forEach(item => {
      const cat = item.category || "Unknown";
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1; // default to 1 if missing

      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += price * quantity; // sum with quantity
    });

    // Convert totals object to table data
    data = Object.keys(categoryTotals).map(cat => ({
      Category: cat,
      Total: `₱${categoryTotals[cat].toLocaleString()}`
    }));
    break;


    // ================= TODAY'S ORDERS =================
    case "today":
      title = "Today's Orders";
      columns = ["Order ID", "Date", "Total"];

      data = orders
        .filter(o => {
          const d = parseDate(o.completedAt || o.createdAt);
          if (!d) return false;
          return d >= today;
        })
        .map(o => ({
          "Order ID": o.id,
          "Date": parseDate(o.completedAt || o.createdAt)?.toLocaleString() || "—",
          "Total": `₱${Number(o.total || 0).toLocaleString()}`
        }));
      break;

    default:
      title = "Details";
      columns = [];
      data = [];
  }

  setModalTitle(title);
  setModalColumns(columns);
  setModalData(data);
  setIsModalOpen(true);
}

  function handleTrendClick(dateStr) {
    const filtered = orders.filter(o => {
      const d = parseDate(o.completedAt || o.createdAt);
      return d && d.toLocaleDateString() === new Date(dateStr).toLocaleDateString();
    });
    setModalTitle(`Orders for ${dateStr}`);
    setModalColumns(["Order ID", "Item", "Total"]);
    setModalData(filtered.map(o => ({
      "Order ID": o.id,
      "Item": (o.items && o.items[0]?.name) || "—",
      "Total": `₱${Number(o.total || 0).toLocaleString()}`
    })));
    setIsModalOpen(true);
  }

  function handlePeakHourClick(hour) {
    const filtered = orders.filter(o => {
      const d = parseDate(o.completedAt || o.createdAt);
      return d && d.getHours() === hour;
    });
    setModalTitle(`Orders at ${hour}:00`);
    setModalColumns(["Order ID", "Item", "Total"]);
    setModalData(filtered.map(o => ({
      "Order ID": o.id,
      "Item": (o.items && o.items[0]?.name) || "—",
      "Total": `₱${Number(o.total || 0).toLocaleString()}`
    })));
    setIsModalOpen(true);
  }

  function handleChannelClick(channel) {
    setModalTitle(`Sales Channel: ${channel}`);
    setModalColumns(["Order ID", "Total"]);
    // Dummy: show all orders (replace with real channel filter if available)
    setModalData(orders.map(o => ({
      "Order ID": o.id,
      "Total": `₱${Number(o.total || 0).toLocaleString()}`
    })));
    setIsModalOpen(true);
  }

  function handlePaymentClick(method) {
    setModalTitle(`Payment Method: ${method}`);
    setModalColumns(["Order ID", "Total"]);
    // Dummy: show all orders (replace with real payment filter if available)
    setModalData(orders.map(o => ({
      "Order ID": o.id,
      "Total": `₱${Number(o.total || 0).toLocaleString()}`
    })));
    setIsModalOpen(true);
  }

  // helper: build modal for arbitrary range
  function handleGroupClick(startDate, endDate, label) {
    const filtered = orders.filter(o => {
      const d = parseDate(o.completedAt || o.createdAt);
      if (!d) return false;
      return d >= startDate && d <= endDate;
    });
    setModalTitle(`${label} — Orders (${filtered.length})`);
    setModalColumns(["Order ID", "Item", "Date", "Total"]);
    setModalData(filtered.map(o => ({
      "Order ID": o.id,
      "Item": (o.items && o.items[0]?.name) || "—",
      "Date": parseDate(o.completedAt || o.createdAt)?.toLocaleString() || "—",
      "Total": `₱${Number(o.total || 0).toLocaleString()}`
    })));
    setIsModalOpen(true);
  }

  // ---------------------------
  // Fetch orders from Firestor
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


  useEffect(()=> {
    const loadSettings = async () => {
      const docRef = await getDoc(doc(db, "settings", "analytics"));
      if(!docRef.exists()) {
        console.log("data not exists")
      }

      const data = docRef.data();

      setManualGoal(data.settings.goalAmount);

    }

    loadSettings()
  },[])

  // ---------------------------
  // Derived analytics
  // ---------------------------
  const analytics = useMemo(() => {
    let totalRevenue = 0, totalDiscounts = 0, ordersToday = 0, totalOrdersCount = 0;
    let todaySaless = 0;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const dailyMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const categoryMap = {};
    const recent = [];

    orders.forEach(order => {
      const completed = parseDate(order.completedAt) || parseDate(order.createdAt);
      if (!completed) return;
      const orderTotal = Number(order.total || 0);
      const orderDiscount = Number(order.discountAmount || 0);
     

      totalRevenue += orderTotal;
      totalDiscounts += orderDiscount;
      totalOrdersCount += 1;

      if (completed.getFullYear() === now.getFullYear() && completed.getMonth() === now.getMonth() && completed.getDate() === now.getDate()) {
        todaySaless += order.total || 0;
        setTodaySales(todaySaless)
      }
      

      if (
        completed.getFullYear() === now.getFullYear() &&
        completed.getMonth() === now.getMonth() &&
        completed.getDate() === now.getDate()
      ) ordersToday += 1;

      if (completed >= weekStart) {
        const jsDay = completed.getDay();
        const idx = jsDay === 0 ? 6 : jsDay - 1;
        dailyMap[idx] = (dailyMap[idx] || 0) + orderTotal;
      }

      if (Array.isArray(order.items)) {
        order.items.forEach(it => {
          const qty = Number(it.quantity ?? it.qty ?? 0);
          const price = Number(it.price ?? 0);
          const revenue = qty * price;
          const cat = it.category || "Uncategorized";
          categoryMap[cat] = (categoryMap[cat] || 0) + revenue;
        });
      }

      recent.push({
        id: order.id || order?.orderId || `#${Math.floor(Math.random() * 10000)}`,
        item: (Array.isArray(order.items) && order.items[0] && (order.items[0].name || order.items[0].item)) || "—",
        date: completed.toLocaleString(),
        total: `₱${orderTotal.toLocaleString()}`,
        rawTotal: orderTotal,
        completedAt: completed,
      });
    });

    const dailySales = Object.keys(dailyMap).map(k => ({
      day: dayNameFromIndex(Number(k)),
      amount: dailyMap[k],
    }));

    const categorySales = Object.entries(categoryMap)
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales);

    const recentOrders = recent
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 10)
      .map(r => ({ ...r, completedAt: undefined }));

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
      recent, // keep raw recent for comparison
    };
  }, [orders]);

  const {
    totalRevenue,
    avgOrderValue,
    ordersToday,
    totalDiscounts,
    dailySales,
    categorySales,
    recentOrders,
    totalOrdersCount,
    recent,
  } = analytics;

  // ---------------------------
  // Peak Business Hours Analytics
  // ---------------------------
  const peakHoursData = useMemo(() => {
    // Aggregate order counts by hour (0-23)
    const hourCounts = Array(24).fill(0);
    orders.forEach((order) => {
      const completed = parseDate(order.completedAt) || parseDate(order.createdAt);
      if (!completed) return;
      const hour = completed.getHours();
      hourCounts[hour]++;
    });

    // Prepare chart data with color coding
    const chartData = hourCounts.map((count, hour) => {
      let fill = "#22c55e"; // green
      if (count > 15) fill = "#ef4444"; // red
      else if (count > 5) fill = "#facc15"; // yellow
      return {
        hour,
        label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour < 12 ? " AM" : " PM"}`,
        count,
        fill,
      };
    });

    // Find peak hour range (consecutive hours with highest counts)
    let maxCount = Math.max(...hourCounts);
    let peakRanges = [];
    for (let i = 0; i < 24; i++) {
      if (hourCounts[i] === maxCount) peakRanges.push(i);
    }
    // Group consecutive hours
    let ranges = [];
    let temp = [];
    for (let i = 0; i < peakRanges.length; i++) {
      if (i === 0 || peakRanges[i] === peakRanges[i - 1] + 1) {
        temp.push(peakRanges[i]);
      } else {
        ranges.push([...temp]);
        temp = [peakRanges[i]];
      }
    }
    if (temp.length) ranges.push([...temp]);
    // Pick the longest range
    let peakRange = ranges.sort((a, b) => b.length - a.length)[0] || [];
    let startHour = peakRange[0] ?? null;
    let endHour = peakRange[peakRange.length - 1] ?? null;

    // Format time for recommendation
    function formatHour(h) {
      if (h === null) return "";
      let hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      let suffix = h < 12 ? "AM" : "PM";
      return `${hour12} ${suffix}`;
    }

    let recommendation = "No peak hours detected.";
    if (startHour !== null && endHour !== null) {
      if (startHour === endHour) {
        recommendation = `Recommendation: Your peak time is around ${formatHour(startHour)}. Schedule 3 staff members during this window.`;
      } else {
        recommendation = `Recommendation: Your peak hours are between ${formatHour(startHour)} and ${formatHour(endHour)}. Schedule 3 staff members during this window.`;
      }
    }

    return { chartData, recommendation };
  }, [orders]);

  // --- Smart Grouping for Date Ranges & Chart Title ---
  function getRangeDates(option, customStartIso, customEndIso) {
    const now = new Date();
    let start = null;
    let end = new Date(now);
    // normalize end to end of day
    end.setHours(23, 59, 59, 999);

    if (option === "last7") {
      start = new Date(now);
      start.setDate(now.getDate() - 6); // last 7 days including today
      start.setHours(0, 0, 0, 0);
    } else if (option === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
    } else if (option === "last3") {
      start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
    } else if (option === "custom") {
      if (!customStartIso || !customEndIso) return null;
      start = new Date(customStartIso);
      end = new Date(customEndIso);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      if (end < start) return null;
    }
    return { start, end };
  }

  const groupedSales = useMemo(() => {
    // returns array: [{ label, amount, startDate, endDate }]
    let range = getRangeDates(dateRangeOption, customStart, customEnd);
    if (!range) {
      // fallback to last7
      const fallback = getRangeDates("last7");
      if (!fallback) return [];
      range = fallback;
    }
    const { start, end } = range;
    const MS_DAY = 24 * 60 * 60 * 1000;
    const daysCount = Math.floor((end - start) / MS_DAY) + 1;

    // decide grouping
    let mode = "day";
    if (daysCount > 180) mode = "month";
    else if (daysCount > 31) mode = "week";

    // initialize map
    const map = new Map();

    orders.forEach((order) => {
      const d = parseDate(order.completedAt) || parseDate(order.createdAt);
      if (!d) return;
      if (d < start || d > end) return;
      const total = Number(order.total || 0);

      let key;
      let grpStart;
      let grpEnd;
      if (mode === "day") {
        const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
        key = `${y}-${m + 1}-${day}`;
        grpStart = new Date(y, m, day, 0, 0, 0, 0);
        grpEnd = new Date(y, m, day, 23, 59, 59, 999);
      } else if (mode === "week") {
        // week index relative to range.start (week 1 starts at start date)
        const diff = Math.floor((d - start) / (7 * MS_DAY));
        key = `w-${diff}`;
        const s = new Date(start);
        s.setDate(start.getDate() + diff * 7);
        s.setHours(0, 0, 0, 0);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        e.setHours(23, 59, 59, 999);
        grpStart = s;
        grpEnd = e > end ? end : e;
      } else {
        // month
        const y = d.getFullYear(), m = d.getMonth();
        key = `m-${y}-${m}`;
        grpStart = new Date(y, m, 1, 0, 0, 0, 0);
        const e = new Date(y, m + 1, 0, 23, 59, 59, 999);
        grpEnd = e > end ? end : e;
      }

      const prev = map.get(key) || { amount: 0, label: null, startDate: grpStart, endDate: grpEnd };
      prev.amount += total;
      // label lazy set
      if (!prev.label) {
        if (mode === "day") {
          prev.label = grpStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }); // "Nov 1"
        } else if (mode === "week") {
          // compute week number based on difference from start
          const diffWeek = parseInt(key.split("-")[1], 10) + 1;
          prev.label = `Week ${diffWeek}`;
        } else {
          prev.label = grpStart.toLocaleDateString(undefined, { month: "short" }); // "Jan"
        }
      }
      map.set(key, prev);
    });

    // ensure there are entries for empty groups (so chart x-axis is continuous)
    const groups = [];
    if (mode === "day") {
      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        const existing = map.get(key);
        groups.push({
          label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          amount: existing ? existing.amount : 0,
          startDate: new Date(d.setHours(0, 0, 0, 0)),
          endDate: new Date(d.setHours(23, 59, 59, 999)),
        });
      }
    } else if (mode === "week") {
      const weeks = Math.ceil(daysCount / 7);
      for (let w = 0; w < weeks; w++) {
        const s = new Date(start);
        s.setDate(start.getDate() + w * 7);
        s.setHours(0, 0, 0, 0);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        e.setHours(23, 59, 59, 999);
        const key = `w-${w}`;
        const existing = map.get(key);
        groups.push({
          label: existing ? existing.label : `Week ${w + 1}`,
          amount: existing ? existing.amount : 0,
          startDate: s,
          endDate: e > end ? end : e,
        });
      }
    } else {
      // months: iterate from start's month to end's month
      const s = new Date(start.getFullYear(), start.getMonth(), 1);
      while (s <= end) {
        const key = `m-${s.getFullYear()}-${s.getMonth()}`;
        const monthStart = new Date(s.getFullYear(), s.getMonth(), 1, 0, 0, 0, 0);
        const monthEnd = new Date(s.getFullYear(), s.getMonth() + 1, 0, 23, 59, 59, 999);
        const existing = map.get(key);
        groups.push({
          label: monthStart.toLocaleDateString(undefined, { month: "short" }),
          amount: existing ? existing.amount : 0,
          startDate: monthStart,
          endDate: monthEnd > end ? end : monthEnd,
        });
        s.setMonth(s.getMonth() + 1);
      }
    }

    return groups;
  }, [orders, dateRangeOption, customStart, customEnd]);

  // Chart title based on selection
  const chartTitle = useMemo(() => {
    const range = getRangeDates(dateRangeOption, customStart, customEnd) || getRangeDates("last7");
    if (!range) return "Revenue Trends";
    const { start, end } = range;
    const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (dateRangeOption === "thisMonth") {
      return `Revenue Trends (${start.toLocaleDateString(undefined, { month: "short", year: "numeric" })})`;
    }
    return `Revenue Trends (${fmt(start)} - ${fmt(end)})`;
  }, [dateRangeOption, customStart, customEnd]);

  // Prepare chart data with computed profit & expense so Net updates when profitMargin changes
  const dailySalesChartData = useMemo(() => {
    return groupedSales.map((g) => {
      const gross = Number(g.amount || 0);
      const net = Math.round(gross * profitMargin);
      const expense = Math.max(0, gross - net);
      return {
        ...g,
        amount: gross,
        net,
        expense,
      };
    });
  }, [groupedSales, profitMargin]);

  // --- Projected Summary (simple adaptation) ---
  const projectedSummary = useMemo(() => {
    if (!groupedSales || groupedSales.length === 0) return "";
    const last = groupedSales[groupedSales.length - 1];
    return `Showing ${groupedSales.length} points • Range: ${last ? `${groupedSales[0].label} → ${last.label}` : ""}`;
  }, [groupedSales]);

  // ---------------------------
  // KPI Comparison Logic (unchanged)
  // ---------------------------
  const kpiData = useMemo(() => {
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

  // --- KPI Comparison Logic (unchanged) ---
  const kpiComparisons = useMemo(() => {
    // Helper: get yesterday's date
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    // Helper: get last week range
    const weekStart = startOfWeek(now);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(weekStart.getDate() - 1);

    // Revenue: compare this week vs last week
    let thisWeekRevenue = 0, lastWeekRevenue = 0;
    let thisWeekOrders = 0, lastWeekOrders = 0;
    let thisWeekDiscounts = 0, lastWeekDiscounts = 0;
    let todayOrders = 0, yesterdayOrders = 0;
    let todayRevenue = 0, yesterdayRevenue = 0;

    recent.forEach(order => {
      const completed = parseDate(order.completedAt) || parseDate(order.date);
      if (!completed) return;
      const orderTotal = Number(order.rawTotal || 0);
      const orderDiscount = Number(order.discountAmount || 0);

      if (completed >= weekStart) {
        thisWeekRevenue += orderTotal;
        thisWeekOrders += 1;
        thisWeekDiscounts += orderDiscount;
      }
      if (completed >= lastWeekStart && completed <= lastWeekEnd) {
        lastWeekRevenue += orderTotal;
        lastWeekOrders += 1;
        lastWeekDiscounts += orderDiscount;
      }
      if (
        completed.getFullYear() === now.getFullYear() &&
        completed.getMonth() === now.getMonth() &&
        completed.getDate() === now.getDate()
      ) {
        todayOrders += 1;
        todayRevenue += orderTotal;
      }
      if (
        completed.getFullYear() === yesterday.getFullYear() &&
        completed.getMonth() === yesterday.getMonth() &&
        completed.getDate() === yesterday.getDate()
      ) {
        yesterdayOrders += 1;
        yesterdayRevenue += orderTotal;
      }
    });

    // Average Order Value: compare this week vs last week
    const thisWeekAOV = thisWeekOrders ? thisWeekRevenue / thisWeekOrders : 0;
    const lastWeekAOV = lastWeekOrders ? lastWeekRevenue / lastWeekOrders : 0;

    // Discounts: compare this week vs last week
    // Orders Today: compare today vs yesterday

    // Helper for percent change
    function percentChange(current, prev) {
      if (prev === 0) return current === 0 ? 0 : 100;
      return ((current - prev) / Math.abs(prev)) * 100;
    }

    return {
      revenue: {
        current: thisWeekRevenue,
        prev: lastWeekRevenue,
        change: percentChange(thisWeekRevenue, lastWeekRevenue),
        plain: percentChange(todayRevenue, yesterdayRevenue),
        todayRevenue,
        yesterdayRevenue,
      },
      avgOrderValue: {
        current: thisWeekAOV,
        prev: lastWeekAOV,
        change: percentChange(thisWeekAOV, lastWeekAOV),
      },
      orders: {
        current: todayOrders,
        prev: yesterdayOrders,
        change: percentChange(todayOrders, yesterdayOrders),
      },
      discounts: {
        current: thisWeekDiscounts,
        prev: lastWeekDiscounts,
        change: percentChange(thisWeekDiscounts, lastWeekDiscounts),
      },
    };
  }, [recent]);

  // --- Plain English for Revenue ---
  const revenuePlainEnglish = useMemo(() => {
    const change = kpiComparisons.revenue.plain;
    if (change > 0) {
      return `You are ${Math.abs(change).toFixed(1)}% above your average daily sales.`;
    } else if (change < 0) {
      return `You are ${Math.abs(change).toFixed(1)}% below your average daily sales.`;
    } else {
      return `Your sales are unchanged from yesterday.`;
    }
  }, [kpiComparisons]);

  // ---------------------------
  // Daily Sales Goal Gamification Widget
  // ---------------------------
  // Calculate dynamic goal based on historical averages for the current weekday
  const calculatedGoal = useMemo(() => {
    const now = new Date();
    const targetWeekday = now.getDay(); // 0=Sun..6=Sat

    // Aggregate revenue per calendar date (YYYY-MM-DD)
    const perDate = new Map();
    orders.forEach((order) => {
      const d = parseDate(order.completedAt) || parseDate(order.createdAt);
      if (!d) return;
      const dateKey = d.toISOString().slice(0, 10);
      const prev = perDate.get(dateKey) || 0;
      perDate.set(dateKey, prev + Number(order.total || 0));
    });

    // Filter dates that match the same weekday (exclude today)
    const sameWeekdayTotals = [];
    perDate.forEach((rev, dateKey) => {
      const d = new Date(dateKey + "T00:00:00");
      if (d.toDateString() === now.toDateString()) return; // skip today
      if (d.getDay() === targetWeekday) sameWeekdayTotals.push(rev);
    });

    if (sameWeekdayTotals.length === 0) {
      return 3000; // fallback
    }

    const avg = sameWeekdayTotals.reduce((s, v) => s + v, 0) / sameWeekdayTotals.length;
    return Math.round(avg * 1.1); // +10% target
  }, [orders]);

  // final goal: manual override wins if set
  const finalGoal = manualGoal ?? calculatedGoal;

  const todayRevenue = kpiComparisons.revenue.todayRevenue || 0;
  const goalProgress = Math.min((todayRevenue / Math.max(finalGoal, 1)) * 100, 100);
  let progressColor = "#f59e42";
  if (goalProgress > 80) progressColor = "#22c55e";

  const goalMessage =
    todayRevenue < finalGoal
      ? `You need ₱${(finalGoal - todayRevenue).toLocaleString()} more to hit your target!`
      : `Great job! You beat your goal by ₱${(todayRevenue - finalGoal).toLocaleString()}!`;

  // --- Transaction Insights Dummy Data ---
  // Sales Channel Breakdown (POS vs Online)
  const channelData = [
    { name: "Walk-in (POS)", value: 120000 },
    { name: "Online", value: 80000 },
  ];
  const totalChannel = channelData.reduce((sum, d) => sum + d.value, 0);
  const onlinePercent = Math.round((channelData[1].value / totalChannel) * 100);
  const posPercent = Math.round((channelData[0].value / totalChannel) * 100);

  let channelInsight = "";
  if (onlinePercent > 40) {
    channelInsight = `Your mobile app strategy is working! ${onlinePercent}% of sales are online.`;
  } else if (posPercent > 80) {
    channelInsight = "Most customers are still ordering in-store. Consider promoting the app.";
  } else {
    channelInsight = `Online orders make up ${onlinePercent}% of sales.`;
  }

  // Payment Method Analysis (Cash, GCash only)
  const paymentData = [
    { name: "Cash", value: 110000 },
    { name: "GCash", value: 90000 },
  ];
  const totalPayment = paymentData.reduce((sum, d) => sum + d.value, 0);
  const cashPercent = Math.round((paymentData[0].value / totalPayment) * 100);
  const digitalPercent = Math.round((paymentData[1].value / totalPayment) * 100);

  let paymentInsight = "";
  if (cashPercent > 50) {
    paymentInsight = "Cash is the dominant payment method. Ensure the register has sufficient change.";
  } else if (digitalPercent > 50) {
    paymentInsight = "Digital payments are high. Cash handling time is reduced.";
  } else {
    paymentInsight = `Cash: ${cashPercent}%, Digital: ${digitalPercent}%`;
  }

  // Sol-Ace palette
  const solAceColors = ["#8E5A3A", "#C28F5E", "#F5E9DA", "#6A3D26", "#F9F6F2"];

    function formatCurrency(v) {
    return `₱${Number(v || 0).toLocaleString()}`;
  }

  function CustomSalesTooltip({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) return null;
    const amountPoint = payload.find((p) => p.dataKey === "amount") || payload[0];
    const netPoint = payload.find((p) => p.dataKey === "net");
    return (
      <div className="bg-white p-2 rounded shadow text-xs">
        <div className="font-semibold mb-1">{label}</div>
        <div>Revenue: {formatCurrency(amountPoint?.value ?? 0)}</div>
        <div>Est. Profit: {formatCurrency(netPoint?.value ?? 0)}</div>
      </div>
    );
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 space-y-8 font-sans">
      {/* DrillDownModal */}
      <DrillDownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
      />

      <h1 className="text-3xl font-bold text-coffee-800 mb-4">☕ Sales Report</h1>

      {loading && <div className="text-sm text-coffee-600">Loading...</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div
          className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600 cursor-pointer"
          onClick={() => handleSummaryClick("allCategories")}
        >
          <h2 className="text-sm text-coffee-500">Total Revenue</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{Number(totalRevenue).toLocaleString()}</p>
          
          <p className="text-green-600 text-l mt-1">Click to see what Category </p>
        </div>

        <div
          className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600 cursor-pointer"
          onClick={() => handleSummaryClick("today")}
        >
          <h2 className="text-sm text-coffee-500">Todays Sale</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{Number(todaySales).toLocaleString()}</p>
          <div className="flex items-center text-sm mt-1">
            {kpiComparisons.revenue.change > 0 ? (
              <span className="text-green-600 font-bold mr-1">▲ {Math.abs(kpiComparisons.revenue.change).toFixed(1)}%</span>
            ) : kpiComparisons.revenue.change < 0 ? (
              <span className="text-red-600 font-bold mr-1">▼ {Math.abs(kpiComparisons.revenue.change).toFixed(1)}%</span>
            ) : (
              <span className="text-coffee-500 font-bold mr-1">—</span>
            )}
            <span className="text-coffee-500">vs last week</span>
          </div>
          <p className="text-green-600 text-xs mt-1">{revenuePlainEnglish}</p>
        </div>

        {/* Average Order Value Card */}
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Average Order Value</h2>
          <p className="text-3xl font-bold text-coffee-700">₱{avgOrderValue.toFixed(2)}</p>
          <div className="flex items-center text-sm mt-1">
            {kpiComparisons.avgOrderValue.change > 0 ? (
              <span className="text-green-600 font-bold mr-1">▲ {Math.abs(kpiComparisons.avgOrderValue.change).toFixed(1)}%</span>
            ) : kpiComparisons.avgOrderValue.change < 0 ? (
              <span className="text-red-600 font-bold mr-1">▼ {Math.abs(kpiComparisons.avgOrderValue.change).toFixed(1)}%</span>
            ) : (
              <span className="text-coffee-500 font-bold mr-1">—</span>
            )}
            <span className="text-coffee-500">vs last week</span>
          </div>
          <p className="text-green-600 text-sm">based on {totalOrdersCount} orders</p>
        </div>

        {/* Orders Today Card */}
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Orders Today</h2>
          <p className="text-3xl font-bold text-coffee-700">{ordersToday}</p>
          <div className="flex items-center text-sm mt-1">
            {kpiComparisons.orders.change > 0 ? (
              <span className="text-green-600 font-bold mr-1">▲ {Math.abs(kpiComparisons.orders.change).toFixed(1)}%</span>
            ) : kpiComparisons.orders.change < 0 ? (
              <span className="text-red-600 font-bold mr-1">▼ {Math.abs(kpiComparisons.orders.change).toFixed(1)}%</span>
            ) : (
              <span className="text-coffee-500 font-bold mr-1">—</span>
            )}
            <span className="text-coffee-500">vs yesterday</span>
          </div>
          <p className="text-green-600 text-sm">updated from orders</p>
        </div>
      </div>

      {/* Daily Sales Goal Widget */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-5 my-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-coffee-800 font-semibold text-base">
            Daily Goal: ₱{finalGoal.toLocaleString()} <span className="text-xs text-coffee-500"> (Based on your Inputed on average)</span>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditingGoal ? (
              <>
                <button
                  title="Edit goal"
                  onClick={() => {
                    setGoalInput(String(finalGoal));
                    setIsEditingGoal(true);
                  }}
                  className="text-coffee-600 hover:text-coffee-800"
                >
                  {/* simple pencil icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6L20 12l-6-6-6 6z" />
                  </svg>
                </button>
                {manualGoal !== null && (
                  <button
                    title="Clear manual goal"
                    onClick={() => setManualGoal(null)}
                    className="text-xs px-2 py-1 border rounded text-coffee-600"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="text-xs px-2 py-1 rounded-md border w-28"
                />
                <button
                  onClick={() => {
                    const v = Number(goalInput);
                    if (!isNaN(v) && v >= 0) {
                      setManualGoal(Math.round(v));
                    }
                    setIsEditingGoal(false);
                  }}
                  className="text-xs px-2 py-1 rounded-md border bg-coffee-800 text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="text-xs px-2 py-1 rounded-md border bg-white text-coffee-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
         <div className="w-full h-6 bg-coffee-100 rounded-full overflow-hidden relative mb-2">
           <div
             style={{
               width: `${goalProgress}%`,
               background: progressColor,
               transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
               height: "100%",
               borderRadius: "9999px",
               boxShadow: "0 2px 8px rgba(34,197,94,0.08)",
             }}
           />
           <span
             style={{
               position: "absolute",
               left: "50%",
               top: "50%",
               transform: "translate(-50%, -50%)",
               fontWeight: 600,
               color: "#6A3D26",
               fontSize: "0.95rem",
             }}
           >
             {goalProgress.toFixed(1)}%
           </span>
         </div>
         <div className="text-coffee-700 text-sm mt-1">{goalMessage}</div>
       </div>

      {/* Charts: Daily Sales (left) + Category Performance Table (right) */}
      {/* Stack the charts so Revenue Trends is full width and Category Performance sits below */}
      <div className="grid grid-cols-1 gap-6">
        {/* Daily Sales Line Chart (max width) */}
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-full">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-coffee-800">{chartTitle}</h2>
             <div className="flex items-center space-x-3">
               <span className="text-xs text-coffee-500 font-medium">{projectedSummary}</span>

               {/* Date Range Controls */}
               <div className="flex items-center space-x-2">
                <select
                  value={dateRangeOption}
                  onChange={(e) => setDateRangeOption(e.target.value)}
                  className="text-xs px-2 py-1 rounded-md border bg-white text-coffee-700"
                >
                  <option value="last7">Last 7 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="last3">Last 3 Months</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRangeOption === "custom" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="text-xs px-2 py-1 rounded-md border bg-white text-coffee-700"
                    />
                    <span className="text-coffee-500">—</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="text-xs px-2 py-1 rounded-md border bg-white text-coffee-700"
                    />
                    <button
                      onClick={() => {
                        // basic validation
                        if (!customStart || !customEnd) return;
                        const s = new Date(customStart);
                        const e = new Date(customEnd);
                        if (e < s) {
                          alert("End date must be on or after start date.");
                          return;
                        }
                        // trigger groupedSales recompute via state -- nothing else needed
                      }}
                      className="text-xs px-2 py-1 rounded-md border bg-coffee-800 text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Profit margin toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-coffee-500 mr-2">Profit Margin:</span>
                  {[0.3, 0.4, 0.5].map((m) => (
                    <button
                      key={m}
                      onClick={() => setProfitMargin(m)}
                      className={`text-xs px-2 py-1 rounded-md border ${
                        profitMargin === m ? "bg-coffee-800 text-white" : "bg-white text-coffee-700"
                      }`}
                    >
                      {Math.round(m * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={dailySalesChartData}
              onClick={(e) => {
                // chart click will return activePayload etc; find group with label
                if (e && e.activeLabel) {
                  const item = dailySalesChartData.find((d) => d.label === e.activeLabel);
                  if (item) {
                    handleGroupClick(item.startDate, item.endDate, item.label);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#6A3D26" />
              <YAxis stroke="#6A3D26" />
              <Tooltip content={<CustomSalesTooltip />} />

              {/* Stacked areas to visualize net vs expense (expense = gross - net) */}
              <Area
                type="monotone"
                dataKey="net"
                stackId="1"
                stroke="none"
                fill="rgba(34,197,94,0.04)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="1"
                stroke="none"
                fill="rgba(240,108,55,0.12)"
                isAnimationActive={false}
              />

              {/* Gross Sales (Brown) - solid, thick */}
              <Line
                type="monotone"
                dataKey="amount"
                name="Gross Sales"
                stroke="#8E5A3A"
                strokeWidth={3}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />

              {/* Net Profit (Green) - dashed, slightly thinner */}
              <Line
                type="monotone"
                dataKey="net"
                name="Net Profit"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance (below Revenue Trends) */}
        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
           <h2 className="text-lg font-semibold mb-4 text-coffee-800">Category Performance</h2>
           <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-coffee-100 text-coffee-800">
                <th className="py-2 px-4 rounded-l-lg">Category</th>
                <th className="py-2 px-4">Sales Amount</th>
                <th className="py-2 px-4 rounded-r-lg">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {categorySales.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-coffee-500">No category data</td>
                </tr>
              )}
              {categorySales
                .sort((a, b) => b.sales - a.sales)
                .map((cat) => {
                  const percent = totalRevenue > 0 ? (cat.sales / totalRevenue) * 100 : 0;
                  return (
                    <tr
                      key={cat.category}
                      className="border-b border-coffee-100 text-coffee-900 hover:bg-coffee-800 hover:text-coffee-50 transition"
                    >
                      <td className="py-2 px-4">{cat.category}</td>
                      <td className="py-2 px-4">₱{Number(cat.sales).toLocaleString()}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-coffee-700 font-semibold">{percent.toFixed(0)}%</span>
                          <div className="h-3 w-24 bg-coffee-100 rounded-full overflow-hidden">
                            <div
                              style={{
                                width: `${percent}%`,
                                background: "#C28F5E",
                                height: "100%",
                                borderRadius: "9999px",
                                transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Business Hours Analytics */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full">
        <h2 className="text-lg font-semibold mb-4 text-coffee-800">Peak Business Hours</h2>
        <div className="mb-4 text-coffee-700 font-medium">{peakHoursData.recommendation}</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={peakHoursData.chartData}
            onClick={(e) => {
              if (e && e.activeLabel) {
                // Find hour from label
                const hourObj = peakHoursData.chartData.find((d) => d.label === e.activeLabel);
                if (hourObj) handlePeakHourClick(hourObj.hour);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#6A3D26" />
            <YAxis stroke="#6A3D26" allowDecimals={false} />
            <Tooltip formatter={(value) => `${value} orders`} />
            <Bar dataKey="count">
              {peakHoursData.chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-coffee-500">
          <span className="inline-block w-3 h-3 mr-1 rounded-full bg-green-500"></span>Low (0-5)
          <span className="inline-block w-3 h-3 mx-2 rounded-full bg-yellow-400"></span>Medium (6-15)
          <span className="inline-block w-3 h-3 mx-2 rounded-full bg-red-500"></span>High (15+)
        </div>
      </div>

      {/* Transaction Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Card 1: Sales Channel Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">Sales Channel Breakdown</h2>
          <PieChart width={220} height={220}>
            <Pie
              data={channelData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              onClick={(data, idx) => handleChannelClick(channelData[idx].name)}
            >
              {channelData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={solAceColors[idx % solAceColors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `₱${Number(value).toLocaleString()} (${((value / totalChannel) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
          <div className="mt-4 text-coffee-700 text-sm text-center">{channelInsight}</div>
        </div>

       
        
      </div>
    </div>
  );
}
