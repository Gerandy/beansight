import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const isAuthed = !!localStorage.getItem("authToken");
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}