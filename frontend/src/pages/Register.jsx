import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Container,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

      // Auto login after register
      const { data } = await API.post("/auth/login", {
        email: userData.email,
        password: userData.password,
      });

      loginUser(data.token);
      navigate("/");
    } catch (err) {
      toast.error("Registration failed! Email may already exist.");
      console.log(err);
    }
  };

  return (
    <Container sx={{ mt: 5, width: "400px" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Create an Account
      </Typography>

      <TextField
        label="Full Name"
        name="name"
        fullWidth
        sx={{ mb: 2 }}
        value={userData.name}
        onChange={handleChange}
      />

      <TextField
        label="Email"
        name="email"
        fullWidth
        sx={{ mb: 2 }}
        value={userData.email}
        onChange={handleChange}
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        fullWidth
        sx={{ mb: 2 }}
        value={userData.password}
        onChange={handleChange}
      />

      <TextField
        label="Phone"
        name="phone"
        fullWidth
        sx={{ mb: 2 }}
        value={userData.phone}
        onChange={handleChange}
      />

      <TextField
        label="Address"
        name="address"
        fullWidth
        sx={{ mb: 3 }}
        value={userData.address}
        onChange={handleChange}
      />

      <Button fullWidth variant="contained" onClick={handleRegister}>
        Register
      </Button>
    </Container>
  );
};

export default Register;
