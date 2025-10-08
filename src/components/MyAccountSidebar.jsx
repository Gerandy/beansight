import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  // Helper to check if the link is active
  const isActive = (path) => location.pathname.endsWith(path);

  return (
    <div className="w-56 border-r p-4">
      <h2 className="font-bold text-black text-lg mb-4">My Account</h2>
      <ul className="space-y-2">
        <li>
          <Link
            to="profile"
            className={`block px-3 py-2 rounded-md font-medium ${
              isActive("profile")
                ? "text-black bg-yellow-400"
                : "text-black hover:bg-yellow-400"
            }`}
          >
            My Profile
          </Link>
        </li>
        <li>
          <Link
            to="addresses"
            className={`block px-3 py-2 rounded-md ${
              isActive("addresses")
                ? "text-black bg-yellow-400 font-medium"
                : "text-black hover:bg-yellow-400"
            }`}
          >
            My Addresses
          </Link>
        </li>
        <li>
          <Link
            to="contacts"
            className={`block px-3 py-2 rounded-md ${
              isActive("contacts")
                ? "text-black bg-yellow-400 font-medium"
                : "text-black hover:bg-yellow-400"
            }`}
          >
            My Contact Numbers
          </Link>
        </li>
        <li>
          <Link
            to="favorites"
            className={`block px-3 py-2 rounded-md ${
              isActive("favorites")
                ? "text-black bg-yellow-400 font-medium"
                : "text-black hover:bg-yellow-400"
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


