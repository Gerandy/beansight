import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart, PlusCircle, PieChart, Users, Boxes, FileText, Menu } from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitles = {
    "/admin/dashboard": "Dashboard",
    "/admin/sales": "Sales",
    "/admin/products": "Products",
    "/admin/menu-performance": "Menu Performance",
    "/admin/customers": "Customers",
    "/admin/inventory": "Inventory",
    "/admin/reports": "Reports",
    "/admin/user-management": "User Management",
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  // Define which routes are considered analytics pages
  const analyticsPages = [
    "/admin/sales",
    "/admin/menu-performance",
    "/admin/reports",
    "/admin/inventory",
    "/admin/dashboard",
    "/admin/customers",
  ];

  const showExportButton = analyticsPages.includes(location.pathname);

  const SidebarContent = (isMobile = false) => (
    <>
      <h2 className={`text-2xl font-bold mb-6 ${isMobile ? "text-white" : ""}`}>Beansight ☕</h2>
      <nav className="space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink
          to="/admin/sales"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <BarChart size={20} /> Sales Report
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <PlusCircle size={20} /> Products
        </NavLink>
        <NavLink
          to="/admin/menu-performance"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <PieChart size={20} /> Menu Performance
        </NavLink>
        <NavLink
          to="/admin/user-management"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <PieChart size={20} /> Users
        </NavLink>
        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <Users size={20} /> Customers
        </NavLink>
        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <Boxes size={20} /> Inventory
        </NavLink>
        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `block p-2 rounded flex items-center gap-2 transition ${
              isMobile
                ? isActive
                  ? "bg-yellow-950 text-white"
                  : "text-white hover:bg-yellow-400 hover:text-black"
                : isActive
                ? "bg-yellow-950 text-white"
                : "hover:bg-yellow-950 hover:text-white"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <FileText size={20} /> Reports
        </NavLink>
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen">

      <aside className="w-64 bg-mcyellow text-black p-5 hidden md:block">
        {SidebarContent()}
      </aside>


      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-90"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-black text-white p-5 z-50 h-full shadow-lg animate-slide-in">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
            {SidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-auto w-full">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-black text-2xl font-bold">{currentTitle}</h1>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded bg-yellow-950 text-white hover:bg-yellow-900"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={28} />
            </button>
            {showExportButton && (
              <button className="bg-yellow-950 hover:bg-yellow-900 text-white px-4 py-2 rounded font-medium hidden sm:block">
                Export Report
              </button>
            )}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

// .animate-slide-in { animation: slideIn 0.2s ease; }
// @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
