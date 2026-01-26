import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  try {
    const { data } = await API.post("/auth/login", { email, password });

    loginUser(data.token, data.role);

    toast.success("Login successful!");

    if (data.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  } catch (error) {
    toast.error("Invalid credentials!");
  }
};


  return (
    <Container sx={{ mt: 5, width: "400px" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Login
      </Typography>

      <TextField
        fullWidth
        label="Email"
        sx={{ mb: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        fullWidth
        type="password"
        label="Password"
        sx={{ mb: 3 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button fullWidth variant="contained" onClick={handleLogin}>
        Login
      </Button>
      <Typography sx={{ mt: 2 }}>
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    style={{ color: "#007bff", cursor: "pointer" }}
  >
    Register
  </span>
</Typography>

    </Container>
  );
};

export default Login;
