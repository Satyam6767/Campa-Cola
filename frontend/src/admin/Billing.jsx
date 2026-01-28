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
  Grid,
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

    setItems([
      ...items,
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
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography fontWeight="bold">Offline Billing</Typography>

        <Button
          size="small"
          variant="contained"
          onClick={() => navigate("/admin/billing-history")}
        >
          Old Bills
        </Button>
      </Box>

      {/* Customer Details */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight="bold" mb={1}>
          Customer Details
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer Name"
              size="small"
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile"
              size="small"
              fullWidth
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Customer Address"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Add Items */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight="bold" mb={1}>
          Add Items
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Select
              fullWidth
              size="small"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Product</MenuItem>
              {products.map((p) => (
                <MenuItem key={p._id} value={p._id} disabled={p.stock === 0}>
                  {p.title} - ₹{p.price}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Qty"
              type="number"
              size="small"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleAddItem}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bill Items */}
      {items.length > 0 && (
        <Paper sx={{ p: 2, overflowX: "auto" }}>
          <Typography fontWeight="bold" mb={1}>
            Bill Items
          </Typography>

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
