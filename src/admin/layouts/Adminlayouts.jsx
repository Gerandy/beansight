import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart,
  PieChart,
  Users,
  Boxes,
  FileText,
  Menu,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const analyticsPages = [
    "/admin/sales",
    "/admin/menu-performance",
    "/admin/customers",
  ];

  const showExportButton = [
    "/admin/sales",
    "/admin/menu-performance",
    "/admin/customers",
    "/admin/reports",
    "/admin/inventory",
    "/admin/dashboard",
  ].includes(location.pathname);


  useEffect(() => {
    if (analyticsPages.includes(location.pathname)) {
      setDashboardOpen(true);
    }
  }, [location.pathname]);

  const SidebarContent = (isMobile = false) => {
    const linkClasses = (isActive) =>
      `block p-2 rounded flex items-center gap-2 transition ${
        isMobile
          ? isActive
            ? "bg-yellow-950 text-white"
            : "text-white hover:bg-yellow-400 hover:text-black"
          : isActive
          ? "bg-yellow-950 text-white"
          : "hover:bg-yellow-950 hover:text-white"
      }`;

    return (
      <>
        <h2
          className={`text-2xl font-bold mb-6 ${
            isMobile ? "text-white" : "text-black"
          }`}
        >
          Beansight ☕
        </h2>

        <nav className="space-y-2">
          {/* Dashboard Dropdown */}
          <div>
            <div
              className={`flex justify-between items-center p-2 rounded cursor-pointer transition ${
                isMobile
                  ? "text-white hover:bg-yellow-400 hover:text-black"
                  : "hover:bg-yellow-950 hover:text-white"
              }`}
            >
              <div
                className="flex items-center gap-2 flex-1"
                onClick={() => {
                  navigate("/admin/dashboard");
                  setSidebarOpen(false);
                }}
              >
                <LayoutDashboard size={20} /> Dashboard
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDashboardOpen(!dashboardOpen);
                }}
                className="p-1 rounded hover:bg-yellow-800"
              >
                {dashboardOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>

            {dashboardOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/admin/sales"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  <BarChart size={18} /> Sales Report
                </NavLink>

                <NavLink
                  to="/admin/menu-performance"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  <PieChart size={18} /> Menu Performance
                </NavLink>

                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Users size={18} /> Customers Analytics
                </NavLink>
              </div>
            )}
          </div>

          {/* Main Menu Links */}
          <NavLink
            to="/admin/products"
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <Boxes size={20} /> Products
          </NavLink>

          <NavLink
            to="/admin/order-management"
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <ClipboardList size={20} /> Order Management
          </NavLink>

          <NavLink
            to="/admin/user-management"
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <UserCog size={20} /> User Management
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <Boxes size={20} /> Inventory
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => linkClasses(isActive)}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText size={20} /> Reports
          </NavLink>
        </nav>
      </>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-mcyellow text-black p-5 hidden md:block">
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
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
        <header className="flex justify-end items-center mb-6">
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