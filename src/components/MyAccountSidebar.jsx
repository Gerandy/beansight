import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.endsWith(path);

  return (
    <div className="w-full lg:w-56 border-r border-coffee-200 h-full p-4 bg-coffee-50">
      <h2 className="font-bold text-coffee-900 text-xl mb-4">My Account</h2>
      <ul className="space-y-2">
        <li>
          <Link
            to="profile"
            className={`block px-3 py-2 rounded-md font-medium transition-colors ${
              isActive("profile")
                ? "text-white bg-coffee-700"
                : "text-coffee-800 hover:bg-coffee-700 hover:text-white"
            }`}
          >
            My Profile
          </Link>
        </li>
        <li>
          <Link
            to="addresses"
            className={`block px-3 py-2 rounded-md font-medium transition-colors ${
              isActive("addresses")
                ? "text-white bg-coffee-700"
                : "text-coffee-800 hover:bg-coffee-700 hover:text-white"
            }`}
          >
            My Addresses
          </Link>
        </li>
        <li>
          <Link
            to="contacts"
            className={`block px-3 py-2 rounded-md font-medium transition-colors ${
              isActive("contacts")
                ? "text-white bg-coffee-700"
                : "text-coffee-800 hover:bg-coffee-700 hover:text-white"
            }`}
          >
            My Contact Numbers
          </Link>
        </li>
        <li>
          <Link
            to="favorites"
            className={`block px-3 py-2 rounded-md font-medium transition-colors ${
              isActive("favorites")
                ? "text-white bg-coffee-700"
                : "text-coffee-800 hover:bg-coffee-700 hover:text-white"
            }`}
          >
            My Favorites
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;


