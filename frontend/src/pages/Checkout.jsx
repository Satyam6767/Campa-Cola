import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Container, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const Checkout = () => {
  const { token } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleConfirmOrder = async () => {
    if (!contact || !address) {
      alert("Contact and address are required");
      return;
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    try {
      await API.post(
        "/orders/create",
        {
          items: cart.items,
          totalAmount,
          contact,     // ✅ NOW SENT
          address,
          paymentMode: "COD",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/order-success", { state: { address, contact } });
    } catch (err) {
      alert("Order failed");
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Checkout
      </Typography>

      <TextField
        label="Contact Number"
        fullWidth
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Delivery Address"
        fullWidth
        multiline
        rows={3}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button variant="contained" fullWidth onClick={handleConfirmOrder}>
        Confirm Order
      </Button>
    </Container>
  );
};

export default Checkout;
