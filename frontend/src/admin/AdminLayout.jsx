import { Outlet, Link } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material";

const AdminLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>

      {/* Sidebar */}
      <Drawer variant="permanent" sx={{ width: 250 }}>
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Admin Panel
          </Typography>
          <List>
            <ListItem button component={Link} to="/admin/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/admin/categories">
              <ListItemText primary="Categories" />
            </ListItem>
            <ListItem button component={Link} to="/admin/products">
              <ListItemText primary="Products" />
            </ListItem>
            
            <ListItem button component={Link} to="/admin/orders">
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem button component={Link} to="/admin/billing">
              <ListItemText primary="Billing" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
