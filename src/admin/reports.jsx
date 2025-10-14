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

  const handleDownloadPDF = () => {
    alert("Downloading Sales Report as PDF...");
  };

  const handleExportExcel = () => {
    alert("Exporting Report to Excel...");
  };

  // Sample Data
  const salesData = [
    { month: "Jan", sales: 12000 },
    { month: "Feb", sales: 15000 },
    { month: "Mar", sales: 18000 },
    { month: "Apr", sales: 14000 },
    { month: "May", sales: 21000 },
  ];

  const topMenuData = [
    { name: "Pancit Bilao", orders: 320 },
    { name: "Palabok Bilao", orders: 245 },
    { name: "Spaghetti Bilao", orders: 190 },
    { name: "Carbonara Bilao", orders: 150 },
  ];

  const COLORS = ["#4f46e5", "#22c55e", "#facc15", "#f97316"];

  return (
    <div className="p-6 space-y-8 text-gray-800 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">📊 Reports & Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Apply Filter
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: "1,245",
            icon: <ShoppingBag className="text-blue-500" />,
          },
          {
            label: "Total Revenue",
            value: "₱184,200",
            icon: <BarChart3 className="text-green-500" />,
          },
          {
            label: "Customers",
            value: "890",
            icon: <Users className="text-yellow-500" />,
          },
          {
            label: "Low Stock Items",
            value: "3",
            icon: <Package className="text-red-500" />,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4 border hover:shadow-lg transition"
          >
            <div className="p-3 bg-gray-100 rounded-lg">{item.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 /> Monthly Sales Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChartComp data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChartComp>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Package /> Inventory Status
          </h2>
          <table className="w-full text-left border-t">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2">Item</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td>Pancit Noodles</td>
                <td>5</td>
                <td className="text-orange-600 font-semibold">Low</td>
              </tr>
              <tr className="border-t">
                <td>Plastic Containers</td>
                <td>2</td>
                <td className="text-red-600 font-semibold">Critical</td>
              </tr>
              <tr className="border-t">
                <td>Utensils</td>
                <td>25</td>
                <td className="text-green-600 font-semibold">OK</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users /> Customer Summary
          </h2>
          <ul className="space-y-1 text-gray-700">
            <li>Total Customers: <strong>890</strong></li>
            <li>New This Month: <strong>45</strong></li>
            <li>Repeat Customers: <strong>520</strong></li>
          </ul>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="text-sm text-gray-500 flex items-center gap-2 pt-4 border-t">
        <Calendar className="w-4 h-4" />
        <span>Last updated: October 14, 2025</span>
      </div>
    </div>
  );
}


