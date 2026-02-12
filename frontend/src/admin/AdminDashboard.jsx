import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Grid,
  Paper,
  Typography,
  Box
} from "@mui/material";
import {
  ShoppingCart,
  CurrencyRupee,
  Inventory
} from "@mui/icons-material";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  const [data, setData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0
  });

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Sales",
      value: `₹${data.totalSales.toLocaleString()}`,
      icon: <CurrencyRupee sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #00b09b, #96c93d)"
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #2193b0, #6dd5ed)"
    },
    {
      title: "Total Products",
      value: data.totalProducts,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      gradient: "linear-gradient(135deg, #cc2b5e, #753a88)"
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              color: "#fff",
              background: card.gradient,
              transition: "0.3s",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.3)"
              }
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {card.value}
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                  {card.title}
                </Typography>
              </Box>

              {card.icon}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminDashboard;
