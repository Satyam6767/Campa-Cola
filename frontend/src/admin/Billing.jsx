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
  TableBody
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
  const [customerAddress, setCustomerAddress] = useState(""); // ✅ NEW

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0)
      return toast.error("Invalid product or quantity");

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    if (quantity > product.stock) {
      return toast.error("Quantity exceeds available stock");
    }

    const newItem = {
      productId: product._id,
      name: product.title,
      price: product.price,
      quantity,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setQuantity(1);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitBill = async () => {
    if (
      !customerName ||
      !customerMobile ||
      !customerAddress ||
      items.length === 0
    ) {
      return toast.error("Please fill customer details & add items!");
    }

    try {
      await API.post(
        "/billing/create",
        {
          customerName,
          customerMobile,
          customerAddress, // ✅ SEND ADDRESS
          items,
          totalAmount,
          paymentMode: "Cash",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bill Created Successfully!");

      // ✅ RESET FORM
      setCustomerName("");
      setCustomerMobile("");
      setCustomerAddress("");
      setItems([]);

    } catch (err) {
      toast.error("Failed to create bill");
    }
  };

  return (
    <Box sx={{ p: 1 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Offline Billing
        </Typography>

        <Button
          variant="contained"
          size="small"
          sx={{ fontSize: "12px", py: "4px" }}
          onClick={() => navigate("/admin/billing-history")}
        >
          Old Bills
        </Button>
      </Box>

      {/* Customer Box */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
          Customer Details
        </Typography>

        <TextField
          label="Customer Name"
          size="small"
          fullWidth
          sx={{ mt: 1 }}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          InputProps={{ sx: { fontSize: "13px" } }}
          InputLabelProps={{ sx: { fontSize: "13px" } }}
        />

        <TextField
          label="Mobile"
          size="small"
          fullWidth
          sx={{ mt: 1 }}
          value={customerMobile}
          onChange={(e) => setCustomerMobile(e.target.value)}
          InputProps={{ sx: { fontSize: "13px" } }}
          InputLabelProps={{ sx: { fontSize: "13px" } }}
        />

        {/* ✅ NEW ADDRESS FIELD */}
        <TextField
          label="Customer Addressssss"
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 1 }}
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          InputProps={{ sx: { fontSize: "13px" } }}
          InputLabelProps={{ sx: { fontSize: "13px" } }}
        />
      </Paper>

      {/* Add Items Box */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
          Add Items
        </Typography>

        <Select
          fullWidth
          size="small"
          sx={{ mt: 1, fontSize: "13px" }}
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Select Product</MenuItem>
          {products.map((p) => (
            <MenuItem key={p._id} value={p._id} disabled={p.stock === 0}>
              {p.title} - ₹{p.price} (Stock: {p.stock})
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Quantity"
          type="number"
          size="small"
          fullWidth
          sx={{ mt: 1 }}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          InputProps={{ sx: { fontSize: "13px" } }}
          InputLabelProps={{ sx: { fontSize: "13px" } }}
        />

        <Button
          variant="contained"
          size="small"
          sx={{ mt: 1, fontSize: "12px", py: "4px" }}
          onClick={handleAddItem}
        >
          Add to Bill
        </Button>
      </Paper>

      {/* Items Table */}
      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
            Bill Items
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "13px" }}>Item</TableCell>
                <TableCell sx={{ fontSize: "13px" }}>Qty</TableCell>
                <TableCell sx={{ fontSize: "13px" }}>Price</TableCell>
                <TableCell sx={{ fontSize: "13px" }}>Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i} sx={{ height: "35px" }}>
                  <TableCell sx={{ fontSize: "13px" }}>{item.name}</TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>{item.quantity}</TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>₹{item.price}</TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    ₹{item.price * item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography sx={{ mt: 2, fontWeight: "bold", fontSize: "15px" }}>
            Final Total: ₹{totalAmount}
          </Typography>

          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mt: 1, fontSize: "12px", py: "4px" }}
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
