import { useContext, useEffect, useState } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CategoryIcon from "@mui/icons-material/Category";
import { toast } from "react-toastify";

const ManageCategories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!category.trim()) return toast.error("Enter category name");

    try {
      await API.post(
        "/categories",
        { name: category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Category added!");
      setCategory("");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to add");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Delete error");
    }
  };

  return (
    <Box sx={{ p: 1 }}>

      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "16px"
        }}
      >
        <CategoryIcon sx={{ fontSize: 20, color: "#1976d2" }} />
        Manage Categories
      </Typography>

      {/* Add Category Box */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 2, borderRadius: "8px" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: "14px" }}>
          Add New Category
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Category Name"
            InputProps={{ sx: { fontSize: "13px" } }}
            InputLabelProps={{ sx: { fontSize: "13px" } }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: "12px", px: 1.5 }}
            onClick={handleAdd}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Categories Table */}
      <Paper elevation={1} sx={{ borderRadius: "8px", overflow: "hidden" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1976d2", height: "30px" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", fontSize: "13px" }}>
                Category Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", fontSize: "13px" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((c) => (
              <TableRow key={c._id} sx={{ height: "35px" }}>
                <TableCell sx={{ fontSize: "13px" }}>{c.name}</TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(c._id)}
                  >
                    <DeleteIcon sx={{ fontSize: 16, color: "red" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
};

export default ManageCategories;
