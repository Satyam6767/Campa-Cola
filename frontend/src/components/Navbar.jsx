import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Button,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { ShoppingCart, Menu as MenuIcon } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useContext, useState } from "react";
import "../mystyle/Navbar.css";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const { token, role, name, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart?.items?.length || 0;

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <AppBar
        className="no-print"
        position="sticky"
        sx={{
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            
            <IconButton
              sx={{ display: { xs: "flex", sm: "flex", md: "none" } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Box className="navbar-logo-img" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              <img
                src="/final-logo.jpeg"
                alt="Logo"
                style={{ width: 150 }}
                loading="lazy"
              />
            </Box>
          </Box>

          {/* CENTER NAV LINKS */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
            {navLinks.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* RIGHT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            
            {token && (
              <Typography
                sx={{ display: { xs: "none", md: "block" }, fontWeight: 500 }}
              >
                Hi, {name}
              </Typography>
            )}

            {token && role !== "admin" && (
              <IconButton component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCart sx={{ color: "#000" }} />
                </Badge>
              </IconButton>
            )}

            {token ? (
              <>
                {role === "admin" && (
                  <Button
                    component={Link}
                    to="/admin/dashboard"
                    variant="outlined"
                    size="small"
                    className="campa-btn"
                  >
                    Dashboard
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  className="campa-btn contained"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  className="campa-btn"
                >
                  Login
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  className="campa-btn contained"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= MOBILE DRAWER ================= */}

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { width: 260 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={600} mb={1}>
            Menu
          </Typography>
          <Divider />
        </Box>

        <List>
          {navLinks.map((item) => (
            <ListItemButton
              key={item.label}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}

          <Divider />

          {token ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          ) : (
            <>
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>

              <ListItemButton component={Link} to="/register">
                <ListItemText primary="Register" />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;