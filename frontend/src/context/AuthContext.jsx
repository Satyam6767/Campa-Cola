import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [name, setName] = useState(localStorage.getItem("name") || "");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        const userRole = decoded.role || "user";
        const userName = decoded.name || decoded.username || "User";

        setRole(userRole);
        setName(userName);

        localStorage.setItem("role", userRole);
        localStorage.setItem("name", userName);
      } catch (err) {
        logoutUser();
      }
    }
  }, [token]);

  const loginUser = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setToken("");
    setRole("");
    setName("");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        name,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
