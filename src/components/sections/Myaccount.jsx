import Sidebar from "../myaccount/MyAccountSidebar";
import { Outlet } from "react-router-dom";

function MyAccount() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex justify-center py-8">
        <div className="flex mt-15 bg-white shadow-md rounded-md w-full max-w-5xl">
          <Sidebar /> 

          <div className="flex-1 p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;



