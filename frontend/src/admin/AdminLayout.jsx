import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const drawerWidth = 250;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Admin Panel
      </Typography>

      <List>
        {[
          { text: "Dashboard", path: "/admin/dashboard" },
          { text: "Categories", path: "/admin/categories" },
          { text: "Products", path: "/admin/products" },
          { text: "Orders", path: "/admin/orders" },
          { text: "Billing", path: "/admin/billing" },
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
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* DESKTOP SIDEBAR */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            position: "relative",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        {/* ✅ CHANGED ICON BUTTON */}
        <Box sx={{ display: { xs: "block", md: "none" }, mb: 1 }}>
          <IconButton
            onClick={toggleDrawer}
            sx={{
              border: "1px solid #ddd",
              borderRadius: 1,
            }}
          >
            {mobileOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
