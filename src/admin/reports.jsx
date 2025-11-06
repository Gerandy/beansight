import React, { useState } from "react";
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

export default function Reports() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleDownloadPDF = () => alert("Downloading Sales Report as PDF...");
  const handleExportExcel = () => alert("Exporting Report to Excel...");

  // Sample Data
  const salesData = [
    { month: "Jan", sales: 12000 },
    { month: "Feb", sales: 15000 },
    { month: "Mar", sales: 18000 },
    { month: "Apr", sales: 14000 },
    { month: "May", sales: 21000 },
  ];

  const topMenuData = [
    { name: "Kape", orders: 320 },
    { name: "Coffee", orders: 245 },
    { name: "hot Coffee", orders: 190 },
    { name: "ice Coffee", orders: 150 },
  ];

  // Coffee color tones for charts
  const COLORS = [
    "var(--color-coffee-400)",
    "var(--color-coffee-500)",
    "var(--color-coffee-700)",
    "var(--color-coffee-300)",
  ];

  return (
    <div className="p-6 space-y-8 text-[var(--color-coffee-900)] animate-fadeIn"   >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--color-coffee-800)]">
          ☕ Reports & Analytics
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[var(--color-coffee-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-coffee-700)] shadow-md transition"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[var(--color-coffee-400)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-coffee-500)] shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-[var(--color-coffee-700)]">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="border border-[var(--color-coffee-200)] rounded-lg px-3 py-2 bg-[var(--color-coffee-100)] text-[var(--color-coffee-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-coffee-700)]">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="border border-[var(--color-coffee-200)] rounded-lg px-3 py-2 bg-[var(--color-coffee-100)] text-[var(--color-coffee-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
          />
        </div>
        <button className="bg-[var(--color-coffee-700)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-coffee-800)] shadow-sm transition">
          Apply Filter
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: "1,245",
            icon: <ShoppingBag className="text-[var(--color-coffee-700)]" />,
          },
          {
            label: "Total Revenue",
            value: "₱184,200",
            icon: <BarChart3 className="text-[var(--color-coffee-500)]" />,
          },
          {
            label: "Customers",
            value: "890",
            icon: <Users className="text-[var(--color-coffee-600)]" />,
          },
          {
            label: "Low Stock Items",
            value: "3",
            icon: <Package className="text-[var(--color-coffee-800)]" />,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-sm border border-[var(--color-coffee-200)] hover:shadow-md transition flex items-center gap-4"
          >
            <div className="p-3 bg-[var(--color-coffee-200)] rounded-lg">
              {item.icon}
            </div>
            <div>
              <p className="text-[var(--color-coffee-600)] text-sm font-medium">
                {item.label}
              </p>
              <p className="text-xl font-bold text-[var(--color-coffee-900)]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-coffee-800)]">
            <BarChart3 /> Monthly Sales Overview
          </h2>
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

        {/* Top Menu Items Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-coffee-800)]">
            <PieChart /> Top Performing Menu Items
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChartComp>
              <Pie
                data={topMenuData}
                dataKey="orders"
                nameKey="name"
                outerRadius={100}
                label
              >
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

      {/* Inventory & Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[var(--color-coffee-800)]">
            <Package /> Inventory Status
          </h2>
          <table className="w-full text-left border-t border-[var(--color-coffee-200)]">
            <thead>
              <tr className="text-[var(--color-coffee-600)]">
                <th className="py-2">Item</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-coffee-800)]">
              <tr className="border-t border-[var(--color-coffee-200)]">
                <td>Pancit Noodles</td>
                <td>5</td>
                <td className="text-[var(--color-coffee-600)] font-semibold">Low</td>
              </tr>
              <tr className="border-t border-[var(--color-coffee-200)]">
                <td>Plastic Containers</td>
                <td>2</td>
                <td className="text-[var(--color-coffee-700)] font-semibold">Critical</td>
              </tr>
              <tr className="border-t border-[var(--color-coffee-200)]">
                <td>Utensils</td>
                <td>25</td>
                <td className="text-[var(--color-coffee-500)] font-semibold">OK</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Customer Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-coffee-200)]">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[var(--color-coffee-800)]">
            <Users /> Customer Summary
          </h2>
          <ul className="space-y-1 text-[var(--color-coffee-800)]">
            <li>
              Total Customers: <strong>890</strong>
            </li>
            <li>
              New This Month: <strong>45</strong>
            </li>
            <li>
              Repeat Customers: <strong>520</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-sm text-[var(--color-coffee-700)] flex items-center gap-2 pt-4 border-t border-[var(--color-coffee-200)]">
        <Calendar className="w-4 h-4" />
        <span>Last updated: October 20, 2025</span>
      </div>
    </div>
  );
}
