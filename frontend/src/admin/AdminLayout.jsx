import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 250;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Admin Panel
      </Typography>

      <List>
        <ListItem button component={Link} to="/admin/dashboard" onClick={handleDrawerToggle}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/admin/categories" onClick={handleDrawerToggle}>
          <ListItemText primary="Categories" />
        </ListItem>
        <ListItem button component={Link} to="/admin/products" onClick={handleDrawerToggle}>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button component={Link} to="/admin/orders" onClick={handleDrawerToggle}>
          <ListItemText primary="Orders" />
        </ListItem>
        <ListItem button component={Link} to="/admin/billing" onClick={handleDrawerToggle}>
          <ListItemText primary="Billing" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top AppBar (Mobile Only) */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 1 }}>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: { xs: 7, sm: 0 }, // space for AppBar on mobile
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
