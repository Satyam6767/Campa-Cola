import { useEffect, useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchOrders();
  }, [token]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography>No orders found!</Typography>
      ) : (
        orders.map((order) => (
          <Card key={order._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1">
                Order ID: {order._id}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "gray" }}>
                Date: {new Date(order.createdAt).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 1 }} />

              {order.items.map((item) => (
                <Typography key={item.productId._id}>
                  {item.productId.title} x {item.quantity}
                </Typography>
              ))}

              <Divider sx={{ my: 1 }} />

              <Typography variant="h6" sx={{ color: "green" }}>
                Total: ₹{order.totalAmount}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                Status: <strong>{order.status}</strong>
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Orders;
