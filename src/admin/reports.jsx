import React, { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleDownloadPDF = () => {
    alert("Downloading Sales Report as PDF...");
  };

  const handleExportExcel = () => {
    alert("Exporting Report to Excel...");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 items-center">
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
        <button
          onClick={() => alert("Filtering...")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>

      {/* Sales Summary */}
      <div className="border rounded-xl p-4 shadow-md text-black bg-white">
        <h2 className="text-lg font-semibold mb-2">Sales Summary</h2>
        <p>Total Orders: 1,245</p>
        <p>Total Revenue: ₱184,200</p>
        <p>Average Order Value: ₱147.90</p>
      </div>

      {/* Top Performing Items */}
      <div className="border rounded-xl p-4 shadow-md text-black bg-white">
        <h2 className="text-lg font-semibold mb-2">Top Performing Menu Items</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Pancit Bilao – 320 orders</li>
          <li>Palabok Bilao – 245 orders</li>
          <li>Spaghetti Bilao – 190 orders</li>
        </ul>
      </div>

      {/* Customer Report */}
      <div className="border rounded-xl p-4 shadow-md text-black bg-white">
        <h2 className="text-lg font-semibold mb-2">Customer Summary</h2>
        <p>Total Customers: 890</p>
        <p>New This Month: 45</p>
        <p>Repeat Customers: 520</p>
      </div>

      {/* Inventory Report */}
      <div className="border rounded-xl p-4 shadow-md text-black bg-white">
        <h2 className="text-lg font-semibold mb-2">Inventory Status</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Pancit Noodles – 5 left (Low Stock)</li>
          <li>Plastic Containers – 2 left (Critical)</li>
          <li>Utensils – OK</li>
        </ul>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 pt-4">
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
          <FileSpreadsheet className="w-4 h-4" /> Export to Excel
        </button>
      </div>
    </div>
  );
}

