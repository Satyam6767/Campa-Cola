import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../mystyle/Login.css";
import logo from "../../public/final-logo.jpeg";

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Normal Email Login
  const handleLogin = async () => {
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

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

  // Google Login
  const handleGoogleLogin = () => {
    window.location.href =
      "https://campa-cola-1.onrender.com/auth/google";
  };

  // Facebook Login (future)
  const handleFacebookLogin = () => {
    toast.info("Facebook Login Coming Soon");
  };

  // Twitter Login (future)
  const handleTwitterLogin = () => {
    toast.info("Twitter Login Coming Soon");
  };

  return (
    <Box className="login-section">
      <Container maxWidth="md">
        <Box className="login-card">

          {/* LEFT PANEL */}
          <Box className="login-left">

            <Box className="login-logo">
              <img src={logo} alt="Campa Cola Logo" />
            </Box>

            <Typography className="login-desc">
              Login using social media to get quick access
            </Typography>

            <Button
              className="social-btn facebook"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookLogin}
            >
              Sign in with Facebook
            </Button>

            <Button
              className="social-btn twitter"
              startIcon={<TwitterIcon />}
              onClick={handleTwitterLogin}
            >
              Sign in with Twitter
            </Button>

            <Button
              className="social-btn google"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Button>

          </Box>

          {/* RIGHT PANEL */}
          <Box className="login-right">

            <Typography className="login-title">
              Already a Member
            </Typography>

            <TextField
              fullWidth
              label="Email Address"
              variant="standard"
              sx={{ mb: 3 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="standard"
              sx={{ mb: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Box className="login-options">
              <Box className="remember">
                <Checkbox size="small" />
                <Typography>Remember me</Typography>
              </Box>

              <Typography className="forgot">
                Forgot password?
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              className="login-btn"
              onClick={handleLogin}
            >
              Login with Email
            </Button>

            <Typography sx={{ mt: 3 }}>
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="register-link"
              >
                Register
              </span>
            </Typography>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;