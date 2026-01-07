import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const userRole = localStorage.getItem("userRole"); // Role set after login
  const authToken = localStorage.getItem("authToken"); // Make sure user is logged in

  if (!authToken) {
    // Not logged in → redirect to login
    return <Navigate to="/home" replace />;
  }

  if (role && userRole !== role) {
    // Logged in but role doesn't match → redirect to their proper page
  //  if (userRole === "client") return <Navigate to="/home" replace />;
  //  if (userRole === "staff") return <Navigate to="/staff" replace />;
   
  }

  // Role matches → render the children
  return children;
}
