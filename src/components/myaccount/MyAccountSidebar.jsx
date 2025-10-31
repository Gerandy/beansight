import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.endsWith(path);

  return (
    <div className="w-56 md:w-64 lg:w-72 border-r border-r-gray-200 h-full p-4">
      <h2 className="font-bold text-black text-xl mb-4">My Account</h2>
      <ul className="space-y-2">
        <li>
          <Link to="profile" className={`block px-3 py-2 rounded-md font-medium ${isActive("profile") ? "text-white bg-yellow-950" : "text-black hover:bg-yellow-950 hover:text-white"}`}>
            My Profile
          </Link>
        </li>
        <li>
          <Link to="addresses" className={`block px-3 py-2 rounded-md ${isActive("addresses") ? "text-white bg-yellow-950" : "text-black hover:bg-yellow-950 hover:text-white"}`}>
            My Addresses
          </Link>
        </li>
        <li>
          <Link to="contacts" className={`block px-3 py-2 rounded-md ${isActive("contacts") ? "text-white bg-yellow-950" : "text-black hover:bg-yellow-950 hover:text-white"}`}>
            My Contact Numbers
          </Link>
        </li>
        <li>
          <Link to="favorites" className={`block px-3 py-2 rounded-md ${isActive("favorites") ? "text-white bg-yellow-950" : "text-black hover:bg-yellow-950 hover:text-white"}`}>
            My Favorites
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;




