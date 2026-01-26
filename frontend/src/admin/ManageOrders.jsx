import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";

const ManageOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders!");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/orders/status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Order status updated!");
      fetchOrders();
    } catch (err) {
      toast.error("Update failed!");
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Manage Orders
      </Typography>

      {orders.map((order) => (
        <Paper key={order._id} sx={{ p: 3, mb: 3 }}>
          <Typography>
            <strong>Order ID:</strong> {order._id}
          </Typography>
          <Typography>
            <strong>Date:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Customer:</strong> {order.userId?.name} ({order.userId?.email})
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Contact Number:</strong> {order.contact}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Address:</strong> {order.address}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Order Items Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.productId?.title}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.productId?.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ color: "green" }}>
            Total: ₹{order.totalAmount}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Update Status:</Typography>
            <Select
              size="small"
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
              sx={{ mt: 1, width: 200 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default ManageOrders;
