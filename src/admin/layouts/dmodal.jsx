import React, { useState, useEffect } from "react";

// Helper to export CSV
function exportToCSV(data, columns, title) {
  if (!data || !columns) return;
  const csvRows = [];
  // Header
  csvRows.push(columns.join(","));
  // Rows
  data.forEach((row) => {
    csvRows.push(
      columns
        .map((col) => {
          // Support nested fields (e.g., "customer.name")
          const val = col.includes(".")
            ? col.split(".").reduce((acc, key) => acc && acc[key], row)
            : row[col];
          return `"${val !== undefined ? val : ""}"`;
        })
        .join(",")
    );
  });
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${title.replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DrillDownModal({
  isOpen,
  onClose,
  title = "Details",
  data = [],
  columns = [],
  viewOptions = null, // New: array of view options (e.g., ["gross", "net", "expenses"])
  currentView = null, // New: current selected view
  onViewChange = null, // New: callback for view change
  onRowClick = null, // Prop for row click handler
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-full flex items-center justify-center bg-black/10 backdrop-blur-sm bg-opacity-30">
      <div className="bg-[#F5E9DA] rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C28F5E] rounded-t-2xl bg-[#F9F6F2]">
          <h2 className="text-xl font-bold text-[#8E5A3A]">{title}</h2>
          <div className="flex items-center gap-2">
            {viewOptions && onViewChange && (
              <select
                value={currentView}
                onChange={(e) => onViewChange(e.target.value)}
                className="px-3 py-1 rounded border border-[#C28F5E] bg-white text-[#8E5A3A]"
              >
                {viewOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "gross" ? "Gross Revenue" : option === "net" ? "Net Profit" : "Expenses"}
                  </option>
                ))}
              </select>
            )}
            <button
              className="text-[#8E5A3A] px-3 py-2 rounded-lg hover:bg-[#F5E9DA] font-bold"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-[#F9F6F2] text-[#8E5A3A] sticky top-0">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-3 px-4 text-left font-semibold border-b border-[#E1B788]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[#F5E9DA] transition ${row.expandable ? 'cursor-pointer' : ''}`}
                  onClick={() => row.expandable && onRowClick ? onRowClick(row.type) : null}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-3 px-4 border-b border-[#F5E9DA] text-[#8E5A3A]">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Bottom Actions */}
        <div className="flex justify-end px-6 py-4 border-t border-[#C28F5E]">
          <button
            className="bg-[#C28F5E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#8E5A3A] transition"
            onClick={() => exportToCSV(data, columns, title)}
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}