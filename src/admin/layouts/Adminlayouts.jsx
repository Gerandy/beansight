import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart, PlusCircle, PieChart, Users, Boxes, FileText } from "lucide-react"; 

export default function AdminLayout() {
  const location = useLocation();

  // Map paths to titles
  const pageTitles = {
    "/admin/dashboard": "Dashboard",
    "/admin/sales": "Sales",
    "/admin/AddItems": "Products",
    "/admin/menu-performance": "Menu Performance",
    "/admin/customers": "Customers",
    "/admin/inventory": "Inventory",
    "/admin/reports": "Reports",
  };

  // Get the current title or fallback
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex min-h-screen ">
      {/* Sidebar */}
      <aside className="w-64 bg-mcyellow text-black p-5">
        <h2 className="text-2xl font-bold mb-6">Beansight ☕</h2>
        <nav className="space-y-2">
          <NavLink
            to="/admin/dashboard"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/sales"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <BarChart size={20} /> Sales Report
          </NavLink>
          <NavLink
            to="/admin/AddItems"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <PlusCircle size={20} /> Products
          </NavLink>
          <NavLink
            to="/admin/menu-performance"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <PieChart size={20} /> Menu Performance
          </NavLink>
          <NavLink
            to="/admin/customers"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <Users size={20} /> Customers
          </NavLink>
          <NavLink
            to="/admin/inventory"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <Boxes size={20} /> Inventory
          </NavLink>
          <NavLink
            to="/admin/reports"
            className="block p-2 rounded hover:bg-yellow-950 hover:text-white flex items-center gap-2"
          >
            <FileText size={20} /> Reports
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-black text-2xl font-bold">{currentTitle}</h1>
          <button className="bg-yellow-950 hover:bg-yellow-950 hover:text-white px-4 py-2 rounded font-medium">
            Export Report
          </button>
        </header>

        {/* Page content goes here */}
        <Outlet />
      </main>
    </div>
  );
}
