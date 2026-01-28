import { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import API from "../api/api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0)
      return toast.error("Invalid product or quantity");

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    if (quantity > product.stock)
      return toast.error("Quantity exceeds available stock");

    setItems((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.title,
        price: product.price,
        quantity,
      },
    ]);

    setSelectedProduct("");
    setQuantity(1);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitBill = async () => {
    if (!customerName || !customerMobile || !customerAddress || !items.length)
      return toast.error("Fill customer details & add items");

    try {
      await API.post(
        "/billing/create",
        {
          customerName,
          customerMobile,
          customerAddress,
          items,
          totalAmount,
          paymentMode: "Cash",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bill Created Successfully!");
      setCustomerName("");
      setCustomerMobile("");
      setCustomerAddress("");
      setItems([]);
    } catch {
      toast.error("Failed to create bill");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography fontWeight="bold" fontSize={18}>
          Offline Billing
        </Typography>

        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate("/admin/billing-history")}
        >
          All Bills
        </Button>
      </Box>

      {/* CUSTOMER DETAILS */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight="bold" mb={1}>
          Customer Details
        </Typography>

        <TextField
          label="Customer Name"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <TextField
          label="Mobile"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          value={customerMobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
        />

        <TextField
          label="Customer Address"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
        />
      </Paper>

      {/* ADD ITEMS */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight="bold" mb={1}>
          Add Item
        </Typography>

        <Select
          fullWidth
          size="small"
          sx={{ mb: 1 }}
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Select Product</MenuItem>
          {products.map((p) => (
            <MenuItem key={p._id} value={p._id} disabled={p.stock === 0}>
              {p.title} – ₹{p.price} (Stock: {p.stock})
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Quantity"
          type="number"
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <Button fullWidth variant="contained" onClick={handleAddItem}>
          Add to Bill
        </Button>
      </Paper>

      {/* BILL ITEMS */}
      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight="bold" mb={1}>
            Bill Items
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>₹{item.price * item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography fontWeight="bold" mt={2}>
            Final Total: ₹{totalAmount}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            color="success"
            sx={{ mt: 1 }}
            onClick={handleSubmitBill}
          >
            Generate Bill
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Billing;
