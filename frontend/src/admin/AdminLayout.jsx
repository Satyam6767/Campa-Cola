import { useState, useContext } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemText,
  Typography, IconButton, Divider, Avatar, Tooltip,
} from "@mui/material";
import {
  Dashboard, Inventory, Category, ShoppingCart,
  Receipt, History, People, Menu as MenuIcon,
  ChevronLeft, Logout,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

const BLUE  = "#0B2A4A";
const RED   = "#C4161C";
const drawerWidth = 240;

const navItems = [
  { text: "Dashboard",       path: "/admin/dashboard",       icon: <Dashboard fontSize="small" /> },
  { text: "Categories",      path: "/admin/categories",      icon: <Category fontSize="small" /> },
  { text: "Products",        path: "/admin/products",        icon: <Inventory fontSize="small" /> },
  { text: "Orders",          path: "/admin/orders",          icon: <ShoppingCart fontSize="small" /> },
  { text: "Billing",         path: "/admin/billing",         icon: <Receipt fontSize="small" /> },
  { text: "Billing History", path: "/admin/billing-history", icon: <History fontSize="small" /> },
  { text: "Master List",     path: "/admin/master-list",     icon: <People fontSize="small" /> },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { name, logoutUser } = useContext(AuthContext);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const drawer = (
    <Box sx={{
      width: drawerWidth,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: BLUE,
      color: "#fff",
    }}>

      {/* ── BRAND ── */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: RED, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#fff",
          }}>
            J
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#fff", lineHeight: 1.2 }}>
              Janki Enterprises
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* ── ADMIN AVATAR ── */}
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: RED, fontSize: 14, fontWeight: 700 }}>
          {name?.charAt(0)?.toUpperCase() || "A"}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{name || "Admin"}</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Administrator</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1 }} />

      {/* ── NAV ITEMS ── */}
      <List sx={{ flex: 1, px: 1.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                bgcolor: active ? RED : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.7)",
                "&:hover": {
                  bgcolor: active ? RED : "rgba(255,255,255,0.08)",
                  color: "#fff",
                },
                transition: "all 0.2s ease",
                "& .MuiListItemText-primary": {
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                },
              }}
            >
              <Box sx={{ mr: 1.5, display: "flex", alignItems: "center", color: "inherit" }}>
                {item.icon}
              </Box>
              <ListItemText primary={item.text} />
              {active && (
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%",
                  bgcolor: "#fff", ml: 1,
                }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* ── LOGOUT ── */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, px: 1.5, py: 1,
            color: "rgba(255,255,255,0.6)",
            "&:hover": { bgcolor: "rgba(196,22,28,0.2)", color: "#ff6b6b" },
            transition: "all 0.2s ease",
          }}
        >
          <Logout fontSize="small" sx={{ mr: 1.5 }} />
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>

    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, border: "none" },
        }}
      >
        {drawer}
      </Drawer>

      {/* DESKTOP SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: "none",
            position: "relative",
            boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6f9", minHeight: "100vh" }}>

        {/* Mobile top bar */}
        <Box sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          gap: 1,
          px: 2, py: 1.5,
          bgcolor: BLUE,
          color: "#fff",
        }}>
          <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#fff" }}>
            <MenuIcon />
          </IconButton>
          <Typography fontWeight={700} fontSize={15}>Admin Panel</Typography>
        </Box>

        <Outlet />
      </Box>

    </Box>
  );
};

export default AdminLayout;