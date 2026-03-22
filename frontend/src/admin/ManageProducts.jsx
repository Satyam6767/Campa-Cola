import { useState, useEffect, useContext, useRef } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import html2pdf from "html2pdf.js";
import {
  Box, Button, Typography, TextField, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Select, MenuItem,
  Avatar, IconButton, InputAdornment, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid,
  CircularProgress, Tooltip, Divider, useMediaQuery, useTheme,
} from "@mui/material";
import {
  Edit, Delete, PictureAsPdf, Refresh,
  ArrowUpward, ArrowDownward, Search, Add,
  Inventory, FilterList, Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const BLUE  = "#0B2A4A";
const RED   = "#C4161C";
const LIGHT = "#f4f6f9";

/* ── stock chip ── */
const StockChip = ({ stock }) => {
  if (stock === 0)
    return <Chip label="Out of Stock" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 700, fontSize: 11 }} />;
  if (stock <= 10)
    return <Chip label={`Low: ${stock}`} size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700, fontSize: 11 }} />;
  return <Chip label={stock} size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: 11 }} />;
};

const ManageProducts = () => {
  const { token } = useContext(AuthContext);
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("sm"));
  const pdfRef    = useRef();

  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [search, setSearch]             = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortField, setSortField]       = useState("");
  const [sortOrder, setSortOrder]       = useState("asc");
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  // dialog
  const [open, setOpen]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // delete dialog
  const [deleteOpen, setDeleteOpen]         = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting]             = useState(false);

  const [formData, setFormData] = useState({
    title: "", price: "", stock: "",
    image: "", description: "", category: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/products");
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch {
      console.log("Failed to load categories");
    }
  };

  /* ── refresh ── */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setSearch("");
      setFilterCategory("");
      setSortField("");
      setSortOrder("asc");
      await fetchProducts();
      toast.success("Refreshed!");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  /* ── sort ── */
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpward sx={{ fontSize: 14, opacity: 0.3 }} />;
    return sortOrder === "asc"
      ? <ArrowUpward sx={{ fontSize: 14, color: RED }} />
      : <ArrowDownward sx={{ fontSize: 14, color: RED }} />;
  };

  /* ── filter + sort ── */
  const filteredProducts = [...products]
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter(p => filterCategory ? p.category === filterCategory : true)
    .sort((a, b) => {
      if (!sortField) return 0;
      return sortOrder === "asc"
        ? Number(a[sortField]) - Number(b[sortField])
        : Number(b[sortField]) - Number(a[sortField]);
    });

  /* ── pdf export ── */
  const handleExportPDF = () => {
    html2pdf().set({
      margin: 0.5,
      filename: "products.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).from(pdfRef.current).save();
  };

  /* ── dialog ── */
  const handleOpenAdd = () => {
    setEditId(null);
    resetForm();
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setFormData({
      title:       product.title       || "",
      price:       product.price       || "",
      stock:       product.stock       || "",
      image:       product.image       || "",
      description: product.description || "",
      category:    product.category    || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || formData.stock === "") {
      return toast.error("Title, price and stock are required");
    }
    try {
      setSubmitting(true);
      if (editId) {
        await API.put(`/products/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated!");
      } else {
        await API.post("/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added!");
      }
      await fetchProducts();
      handleClose();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── delete ── */
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await API.delete(`/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted!");
      setDeleteOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", price: "", stock: "", image: "", description: "", category: "" });
  };

  /* stats */
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: LIGHT, minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2,
            bgcolor: BLUE, display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(11,42,74,0.3)",
          }}>
            <Inventory sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, md: 20 }, color: BLUE }}>
              Manage Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
              {products.length} products
              {outOfStock > 0 && <span style={{ color: RED, marginLeft: 8 }}>• {outOfStock} out of stock</span>}
              {lowStock > 0 && <span style={{ color: "#f57f17", marginLeft: 8 }}>• {lowStock} low stock</span>}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Export PDF">
            <IconButton
              onClick={handleExportPDF}
              sx={{ bgcolor: "#fff", border: "1px solid #eee", borderRadius: 2, "&:hover": { bgcolor: "#fff8f8" } }}
            >
              <PictureAsPdf sx={{ color: RED, fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              sx={{ bgcolor: "#fff", border: "1px solid #eee", borderRadius: 2, "&:hover": { bgcolor: "#f0f4ff" } }}
            >
              <Refresh
                sx={{
                  color: BLUE, fontSize: 20,
                  animation: refreshing ? "spin 0.8s linear infinite" : "none",
                  "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAdd}
            sx={{
              bgcolor: RED, fontWeight: 700, borderRadius: 2,
              boxShadow: "none", fontSize: { xs: 12, md: 13 },
              "&:hover": { bgcolor: "#a31217", boxShadow: "0 4px 14px rgba(196,22,28,0.35)" },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* ── FILTERS ── */}
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderRadius: 3, bgcolor: "#fff" }}>
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          alignItems: { sm: "center" },
        }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#aaa" }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <Select
            size="small"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            displayEmpty
            sx={{ minWidth: { xs: "100%", sm: 180 }, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => (
              <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
            ))}
          </Select>

          {(search || filterCategory) && (
            <Button
              size="small"
              onClick={() => { setSearch(""); setFilterCategory(""); }}
              sx={{ color: RED, fontWeight: 600, whiteSpace: "nowrap", minWidth: "auto" }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── TABLE ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: RED }} />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "#aaa" }}>
            <Inventory sx={{ fontSize: 52, opacity: 0.25, mb: 1 }} />
            <Typography fontSize={14}>
              {search || filterCategory ? "No products match your filters" : "No products yet"}
            </Typography>
            {(search || filterCategory) && (
              <Button size="small" onClick={() => { setSearch(""); setFilterCategory(""); }} sx={{ mt: 1, color: RED }}>
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: { xs: 550, md: "100%" } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: BLUE }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 50 }}>#</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Product</TableCell>
                  {!isMobile && (
                    <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Category</TableCell>
                  )}
                  <TableCell
                    sx={{ color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", userSelect: "none" }}
                    onClick={() => handleSort("price")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Price <SortIcon field="price" />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", userSelect: "none" }}
                    onClick={() => handleSort("stock")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Stock <SortIcon field="stock" />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredProducts.map((p, index) => (
                  <TableRow
                    key={p._id}
                    hover
                    sx={{
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#f8f9fa" },
                      "&:hover .action-btns": { opacity: 1 },
                    }}
                  >
                    <TableCell sx={{ color: "#999", fontSize: 13 }}>{index + 1}</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={p.image}
                          variant="rounded"
                          sx={{ width: { xs: 32, md: 38 }, height: { xs: 32, md: 38 }, bgcolor: "#f0f0f0", flexShrink: 0 }}
                        >
                          {p.title?.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={700}
                            fontSize={{ xs: 12, md: 13 }}
                            color={BLUE}
                            noWrap
                            sx={{ maxWidth: { xs: 100, md: 200 } }}
                          >
                            {p.title}
                          </Typography>
                          {isMobile && p.category && (
                            <Typography fontSize={11} color="text.secondary">{p.category}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {!isMobile && (
                      <TableCell>
                        {p.category ? (
                          <Chip
                            label={p.category}
                            size="small"
                            sx={{ bgcolor: "#e3f2fd", color: BLUE, fontWeight: 600, fontSize: 11 }}
                          />
                        ) : (
                          <Typography fontSize={12} color="#ccc">—</Typography>
                        )}
                      </TableCell>
                    )}

                    <TableCell sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 12, md: 13 }, whiteSpace: "nowrap" }}>
                      ₹{p.price}
                    </TableCell>

                    <TableCell>
                      <StockChip stock={p.stock} />
                    </TableCell>

                    <TableCell align="center">
                      <Box className="action-btns" sx={{ display: "flex", justifyContent: "center", gap: 0.5, opacity: { xs: 1, md: 0.5 }, transition: "opacity 0.2s" }}>
                        <Tooltip title="Edit Product">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(p)}
                            sx={{
                              color: BLUE,
                              "&:hover": { bgcolor: "rgba(11,42,74,0.08)", transform: "scale(1.1)" },
                              transition: "all 0.2s",
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Product">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(p)}
                            sx={{
                              color: RED,
                              "&:hover": { bgcolor: "rgba(196,22,28,0.08)", transform: "scale(1.1)" },
                              transition: "all 0.2s",
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* footer */}
        {!loading && filteredProducts.length > 0 && (
          <Box sx={{
            px: 2.5, py: 1.5,
            borderTop: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 1,
          }}>
            <Typography fontSize={12} color="text.secondary">
              Showing {filteredProducts.length} of {products.length} products
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {outOfStock > 0 && (
                <Chip label={`${outOfStock} Out of Stock`} size="small"
                  sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, fontSize: 11 }} />
              )}
              {lowStock > 0 && (
                <Chip label={`${lowStock} Low Stock`} size="small"
                  sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 600, fontSize: 11 }} />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── HIDDEN PDF DIV ── */}
      <div style={{ display: "none" }}>
        <div ref={pdfRef}>
          <h4 style={{ color: BLUE }}>Product List — Janki Enterprises</h4>
          <table border="1" cellPadding="8" width="100%" style={{ borderCollapse: "collapse" }}>
            <thead style={{ background: BLUE, color: "#fff" }}>
              <tr>
                <th>No</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td>{p.title}</td>
                  <td>{p.category || "—"}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography fontWeight={800} color={BLUE} fontSize={16}>
            {editId ? "✏️ Edit Product" : "➕ Add New Product"}
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Product Name *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: BLUE } }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth label="Price (₹) *" type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth label="Stock *" type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Select
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                displayEmpty
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderRadius: 1 } }}
              >
                <MenuItem value=""><em>Select Category</em></MenuItem>
                {categories.map(c => (
                  <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              {formData.image && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={formData.image} variant="rounded" sx={{ width: 48, height: 48 }} />
                  <Typography fontSize={12} color="text.secondary">Image preview</Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline rows={3}
                placeholder="Product description..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined"
            sx={{ borderColor: BLUE, color: BLUE, fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: RED, fontWeight: 700, "&:hover": { bgcolor: "#a31217" } }}
          >
            {submitting ? "Saving..." : editId ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: RED, fontSize: 16 }}>
          Delete Product
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar src={productToDelete?.image} variant="rounded" sx={{ width: 44, height: 44, bgcolor: "#f0f0f0" }}>
              {productToDelete?.title?.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight={700} color={BLUE} fontSize={14}>{productToDelete?.title}</Typography>
              <Typography fontSize={12} color="text.secondary">₹{productToDelete?.price} • Stock: {productToDelete?.stock}</Typography>
            </Box>
          </Box>
          <Typography fontSize={14}>
            Are you sure you want to delete this product?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>
            ⚠️ This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined"
            sx={{ borderColor: BLUE, color: BLUE, fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            sx={{ bgcolor: RED, fontWeight: 700, "&:hover": { bgcolor: "#a31217" } }}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ManageProducts;