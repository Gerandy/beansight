import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Users,
  ShoppingBag,
  Package,
  Calendar,
} from "lucide-react";
import {
  BarChart as BarChartComp,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as PieChartComp,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { db } from "../firebase"; // adjust path
import { collection, onSnapshot } from "firebase/firestore";

export default function Reports() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  const filterByDate = (items, dateField = "date") => {
    if (!dateRange.start || !dateRange.end) return items;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return items.filter((item) => {
      const date = item[dateField]?.toDate ? item[dateField].toDate() : new Date(item[dateField]);
      return date >= start && date <= end;
    });
  };
  

  // Fetch orders from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          total: d.total || 0,
          items: Array.isArray(d.items)
            ? d.items.map((it) => (typeof it === "string" ? it : it.name || it.item || "")).filter(Boolean)
            : [],
          customer: d.customerName || "Guest",
          date: d.date ? d.date.toDate() : d.createdAt?.toDate() || new Date(),
        };
      });
      setOrders(data);
    });

    return () => unsub();
  }, []);
  

  // Fetch inventory from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.item || "",
          stock: d.stock || 0,
        };
      });
      setInventory(data);
    });
    return () => unsub();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return orders;
    return orders.filter((o) => {
      const orderDate = new Date(o.date);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });
  }, [orders, dateRange]);

  // Stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCustomers = new Set(filteredOrders.map((o) => o.customer)).size;

  // Sales per month
  const salesData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data = Array.from({ length: 12 }, (_, i) => ({ month: months[i], sales: 0 }));
    filteredOrders.forEach((o) => {
      const month = o.date.getMonth();
      data[month].sales += o.total || 0;
    });
    return data;
  }, [filteredOrders]);

  // Top menu items
  const topMenuData = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        map[item] = (map[item] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);
  }, [filteredOrders]);

  const COLORS = ["var(--color-coffee-400)","var(--color-coffee-500)","var(--color-coffee-700)","var(--color-coffee-300)"];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(" Sales Report", 14, 22);

    // Monthly Sales
    doc.setFontSize(14);
    doc.text("Monthly Sales", 14, 32);
    const filteredOrders = filterByDate(orders);
    const salesMap = {};
    filteredOrders.forEach((o) => {
      const date = o.date?.toDate ? o.date.toDate() : new Date(o.date);
      const month = date.toLocaleString("default", { month: "short" });
      salesMap[month] = (salesMap[month] || 0) + (o.total || 0);
    });
    const salesData = Object.entries(salesMap).map(([month, sales]) => [month, sales]);
    autoTable(doc, { startY: 38, head: [["Month", "Total Sales"]], body: salesData });

    // Inventory
    autoTable(doc, { startY: doc.lastAutoTable.finalY + 10, head: [["Item", "Stock", "Status"]], body: inventory.map(i => [i.name, i.stock, i.status]) });

    

    doc.save("Sales_Report.pdf");
  };  

   const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1️⃣ Monthly Sales (aggregate by month)
    const salesMap = {};
    orders.forEach((o) => {
      const date = o.date ? new Date(o.date) : new Date();
      const month = date.toLocaleString("default", { month: "short" });
      salesMap[month] = (salesMap[month] || 0) + (o.total || 0);
    });
    const salesData = Object.entries(salesMap).map(([month, sales]) => ({ month, sales }));
    const wsSales = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.sheet_add_aoa(wsSales, [["Month", "Sales"]], { origin: "A1" });
    XLSX.utils.sheet_add_json(wsSales, salesData, { origin: "A2", skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsSales, "Monthly Sales");

    // 2️⃣ Top Menu Items (aggregate orders per item)
    const itemMap = {};
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          itemMap[item] = (itemMap[item] || 0) + 1;
        });
      }
    });
    const topMenuData = Object.entries(itemMap).map(([name, orders]) => ({ name, orders }));
    const wsMenu = XLSX.utils.json_to_sheet(topMenuData);
    XLSX.utils.sheet_add_aoa(wsMenu, [["Menu Item", "Orders"]], { origin: "A1" });
    XLSX.utils.sheet_add_json(wsMenu, topMenuData, { origin: "A2", skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsMenu, "Top Menu Items");

    // 3️⃣ Inventory
    const wsInventory = XLSX.utils.json_to_sheet(inventory);
    XLSX.utils.sheet_add_aoa(wsInventory, [["Item", "Stock", "Status"]], { origin: "A1" });
    XLSX.utils.sheet_add_json(wsInventory, inventory, { origin: "A2", skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory");

    

    // Export file
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, "Sales_Report.xlsx");
  };
  

  return (
    <div className="p-6 space-y-8 text-[var(--color-coffee-900)] animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--color-coffee-800)]">☕ Reports & Analytics</h1>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-[var(--color-coffee-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-coffee-700)] shadow-md transition">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-[var(--color-coffee-400)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-coffee-500)] shadow-md transition">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-[var(--color-coffee-700)]">Start Date</label>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="border border-[var(--color-coffee-200)] rounded-lg px-3 py-2 bg-[var(--color-coffee-100)] text-[var(--color-coffee-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-coffee-700)]">End Date</label>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="border border-[var(--color-coffee-200)] rounded-lg px-3 py-2 bg-[var(--color-coffee-100)] text-[var(--color-coffee-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"/>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: <ShoppingBag className="text-[var(--color-coffee-700)]" /> },
          { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: <BarChart3 className="text-[var(--color-coffee-500)]" /> },
          { label: "Customers", value: totalCustomers, icon: <Users className="text-[var(--color-coffee-600)]" /> },
          { label: "Low Stock Items", value: inventory.filter(i => i.stock < 5).length, icon: <Package className="text-[var(--color-coffee-800)]" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-[var(--color-coffee-200)] hover:shadow-md transition flex items-center gap-4">
            <div className="p-3 bg-[var(--color-coffee-200)] rounded-lg">{item.icon}</div>
            <div>
              <p className="text-[var(--color-coffee-600)] text-sm font-medium">{item.label}</p>
              <p className="text-xl font-bold text-[var(--color-coffee-900)]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-coffee-800)]"><BarChart3 /> Monthly Sales Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChartComp data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1B788" />
              <XAxis dataKey="month" stroke="var(--color-coffee-700)" />
              <YAxis stroke="var(--color-coffee-700)" />
              <Tooltip />
              <Bar dataKey="sales" fill="var(--color-coffee-500)" radius={[6, 6, 0, 0]} />
            </BarChartComp>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-coffee-800)]"><PieChart /> Top Performing Menu Items</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChartComp>
              <Pie data={topMenuData} dataKey="orders" nameKey="name" outerRadius={100} label>
                {topMenuData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChartComp>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory & Customer Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[var(--color-coffee-800)]"><Package /> Inventory Status</h2>
          <table className="w-full text-left border-t border-[var(--color-coffee-200)]">
            <thead>
              <tr className="text-[var(--color-coffee-600)]">
                <th className="py-2">Item</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-coffee-800)]">
              {inventory.map((i) => (
                <tr key={i.id} className="border-t border-[var(--color-coffee-200)]">
                  <td>{i.name}</td>
                  <td>{i.stock}</td>
                  <td className={`font-semibold ${i.stock < 3 ? "text-[var(--color-coffee-700)]" : i.stock < 6 ? "text-[var(--color-coffee-600)]" : "text-[var(--color-coffee-500)]"}`}>
                    {i.stock < 3 ? "Critical" : i.stock < 6 ? "Low" : "OK"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
      </div>

      {/* Footer */}
      <div className="text-sm text-[var(--color-coffee-700)] flex items-center gap-2 pt-4 border-t border-[var(--color-coffee-200)]">
        <Calendar className="w-4 h-4" />
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
