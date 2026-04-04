import { useEffect, useState, useContext, useRef } from "react";
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
  MenuItem,
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
  const dropdownRef = useRef(null);

  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FETCH BILL
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

  // FETCH PRODUCTS
  useEffect(() => {
    API.get("/products", {
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

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);
    setShowDropdown(true);

    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  // SELECT PRODUCT
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch(product.title);
    setNewPrice(product.price);
    setShowDropdown(false);
  };

  // ADD PRODUCT
  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (newQty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (newQty > selectedProduct.stock) {
      toast.error("Insufficient stock");
      return;
    }

    const exists = items.find(
      (item) => item.productId?._id === selectedProduct._id
    );

    if (exists) {
      toast.error("Product already added");
      return;
    }

    const newItem = {
      productId: {
        _id: selectedProduct._id,
        title: selectedProduct.title,
      },
      price: Number(newPrice),
      quantity: Number(newQty),
    };

    setItems([...items, newItem]);

    setSelectedProduct(null);
    setSearch("");
    setNewQty(1);
    setNewPrice(0);
  };

  // UPDATE QTY
  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].quantity = Number(value);
    setItems(updated);
  };

  // UPDATE PRICE
  const updatePrice = (index, value) => {
    const updated = [...items];
    updated[index].price = Number(value);
    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // UPDATE BILL
  const handleUpdate = async () => {
    try {
      if (paidAmount > totalAmount) {
        toast.error("Paid amount cannot exceed total");
        return;
      }

      await API.put(
        `/billing/${id}`,
        {
          customerName: bill.customerName,
          customerMobile: bill.customerMobile || undefined,
          customerAddress: bill.customerAddress || undefined,
          paymentMode: bill.paymentMode,
          items: items.map((item) => ({
            productId: item.productId._id,
            price: item.price,
            quantity: item.quantity,
          })),
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" mb={1}>
            Customer Details
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Customer Name"
              value={bill.customerName || ""}
              onChange={(e) =>
                setBill({ ...bill, customerName: e.target.value })
              }
              sx={{ flex: 1 }}
            />

            <TextField
              label="Mobile (Optional)"
              value={bill.customerMobile || ""}
              onChange={(e) =>
                setBill({ ...bill, customerMobile: e.target.value })
              }
              sx={{ flex: 1 }}
            />

            <TextField
              label="Address (Optional)"
              value={bill.customerAddress || ""}
              onChange={(e) =>
                setBill({ ...bill, customerAddress: e.target.value })
              }
              sx={{ flex: 1 }}
            />

            <TextField
              select
              label="Payment Mode"
              value={bill.paymentMode || ""}
              onChange={(e) =>
                setBill({ ...bill, paymentMode: e.target.value })
              }
              sx={{ width: 200 }}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* ADD PRODUCT */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" mb={1}>
            Add Product
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Box ref={dropdownRef} sx={{ flex: 1, position: "relative" }}>
              <TextField
                fullWidth
                label="Search Product"
                value={search}
                onFocus={() => {
                  setShowDropdown(true);
                  setFilteredProducts(products);
                }}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {showDropdown && (
                <Paper
                  sx={{
                    position: "absolute",
                    width: "100%",
                    maxHeight: 200,
                    overflow: "auto",
                    zIndex: 10,
                  }}
                >
                  {filteredProducts.map((product) => (
                    <Box
                      key={product._id}
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.title} - ₹{product.price} (Stock: {product.stock})
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>

            <TextField
              type="number"
              label="Qty"
              value={newQty}
              onChange={(e) => setNewQty(Number(e.target.value))}
              sx={{ width: 100 }}
            />

            <TextField
              type="number"
              label="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              sx={{ width: 120 }}
            />

            <Button variant="contained" onClick={handleAddProduct}>
              Add
            </Button>
          </Box>
        </Box>

        {/* TABLE */}
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

                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.price}
                    onChange={(e) => updatePrice(i, e.target.value)}
                    sx={{ width: 100 }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQty(i, e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>

                <TableCell>₹{item.price * item.quantity}</TableCell>

                <TableCell>
                  <IconButton color="error" onClick={() => removeItem(i)}>
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

        {/* BUTTONS */}
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