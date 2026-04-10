import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../mystyle/Login.css";
import logo from "../../public/final-logo.jpeg";

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleIcon from "@mui/icons-material/Google";

const Register = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", userData);

      const { data } = await API.post("/auth/login", {
        email: userData.email,
        password: userData.password
      });

      loginUser(data.token);
      toast.success("Registration successful!");

      navigate("/");
    } catch (err) {
      toast.error("Registration failed! Email may already exist.");
      console.log(err);
    }
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
              Register quickly using social media
            </Typography>

            <Button className="social-btn facebook" startIcon={<FacebookIcon />}>
              Continue with Facebook
            </Button>

            <Button className="social-btn twitter" startIcon={<TwitterIcon />}>
              Continue with Twitter
            </Button>

            <Button className="social-btn google" startIcon={<GoogleIcon />}>
              Continue with Google
            </Button>

          </Box>

          {/* RIGHT PANEL */}
          <Box className="login-right">

            <Typography className="login-title">
              Create an Account
            </Typography>

            <TextField
              fullWidth
              label="Full Name"
              name="name"
              variant="standard"
              sx={{ mb: 2 }}
              value={userData.name}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              variant="standard"
              sx={{ mb: 2 }}
              value={userData.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              name="password"
              variant="standard"
              sx={{ mb: 2 }}
              value={userData.password}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              variant="standard"
              sx={{ mb: 2 }}
              value={userData.phone}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              variant="standard"
              sx={{ mb: 3 }}
              value={userData.address}
              onChange={handleChange}
            />

            <Button
              fullWidth
              variant="contained"
              className="login-btn"
              onClick={handleRegister}
            >
              Register
            </Button>

            <Typography sx={{ mt: 3 }}>
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="register-link"
              >
                Login
              </span>
            </Typography>

          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default Register;