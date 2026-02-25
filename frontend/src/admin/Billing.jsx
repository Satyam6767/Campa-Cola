import { useState, useContext, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
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

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMap, setSelectedMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paidType, setPaidType] = useState("full");
  const [paidAmount, setPaidAmount] = useState(0);

  const navigate = useNavigate();

  // FETCH PRODUCTS
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

  // ✅ SEARCH BY TITLE + PRICE
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.price).includes(searchTerm)
    );
  }, [products, searchTerm]);

  // POPUP TOTALS
  const popupTotals = useMemo(() => {
    const values = Object.values(selectedMap);

    const totalQty = values.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = values.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );

    return { totalQty, totalPrice };
  }, [selectedMap]);

  // ✅ OPEN DIALOG WITH PRESELECTED ITEMS
  const handleOpenDialog = () => {
    const preSelected = {};

    items.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (product) {
        preSelected[product._id] = {
          ...product,
          quantity: item.quantity,
        };
      }
    });

    setSelectedMap(preSelected);
    setOpenDialog(true);
  };

  const handleSelect = (product) => {
    setSelectedMap((prev) => {
      const updated = { ...prev };

      if (updated[product._id]) {
        delete updated[product._id];
      } else {
        updated[product._id] = {
          ...product,
          quantity: 1,
        };
      }

      return updated;
    });
  };

  const handleDialogQtyChange = (id, qty) => {
    if (qty <= 0) return;

    setSelectedMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Number(qty),
      },
    }));
  };

  const handleAddSelected = () => {
    const selectedProducts = Object.values(selectedMap);

    if (!selectedProducts.length)
      return toast.error("Select at least one product");

    setItems((prev) => {
      let updatedItems = [...prev];

      selectedProducts.forEach((product) => {
        if (product.quantity > product.stock) {
          toast.error(`Stock exceeded for ${product.title}`);
          return;
        }

        const existingIndex = updatedItems.findIndex(
          (item) => item.productId === product._id
        );

        if (existingIndex !== -1) {
          updatedItems[existingIndex].quantity = product.quantity;
        } else {
          updatedItems.push({
            productId: product._id,
            name: product.title,
            price: product.price,
            quantity: product.quantity,
          });
        }
      });

      return updatedItems;
    });

    setOpenDialog(false);
  };

  const handlePriceChange = (index, newPrice) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, price: Number(newPrice) } : item
      )
    );
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty <= 0) return;

    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Number(newQty) } : item
      )
    );
  };

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const finalPaidAmount =
    paymentStatus === "Paid"
      ? paidType === "full"
        ? totalAmount
        : paidAmount
      : 0;

  const pendingAmount = totalAmount - finalPaidAmount;

  const handleSubmitBill = async () => {
    if (!items.length)
      return toast.error("Please add at least one item");

    if (finalPaidAmount > totalAmount)
      return toast.error("Paid amount cannot exceed total");

    try {
      await API.post(
        "/billing/create",
        {
          customerName: customerName || "N/A",
          customerMobile: customerMobile || "N/A",
          customerAddress: customerAddress || "N/A",
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
      setPaymentStatus("Unpaid");
      setPaidType("full");
    } catch {
      toast.error("Failed to create bill");
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>

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
          Customer Details (Optional)
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

      {/* ADD ITEM BUTTON */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button fullWidth variant="contained" onClick={handleOpenDialog}>
          Add Items
        </Button>
      </Paper>

      {/* DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Products</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search product or price..."
            sx={{ mb: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Qty</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Checkbox
                      checked={!!selectedMap[product._id]}
                      onChange={() => handleSelect(product)}
                    />
                  </TableCell>

                  <TableCell>{product.title}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>

                  <TableCell>
                    {selectedMap[product._id] && (
                      <TextField
                        size="small"
                        type="number"
                        value={selectedMap[product._id].quantity}
                        onChange={(e) =>
                          handleDialogQtyChange(product._id, e.target.value)
                        }
                        sx={{ width: 80 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight="bold">
              Total Quantity: {popupTotals.totalQty}
            </Typography>
            <Typography fontWeight="bold" color="primary">
              Total Price: ₹{popupTotals.totalPrice}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSelected}
            disabled={popupTotals.totalQty === 0}
          >
            Add Selected Items
          </Button>
        </DialogActions>
      </Dialog>

      {/* BILL TABLE */}
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
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
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
                  <TableCell>₹{item.price * item.quantity}</TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleDeleteItem(i)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
                <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                <FormControlLabel value="partial" control={<Radio />} label="Partial / Pending" />
              </RadioGroup>

              {paidType === "partial" && (
                <TextField
                  label="Paid Amount"
                  type="number"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              )}
            </>
          )}

          <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mt: 1,
  }}
>
  <Typography fontWeight="bold">
    Total: ₹{totalAmount}
  </Typography>

  <Typography fontWeight="bold">
    Total Items: {totalQuantity}
  </Typography>
</Box>
          <Typography color="green">Paid: ₹{finalPaidAmount}</Typography>
          <Typography color="red">Pending: ₹{pendingAmount}</Typography>

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