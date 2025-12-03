import React from "react";

export const StatusBadge = ({ status }) => {
  const map = {
    Pending: "bg-coffee-300 text-coffee-800",       // light brown bg, dark text
    Preparing: "bg-coffee-100 text-coffee-700",     // lighter bg, coffee text
    Ready: "bg-coffee-500 text-white",              // main coffee bg, white text
    PickUp: "bg-coffee-500 text-white",              // main coffee bg, white text
    Completed: "bg-coffee-200 text-coffee-800",     // subtle bg, dark text
    Cancelled: "bg-red-100 text-red-700",           // red for cancelled
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};
