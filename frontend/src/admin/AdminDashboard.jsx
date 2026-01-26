import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Grid, Paper, Typography } from "@mui/material";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0
  });

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  return (
    <Grid container spacing={3}>
      {Object.keys(data).map((key) => (
        <Grid item xs={12} md={4} key={key}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {data[key]}
            </Typography>
            <Typography variant="body1" sx={{ color: "gray", mt: 1 }}>
              {key.replace(/([A-Z])/g, " $1")}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminDashboard;
