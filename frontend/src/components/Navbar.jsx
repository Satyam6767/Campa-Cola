import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Button,
  Typography,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";

const Navbar = () => {
  const { token, role, name, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const cartCount = cart?.items?.length || 0;

  return (
    <AppBar
      position="static"
      sx={{
        background: "white",
        boxShadow: "0 0 10px grey",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Left: Logo */}
        <Box>
          <img
            src="/final logo.png"
            alt="Logo"
            style={{ width: "200px", cursor: "pointer" }}
          />
        </Box>

        {/* Center: Nav Items */}
        <Box sx={{ display: "flex", gap: 4 }}>
          <Button component={Link} to="/" sx={{ color: "#000", fontWeight: 550 }}>
            Home
          </Button>
          <Button component={Link} to="/products" sx={{ color: "#000", fontWeight: 550 }}>
            Products
          </Button>
          <Button component={Link} to="/about" sx={{ color: "#000", fontWeight: 550 }}>
            About
          </Button>
          <Button component={Link} to="/contact" sx={{ color: "#000", fontWeight: 550 }}>
            Contact
          </Button>
        </Box>

        {/* Right: Auth / Cart / Admin */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {token ? (
            <>
              {/* Username */}
              <Typography sx={{ color: "#000", fontWeight: 500 }}>
                Hi, {name}
              </Typography>

              {/* Cart */}
              <IconButton component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCart sx={{ color: "#000" }} />
                </Badge>
              </IconButton>

              {/* Admin Dashboard */}
              {role === "admin" && (
                <Button
                  component={Link}
                  to="/admin/dashboard"
                  variant="outlined"
                >
                  Dashboard
                </Button>
              )}

              {/* Logout */}
              <Button
                variant="outlined"
                onClick={() => {
                  logoutUser();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} to="/register" variant="outlined">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
