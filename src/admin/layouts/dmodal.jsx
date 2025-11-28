import React, { useState } from "react";

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
}) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (!isOpen) return null;

  const pagedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="fixed inset-0 z-50 h-full flex items-center justify-center bg-black/10 backdrop-blur-sm bg-opacity-30">
      <div className="bg-[#F5E9DA] rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C28F5E] rounded-t-2xl bg-[#F9F6F2]">
          <h2 className="text-xl font-bold text-[#8E5A3A]">{title}</h2>
          <div className="flex gap-2">
            <button
              className="bg-[#C28F5E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#8E5A3A] transition"
              onClick={() => exportToCSV(data, columns, title)}
            >
              Export Report
            </button>
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
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#C28F5E] text-white">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="py-2 px-4 font-semibold text-left rounded-t-lg"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-6 text-center text-[#8E5A3A]"
                  >
                    No data available.
                  </td>
                </tr>
              )}
              {pagedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 2 === 0
                      ? "bg-[#F9F6F2]"
                      : "bg-[#F5E9DA]"
                  }
                >
                  {columns.map((col) => {
                    const val = col.includes(".")
                      ? col.split(".").reduce((acc, key) => acc && acc[key], row)
                      : row[col];
                    return (
                      <td
                        key={col}
                        className="py-2 px-4 text-[#6A3D26] rounded-lg"
                      >
                        {val !== undefined ? val : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pb-6">
            <button
              className="bg-[#C28F5E] text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span className="text-[#8E5A3A] font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="bg-[#C28F5E] text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}