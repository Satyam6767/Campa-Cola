import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Decode role if needed later OR default role
      const role = "user";

      loginUser(token, role);

      toast.success("Google Login Successful!");

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      toast.error("Google Login Failed");
      navigate("/login");
    }
  }, []);

  return <h2>Logging in...</h2>;
};

export default LoginSuccess;