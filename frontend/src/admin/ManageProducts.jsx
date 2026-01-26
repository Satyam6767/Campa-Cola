import { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
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
} from "@mui/material";
import { toast } from "react-toastify";

const ManageProducts = () => {
  const { token } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    category: "",
  });

  const [editId, setEditId] = useState(null); // ✅ EDIT MODE

  // 🔹 Fetch Products
  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    }
  };

  // 🔹 Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // 🔹 ADD or UPDATE Product
  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.stock) {
      return toast.error("Title, price and stock are required");
    }

    try {
      if (editId) {
        // ✅ UPDATE
        await API.put(`/products/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated successfully");
      } else {
        // ✅ ADD
        await API.post("/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added successfully");
      }

      fetchProducts();
      resetForm();
    } catch {
      toast.error("Operation failed");
    }
  };

  // 🔹 SET FORM FOR EDIT
  const handleEdit = (product) => {
    setEditId(product._id);
    setFormData({
      title: product.title,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
      category: product.category,
    });
  };

  // 🔹 DELETE Product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
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
    setEditId(null);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Manage Products
      </Typography>

      {/* 🔹 Add / Update Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">
          {editId ? "Update Product" : "Add New Product"}
        </Typography>

        <TextField
          label="Product Name"
          fullWidth
          sx={{ mt: 2 }}
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <TextField
          label="Price"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
        />

        <TextField
          label="Stock"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: e.target.value })
          }
        />

        <TextField
          label="Image URL"
          fullWidth
          sx={{ mt: 2 }}
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
        />

        <TextField
          label="Description"
          multiline
          rows={3}
          fullWidth
          sx={{ mt: 2 }}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <Select
          displayEmpty
          fullWidth
          sx={{ mt: 2 }}
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        >
          <MenuItem value="">Select Category</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update Product" : "Add Product"}
          </Button>

          {editId && (
            <Button variant="outlined" color="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      {/* 🔹 Products Table */}
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Category</TableCell>
            <TableCell width="200px">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <img
                  src={p.image}
                  alt={p.title}
                  width="50"
                  height="50"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
              </TableCell>
              <TableCell>{p.title}</TableCell>
              <TableCell>₹{p.price}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>{p.category}</TableCell>

              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ mr: 1 }}
                  onClick={() => handleEdit(p)}
                >
                  Update
                </Button>

                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ManageProducts;
