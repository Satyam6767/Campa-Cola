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
} from "@mui/material";
import { ShoppingCart, Menu as MenuIcon } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useContext, useState } from "react";

const Navbar = () => {
  const { token, role, name, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart?.items?.length || 0;

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "white",
          boxShadow: "0 0 10px grey",
          zIndex: (theme) => theme.zIndex.modal + 2, // 🔑 ABOVE EVERYTHING
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LEFT: Menu (mobile) + Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              <img src="/final logo.png" alt="Logo" style={{ width: "150px" }} />
            </Box>
          </Box>

          {/* CENTER: Nav Links (desktop only) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            {[
              { label: "Home", path: "/" },
              { label: "Products", path: "/products" },
              { label: "About", path: "/about" },
              { label: "Contact", path: "/contact" },
            ].map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                sx={{ color: "#000", fontWeight: 550 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* RIGHT: Cart + Auth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {token && (
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
                  >
                    Dashboard
                  </Button>
                )}
                <Button variant="outlined" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="outlined" size="small">
                  Login
                </Button>
                <Button component={Link} to="/register" variant="outlined" size="small">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* NAVBAR MOBILE DRAWER */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (theme) => theme.zIndex.modal + 3,
          "& .MuiDrawer-paper": {
            width: 250,
            zIndex: (theme) => theme.zIndex.modal + 3,
          },
        }}
      >
        <List>
          {[
            { text: "Home", path: "/" },
            { text: "Products", path: "/products" },
            { text: "About", path: "/about" },
            { text: "Contact", path: "/contact" },
          ].map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}

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

      {/* Spacer so content starts below navbar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
