import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

export default function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(3);
  const location = useLocation();
  const prevCountRef = useRef(newOrderCount);
  const audioRef = useRef(null);

  // 🧠 Reset new order badge when on Online Orders page
  useEffect(() => {
    if (location.pathname.includes("online-orders")) {
      setNewOrderCount(0);
    }
  }, [location]);

  // 🔔 Play sound when new order count increases
  useEffect(() => {
    if (newOrderCount > prevCountRef.current) {
      audioRef.current?.play();
    }
    prevCountRef.current = newOrderCount;
  }, [newOrderCount]);

  return (
    <div className="min-h-screen bg-coffee-50 text-coffee-900 font-inter">
      {/* 🔈 Hidden audio element */}
      <audio
        ref={audioRef}
        src="/sounds/new-order.mp3"
        preload="auto"
      />

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

              {/* Navigation */}
              <div className="hidden md:flex items-center gap-4">
                {["POS", "Online Orders", "Products", "History"].map((label, idx) => (
                  <NavLink
                    key={label}
                    to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    {/* Icons */}
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
                          />
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M21 12a9 9 0 11-9-9" />
                        </svg>
                      )}
                    </span>

                    {/* Label + Red Badge */}
                    <span className="relative flex items-center gap-1">
                      {label}
                      {label === "Online Orders" && newOrderCount > 0 && (
                        <span className="absolute -top-2 -right-3 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full w-4 h-4 animate-pulse">
                          {newOrderCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Notifications + User */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">John D.</p>
                  <p className="text-xs text-white/80">Barista</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold hover:bg-white/20 transition"
                    aria-expanded={mobileOpen}
                    aria-controls="staff-menu"
                  >
                    JD
                  </button>
                  <div
                    id="staff-menu"
                    className={`origin-top-right absolute right-0 mt-2 w-40 rounded-md bg-white text-coffee-900 shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all ${
                      mobileOpen
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
                    style={{ zIndex: 50 }}
                  >
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-coffee-50">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileOpen ? "block" : "hidden"} bg-coffee-100 shadow-inner border-b border-coffee-200`}>
        <div className="px-4 py-2 space-y-1">
          {["POS", "Online Orders", "History"].map((label) => (
            <NavLink
              key={label}
              to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md text-sm font-medium ${
                  isActive ? "bg-white/60 text-coffee-800" : "text-coffee-700 hover:bg-white/30"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
}