import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-56 border-r p-4">
      <h2 className="font-bold text-black text-lg mb-4">My Account</h2>
      <ul className="space-y-2">
        <li>
          <Link
            to="profile"
            className="block px-3 py-2 rounded-md text-black bg-yellow-400 font-medium"
          >
            My Profile
          </Link>
        </li>
        <li>
          <Link
            to="addresses"
            className="block px-3 py-2 rounded-md text-black hover:bg-yellow-400"
          >
            My Addresses
          </Link>
        </li>
        <li>
          <Link
            to="contacts"
            className="block px-3 py-2 rounded-md text-black hover:bg-yellow-400"
          >
            My Contact Numbers
          </Link>
        </li>
        <li>
          <Link
            to="favorites"
            className="block px-3 py-2 rounded-md text-black hover:bg-yellow-400"
          >
            My Favorites
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;


