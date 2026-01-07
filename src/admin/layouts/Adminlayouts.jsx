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
  LogOut,
  Settings,
  Coffee,
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const handleLogout = () => {
    navigate("/login");
    setSidebarOpen(false);
  };

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
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            {collapsed ? (
              <Coffee size={32} className={isMobile ? "text-white" : "text-black"} />
            ) : (
              <h2
                className={`text-2xl font-bold ${isMobile ? "text-white" : "text-black"} cursor-pointer`}
                onClick={() => navigate("/admin")}
                tabIndex={0}
                role="button"
                aria-label="Go to admin home"
              >
                SOL-ACE ☕
              </h2>
            )}
            {!isMobile && (
              <button
                className="p-2 rounded hover:bg-yellow-200"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu size={22} />
              </button>
            )}
          </div>

          {/* Analytics Section */}
          <div className="mb-4">
            {!collapsed && (
              <div className="uppercase text-xs font-bold text-yellow-900 mb-2 pl-2 tracking-wider">
                Analytics
              </div>
            )}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard size={20} /> {!collapsed && "Dashboard"}
            </NavLink>
            <NavLink
              to="/admin/sales"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <BarChart size={20} /> {!collapsed && "Sales Report"}
            </NavLink>
            <NavLink
              to="/admin/menu-performance"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <PieChart size={20} /> {!collapsed && "Menu Performance"}
            </NavLink>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <Users size={20} /> {!collapsed && "Customers Report"}
            </NavLink>
          </div>

          {/* Management Section */}
          <div className="mb-4">
            {!collapsed && (
              <div className="uppercase text-xs font-bold text-yellow-900 mb-2 pl-2 tracking-wider">
                Management
              </div>
            )}
            <NavLink
              to="/admin/products"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <Boxes size={20} /> {!collapsed && "Products"}
            </NavLink>
            <NavLink
              to="/admin/inventory"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <Boxes size={20} /> {!collapsed && "Inventory"}
            </NavLink>
            <NavLink
              to="/admin/order-management"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <ClipboardList size={20} /> {!collapsed && "Order History"}
            </NavLink>
            <NavLink
              to="/admin/user-management"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <UserCog size={20} /> {!collapsed && "User Management"}
            </NavLink>
          </div>

          {/* Reports Section */}
          <div className="mb-4">
            {!collapsed && (
              <div className="uppercase text-xs font-bold text-yellow-900 mb-2 pl-2 tracking-wider">
                Reports
              </div>
            )}
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => linkClasses(isActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <FileText size={20} /> {!collapsed && "Reports"}
            </NavLink>
          </div>

          {/* Settings Section (Collapsible) */}
          <div className="mb-4">
            {!collapsed && (
              <div className="uppercase text-xs font-bold text-yellow-900 mb-2 pl-2 tracking-wider">
                Settings
              </div>
            )}
            <div
              className={`flex justify-between items-center p-2 rounded cursor-pointer transition ${
                isMobile
                  ? "text-white hover:bg-yellow-400 hover:text-black"
                  : "hover:bg-yellow-950 hover:text-white"
              }`}
              onClick={() => {
                setSettingsOpen((prev) => !prev);
                if (!settingsOpen) {
                  navigate("/admin/settings/auditlog"); 
                  setSidebarOpen(false);
                }
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                <Settings size={20} /> {!collapsed && "Settings"}
              </div>
              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsOpen(!settingsOpen);
                  }}
                  className="cursor-pointer p-1 rounded hover:bg-yellow-800"
                >
                  {settingsOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              )}
            </div>
            {settingsOpen && !collapsed && (
              <div className="ml-6 mt-1 space-y-1 animate-dropdown">
                {/* <NavLink
                  to="/admin/settings/auditlog"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Audit Log"}
                </NavLink> */}
                <NavLink
                  to="/admin/settings/archive"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Archives"}
                </NavLink>
                <NavLink
                  to="/admin/settings/advertisement"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Advertisement"}
                </NavLink>
                <NavLink
                  to="/admin/settings/storepreferences"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Store Preferences"}
                </NavLink>
                <NavLink
                  to="/admin/settings/maps"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Maps Settings"}
                </NavLink>
                <NavLink
                  to="/admin/settings/analytics"
                  className={({ isActive }) => linkClasses(isActive)}
                  onClick={() => setSidebarOpen(false)}
                >
                  {!collapsed && "Analytics"}
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Logout button at the bottom */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className={`cursor-pointer w-full flex items-center gap-2 p-2 rounded transition ${
              isMobile
                ? "bg-yellow-700 text-white hover:bg-yellow-600"
                : "hover:bg-yellow-950 hover:text-white"
            }`}
          >
            <LogOut size={18} /> {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-mcyellow text-black p-5 hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-auto hide-scrollbar transition-all duration-200`}
      >
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-opacity-90"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-black text-white p-5 z-50 h-full shadow-lg animate-slide-in flex flex-col justify-between">
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
      <main className="flex-1 min-w-0 p-3 sm:p-6 md:p-8 pt-0 overflow-auto w-full">
        <header className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded bg-yellow-950 text-white hover:bg-yellow-900"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={28} />
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}