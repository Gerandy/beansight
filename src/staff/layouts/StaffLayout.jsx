import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function StaffLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-coffee-50 text-coffee-900 font-inter">
      {/* Header */}
      <header className="bg-gradient-to-r from-coffee-700 to-coffee-600 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          ☕ <span>Staff POS</span>
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-sm sm:text-base">
            Staff: <span className="font-semibold">John D.</span>
          </p>
          <button className="bg-coffee-500 hover:bg-coffee-600 transition-colors px-4 py-1.5 rounded-md text-sm font-medium shadow-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="bg-coffee-100 shadow-inner flex text-coffee-800 border-b border-coffee-200">
        {[
          { to: "/staff/pos", label: "POS" },
          { to: "/staff/online-orders", label: "Online Orders" },
          { to: "/staff/history", label: "History" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 text-center py-3 font-medium transition-colors duration-200 ${
                isActive
                  ? "border-b-4 border-coffee-600 text-coffee-700 bg-coffee-200"
                  : "hover:bg-coffee-50 hover:text-coffee-700"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
