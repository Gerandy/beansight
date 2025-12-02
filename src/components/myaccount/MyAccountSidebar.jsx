import { Link, useLocation } from "react-router-dom";
import { User, MapPin, Phone, Heart } from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    // Check if the current pathname matches the account route + path
    return location.pathname === `/Myaccount/${path}` || 
           (path === "profile" && location.pathname === "/Myaccount");
  };

  const menuItems = [
    { path: "profile", label: "My Profile", icon: User },
    { path: "addresses", label: "My Addresses", icon: MapPin },
    { path: "contacts", label: "My Contact Numbers", icon: Phone },
    { path: "favorites", label: "My Favorites", icon: Heart },
  ];

  return (
    <>
      {/* Mobile & Tablet: Horizontal Tabs */}
      <div className="lg:hidden w-full bg-coffee-50 border-b border-coffee-200 overflow-x-auto">
        <div className="flex px-2 sm:px-4 py-3 gap-2 min-w-max">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={`/Myaccount/${item.path}`}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
                  isActive(item.path)
                    ? "text-white bg-coffee-700"
                    : "text-coffee-800 bg-white border border-coffee-200 hover:bg-coffee-700 hover:text-white"
                }`}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical Sidebar */}
      <div className="hidden lg:block w-64 border-r border-coffee-200 h-full p-6 bg-coffee-50">
        <h2 className="font-bold text-coffee-900 text-2xl mb-6">My Account</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={`/Myaccount/${item.path}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-white bg-coffee-700"
                      : "text-coffee-800 hover:bg-coffee-700 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;




