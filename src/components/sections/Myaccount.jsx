import Navbar from "../Navbar";
import Footer from "./Footer";
import Sidebar from "../Sidebar";
import { Outlet } from "react-router-dom";

function MyAccount() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex justify-center py-8">
        {/* Card Container */}
        <div className="flex mt-15 shadow-md rounded-md w-full max-w-5xl">
          <Sidebar /> {/* Imported Sidebar */}

          <div className="flex-1 p-8">
            <Outlet />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MyAccount;



