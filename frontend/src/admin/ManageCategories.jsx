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
  Divider,
  InputAdornment
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";

import { toast } from "react-toastify";
import "../mystyle/ManageCategories.css";

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
    } catch {
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
    } catch {
      toast.error("Delete error");
    }
  };

  return (
    <Box className="campa-container">

      {/* HEADER */}
      <div className="campa-header">
        <div className="campa-header-icon">
          <CategoryIcon />
        </div>
        Manage Categories
      </div>

      {/* ADD CATEGORY */}
      <Paper elevation={3} className="campa-add-box" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>
          Add New Category
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Category Name"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LabelIcon sx={{ color: "#C4161C" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            className="campa-add-btn"
            onClick={handleAdd}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table size="small">
          <TableHead className="campa-table-head">
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <div className="campa-empty">
                    <CategoryIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                    <div>No categories found</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c._id} className="campa-row">
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      className="campa-delete-btn"
                      onClick={() => handleDelete(c._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
};

export default ManageCategories;
