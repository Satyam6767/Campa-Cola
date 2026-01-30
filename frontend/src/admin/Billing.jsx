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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
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

  // 🔹 PAYMENT STATES
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paidType, setPaidType] = useState("full");
  const [paidAmount, setPaidAmount] = useState(0);

  const navigate = useNavigate();

  // 🔹 Fetch Products
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

  // 🔹 Add item
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

  // 🔹 Editable price
  const handlePriceChange = (index, newPrice) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, price: Number(newPrice) }
          : item
      )
    );
  };

  // 🔹 Editable quantity ✅ NEW
  const handleQuantityChange = (index, newQty) => {
    if (newQty <= 0) return;

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Number(newQty) }
          : item
      )
    );
  };

  // 🔹 Total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 Paid & Pending
  const finalPaidAmount =
    paymentStatus === "Paid"
      ? paidType === "full"
        ? totalAmount
        : paidAmount
      : 0;

  const pendingAmount = totalAmount - finalPaidAmount;

  // 🔹 Submit bill
  const handleSubmitBill = async () => {
    if (!customerName || !customerMobile || !customerAddress || !items.length)
      return toast.error("Fill customer details & add items");

    if (finalPaidAmount > totalAmount)
      return toast.error("Paid amount cannot exceed total");

    try {
      await API.post(
        "/billing/create",
        {
          customerName,
          customerMobile,
          customerAddress,
          items,
          totalAmount,
          paymentStatus,
          paidAmount: finalPaidAmount,
          pendingAmount,
          paymentMode: "Cash",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Bill Created Successfully!");

      setCustomerName("");
      setCustomerMobile("");
      setCustomerAddress("");
      setItems([]);
      setPaidAmount(0);
      setPaymentStatus("Paid");
      setPaidType("full");
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

      {/* BILL */}
      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight="bold">Bill Items</Typography>

          <Divider sx={{ my: 1 }} />

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

                  {/* ✅ Editable Quantity */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(i, e.target.value)
                      }
                      sx={{ width: 70 }}
                    />
                  </TableCell>

                  {/* ✅ Editable Price */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(i, e.target.value)
                      }
                      sx={{ width: 80 }}
                    />
                  </TableCell>

                  <TableCell>
                    ₹{item.price * item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAYMENT */}
          <Divider sx={{ my: 2 }} />

          <Select
            fullWidth
            size="small"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            sx={{ mb: 1 }}
          >
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
          </Select>

          {paymentStatus === "Paid" && (
            <>
              <FormLabel>Payment Type</FormLabel>
              <RadioGroup
                row
                value={paidType}
                onChange={(e) => setPaidType(e.target.value)}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label="Full Payment"
                />
                <FormControlLabel
                  value="partial"
                  control={<Radio />}
                  label="Partial / Pending"
                />
              </RadioGroup>

              {paidType === "partial" && (
                <TextField
                  label="Paid Amount"
                  type="number"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(Number(e.target.value))
                  }
                />
              )}
            </>
          )}

          <Typography fontWeight="bold" mt={1}>
            Total: ₹{totalAmount}
          </Typography>
          <Typography color="green">
            Paid: ₹{finalPaidAmount}
          </Typography>
          <Typography color="red">
            Pending: ₹{pendingAmount}
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
