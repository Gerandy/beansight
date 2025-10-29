import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50 text-coffee-900 font-inter">
      {/* Header */}
      <header className="bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-xl">
                  ☕
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold leading-none">Staff POS</h1>
                  <p className="text-xs text-white/80">Beansight</p>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-4">
                {["POS", "Online Orders", "History"].map((label, idx) => (
                  <NavLink
                    key={label}
                    to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`
                    }
                  >
                    <span className="opacity-90">
                      {idx === 0 && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v6H3zM3 9v11a2 2 0 002 2h14a2 2 0 002-2V9" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M8 3h8l1 4H7l1-4z" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M21 12a9 9 0 11-9-9" />
                        </svg>
                      )}
                    </span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                aria-label="Notifications"
                className="relative p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                </svg>
                <span className="absolute right-0 top-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">3</span>
              </button>

              {/* Staff info & logout */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">John D.</p>
                  <p className="text-xs text-white/80">Barista</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMobileOpen(v => !v)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold hover:bg-white/20 transition"
                    aria-expanded={mobileOpen}
                    aria-controls="staff-menu"
                  >
                    JD
                  </button>
                  {/* small dropdown */}
                  <div
                    id="staff-menu"
                    className={`origin-top-right absolute right-0 mt-2 w-40 rounded-md bg-white text-coffee-900 shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all ${mobileOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
                    style={{ zIndex: 50 }}
                  >
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-coffee-50">Profile</button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-coffee-50">Settings</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-coffee-50">Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileOpen ? "block" : "hidden"} bg-coffee-100 shadow-inner border-b border-coffee-200`}>
        <div className="px-4 py-2 space-y-1">
          {["POS", "Online Orders", "History"].map(label => (
            <NavLink
              key={label}
              to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md text-sm font-medium ${isActive ? "bg-white/60 text-coffee-800" : "text-coffee-700 hover:bg-white/30"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className=" rounded-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
