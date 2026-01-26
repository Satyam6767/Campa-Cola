import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const AdminRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" />;

  const { role } = jwtDecode(token);
  return role === "admin" ? children : <Navigate to="/" />;
};

export default AdminRoute;
