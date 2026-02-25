import { useState, useEffect, useContext, useRef } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import html2pdf from "html2pdf.js";

import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";

import {
  Search,
  Edit,
  Delete,
  Upload,
  PictureAsPdf,
  Refresh,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

import { toast } from "react-toastify";

const ManageProducts = () => {
  const { token } = useContext(AuthContext);
  const pdfRef = useRef();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await API.get("/products");
    setProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await API.get("/categories");
    setCategories(data);
  };

  // REFRESH
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setSearch("");
      setFilterCategory("");
      setSortField("");
      setSortOrder("asc");
      await fetchProducts();
      toast.success("Products refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  // SORT
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  // FILTER + SORT
  const filteredSortedProducts = [...products]
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      filterCategory ? p.category === filterCategory : true
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aValue = Number(a[sortField]);
      const bValue = Number(b[sortField]);
      return sortOrder === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });

  // EXPORT PDF
  const handleExportPDF = () => {
    const options = {
      margin: 0.5,
      filename: "products.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(pdfRef.current).save();
  };

  const handleOpenAdd = () => {
    setEditId(null);
    resetForm();
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setFormData(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.stock) {
      return toast.error("Title, price and stock required");
    }

    try {
      if (editId) {
        await API.put(`/products/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated");
      } else {
        await API.post("/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added");
      }

      await fetchProducts();
      handleClose();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await API.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Product deleted");
    fetchProducts();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      stock: "",
      image: "",
      description: "",
      category: "",
    });
  };

  return (
    <Box sx={{ p: 4, background: "#f4f6f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Product List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your products
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton sx={{ bgcolor: "#fff" }} onClick={handleExportPDF}>
            <PictureAsPdf color="error" />
          </IconButton>

          <IconButton sx={{ bgcolor: "#fff" }} onClick={handleRefresh}>
            <Refresh
              color="primary"
              sx={{
                animation: loading ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </IconButton>

          <Button
            variant="contained"
            sx={{ bgcolor: "#f7941d" }}
            onClick={handleOpenAdd}
          >
            + Add Product
          </Button>

          {/* <Button
            variant="contained"
            startIcon={<Upload />}
            sx={{ bgcolor: "#001f3f" }}
          >
            Import Products
          </Button> */}
        </Box>
      </Box>

      {/* TABLE */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>
                Price
                <IconButton size="small" onClick={() => handleSort("price")}>
                  {sortField === "price" && sortOrder === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  )}
                </IconButton>
              </TableCell>
              <TableCell>
                Qty
                <IconButton size="small" onClick={() => handleSort("stock")}>
                  {sortField === "stock" && sortOrder === "asc" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  )}
                </IconButton>
              </TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredSortedProducts.map((p, index) => (
              <TableRow key={p._id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar src={p.image} variant="rounded" />
                    {p.title}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={p.category} size="small" />
                </TableCell>
                <TableCell>₹{p.price}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(p)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* HIDDEN PRINT SECTION */}
      <div style={{ display: "none" }}>
        <div ref={pdfRef} style={{}}>
          <h4>Product List</h4>
          <table border="1" cellPadding="8" width="100%">
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                {/* <th>Qty</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredSortedProducts.map((p, index) => (
                <tr key={p._id}>
                  <td>{index + 1}</td>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{p.price}</td>
                  {/* <td>{p.stock}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL MODAL (ALL FIELDS RESTORED) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editId ? "Update Product" : "Add Product"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Select
                fullWidth
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                displayEmpty
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProducts;