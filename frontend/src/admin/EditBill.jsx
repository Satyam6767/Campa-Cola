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
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch bill
  useEffect(() => {
    API.get(`/billing/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setBill(data);
        setItems(data.items);
        setPaidAmount(data.paidAmount || 0);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load bill");
        navigate("/admin/billing");
      });
  }, [id, token, navigate]);

  if (loading) return null;

  // Keeping this if needed later
  const isFullyPaid = bill.pendingAmount === 0;

  // 🔹 Quantity change
  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].quantity = Number(value);
    setItems(updated);
  };

  // 🔹 Remove item
  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // 🔹 Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔹 Submit update (NO RESTRICTION)
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
          <Typography>Total: ₹{totalAmount}</Typography>

          <TextField
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
        </Box>

        {/* ACTIONS */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpdate}
          >
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
