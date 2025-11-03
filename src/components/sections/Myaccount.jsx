import Sidebar from "../myaccount/MyAccountSidebar";
import { Outlet } from "react-router-dom";

function MyAccount() {
  return (
    <div className="flex flex-col min-h-screen bg-coffee-100">
      <div className="flex-1 flex justify-center py-4 sm:py-6 lg:py-8 px-4">
        <div className="flex flex-col lg:flex-row mt-16 bg-white shadow-md rounded-lg w-full max-w-6xl overflow-hidden">
          <Sidebar /> 

          <div className="flex-1 p-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;



