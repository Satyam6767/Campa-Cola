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

  // 🔹 NEW STATES
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ===============================
  // FETCH BILL
  // ===============================
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
        navigate("/admin/billing-history");
      });
  }, [id, token, navigate]);

  // ===============================
  // FETCH PRODUCTS
  // ===============================
  useEffect(() => {
    API.get("/products/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(() => {
        toast.error("Failed to load products");
      });
  }, [token]);

  if (loading || !bill) return null;

  // ===============================
  // SEARCH PRODUCT
  // ===============================
  const handleSearch = (value) => {
    setSearch(value);

    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  // ===============================
  // ADD PRODUCT
  // ===============================
  const addProductToBill = (product) => {
    const exists = items.find(
      (item) =>
        item.productId?._id === product._id ||
        item.productId === product._id
    );

    if (exists) {
      toast.error("Product already added");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Product out of stock");
      return;
    }

    const newItem = {
      productId: {
        _id: product._id,
        title: product.title,
      },
      price: product.price,
      quantity: 1,
    };

    setItems([...items, newItem]);
    setSearch("");
  };

  // ===============================
  // UPDATE QTY
  // ===============================
  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].quantity = Number(value);
    setItems(updated);
  };

  // ===============================
  // REMOVE ITEM
  // ===============================
  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // ===============================
  // CALCULATE TOTAL
  // ===============================
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ===============================
  // UPDATE BILL
  // ===============================
  const handleUpdate = async () => {
    try {
      await API.put(
        `/billing/${id}`,
        {
          customerName: bill.customerName,
          customerMobile: bill.customerMobile,
          customerAddress: bill.customerAddress,
          items: items.map((item) => ({
            productId:
              item.productId?._id || item.productId,
            price: item.price,
            quantity: item.quantity,
          })),
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

        {/* ADD PRODUCT SECTION */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" mb={1}>
            Add Product
          </Typography>

          <TextField
            fullWidth
            placeholder="Search product..."
            value={search}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
          />

          {search && (
            <Paper
              sx={{
                maxHeight: 200,
                overflow: "auto",
                mt: 1,
              }}
            >
              {filteredProducts.map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    p: 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  onClick={() =>
                    addProductToBill(product)
                  }
                >
                  {product.title} - ₹{product.price} 
                  (Stock: {product.stock})
                </Box>
              ))}
            </Paper>
          )}
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
                <TableCell>
                  {item.productId?.title}
                </TableCell>
                <TableCell>
                  ₹{item.price}
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(i, e.target.value)
                    }
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  ₹{item.price * item.quantity}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() =>
                      removeItem(i)
                    }
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
          <Typography>
            Total: ₹{totalAmount}
          </Typography>

          <TextField
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) =>
              setPaidAmount(Number(e.target.value))
            }
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
            onClick={() =>
              navigate("/admin/billing-history")
            }
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditBill;
