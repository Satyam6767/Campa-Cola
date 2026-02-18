import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditBill = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQty, setNewQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Bill
  useEffect(() => {
    API.get(`/billing/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setBill(data);
        setItems(data.items || []);
        setPaidAmount(data.paidAmount || 0);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load bill");
        navigate("/admin/billing");
      });
  }, [id, token, navigate]);

  // 🔹 Fetch Products
  useEffect(() => {
    API.get("/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error("Failed to load products"));
  }, [token]);

  if (loading || !bill) return null;

  // 🔹 Update Quantity
  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].quantity = Number(value);
    setItems(updated);
  };

  // 🔹 Remove Item
  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // 🔹 Add Product
  const addProduct = () => {
    if (!selectedProduct) return toast.error("Select product");
    if (newQty <= 0) return toast.error("Quantity must be greater than 0");

    const existingIndex = items.findIndex(
      (item) => item.productId?._id === selectedProduct._id
    );

    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += newQty;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct,
          price: selectedProduct.price,
          quantity: newQty,
        },
      ]);
    }

    setSelectedProduct(null);
    setNewQty(1);
  };

  // 🔹 Calculate Total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 Update Bill
  const handleUpdate = async () => {
    try {
      await API.put(
        `/billing/${id}`,
        {
          customerName: bill.customerName,
          customerMobile: bill.customerMobile,
          customerAddress: bill.customerAddress,
          items,
          paymentMode: bill.paymentMode,
          paidAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Bill updated successfully");
      navigate("/admin/billing-history");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Edit Bill (Invoice #{bill.invoiceNumber})
      </Typography>

      <Paper sx={{ p: 2 }}>
        {/* CUSTOMER DETAILS */}
        <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
          <TextField
            label="Customer Name"
            value={bill.customerName}
            onChange={(e) =>
              setBill({ ...bill, customerName: e.target.value })
            }
          />

          <TextField
            label="Mobile"
            value={bill.customerMobile}
            onChange={(e) =>
              setBill({ ...bill, customerMobile: e.target.value })
            }
          />

          <TextField
            label="Address"
            value={bill.customerAddress}
            onChange={(e) =>
              setBill({ ...bill, customerAddress: e.target.value })
            }
          />
        </Box>

        {/* ADD PRODUCT WITH SEARCH */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Autocomplete
            options={products}
            getOptionLabel={(option) =>
              `${option.title} (₹${option.price})`
            }
            value={selectedProduct}
            onChange={(event, newValue) => {
              setSelectedProduct(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Search Product" />
            )}
            sx={{ minWidth: 300 }}
          />

          <TextField
            type="number"
            label="Qty"
            value={newQty}
            onChange={(e) => setNewQty(Number(e.target.value))}
            sx={{ width: 100 }}
          />

          <Button variant="contained" onClick={addProduct}>
            Add Product
          </Button>
        </Box>

        {/* ITEMS TABLE */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.productId?.title}</TableCell>
                <TableCell>₹{item.price}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQty(i, e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  ₹{item.price * item.quantity}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => removeItem(i)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAYMENT */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">
            Total: ₹{totalAmount}
          </Typography>

          <TextField
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        </Box>

        {/* ACTIONS */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleUpdate}>
            Update Bill
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/admin/billing-history")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditBill;
