import { useContext, useEffect, useState } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import {
  Box, Paper, Typography, TextField, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Divider, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip,
  CircularProgress, Tooltip, Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

const BLUE  = "#0B2A4A";
const RED   = "#C4161C";
const LIGHT = "#f4f6f9";

/* random soft bg colors for category avatars */
const AVATAR_COLORS = [
  "#e3f2fd", "#fce4ec", "#e8f5e9", "#fff8e1",
  "#f3e5f5", "#e0f2f1", "#fff3e0", "#e8eaf6",
];

const ManageCategories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories]   = useState([]);
  const [category, setCategory]       = useState("");
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [search, setSearch]           = useState("");

  // delete confirm dialog
  const [deleteOpen, setDeleteOpen]         = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting]             = useState(false);

  /* ── fetch ── */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── add ── */
  const handleAdd = async () => {
    if (!category.trim()) return toast.error("Enter category name");
    try {
      setAdding(true);
      await API.post(
        "/categories",
        { name: category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category added!");
      setCategory("");
      fetchCategories();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  /* ── delete ── */
  const handleDeleteClick = (c) => {
    setCategoryToDelete(c);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await API.delete(`/categories/${categoryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted");
      setDeleteOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ── enter key to add ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  /* ── filtered list ── */
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: LIGHT, minHeight: "100vh" }}>

      {/* ── PAGE HEADER ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: 2,
          bgcolor: RED, display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(196,22,28,0.35)",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%":   { boxShadow: "0 0 0 0 rgba(196,22,28,0.4)" },
            "70%":  { boxShadow: "0 0 0 10px rgba(196,22,28,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(196,22,28,0)" },
          },
        }}>
          <CategoryIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, md: 20 }, color: BLUE }}>
            Manage Categories
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
            {categories.length} {categories.length === 1 ? "category" : "categories"} total
          </Typography>
        </Box>
      </Box>

      {/* ── ADD CATEGORY CARD ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: 3,
          bgcolor: "#fff",
          borderLeft: `5px solid ${RED}`,
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.08)" },
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 1.5, color: BLUE, fontSize: 14 }}>
          ➕ Add New Category
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}>
          <TextField
            fullWidth
            size="small"
            label="Category Name"
            placeholder="e.g. Cold Drinks, Juices..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LabelIcon sx={{ color: RED, fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: RED },
                "&.Mui-focused fieldset": { borderColor: RED },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: RED },
            }}
          />

          <Button
            variant="contained"
            startIcon={adding ? <CircularProgress size={16} color="inherit" /> : <AddCircleIcon />}
            onClick={handleAdd}
            disabled={adding}
            sx={{
              bgcolor: RED,
              fontWeight: 700,
              px: 3,
              whiteSpace: "nowrap",
              minWidth: { xs: "100%", sm: "auto" },
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "#a31217", boxShadow: "0 4px 14px rgba(196,22,28,0.35)" },
              transition: "all 0.2s ease",
            }}
          >
            {adding ? "Adding..." : "Add Category"}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: 12 }}>
          💡 Tip: Press <strong>Enter</strong> to quickly add a category
        </Typography>
      </Paper>

      {/* ── SEARCH + TABLE CARD ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: "#fff", overflow: "hidden" }}>

        {/* search bar */}
        <Box sx={{
          px: { xs: 2, md: 2.5 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          borderBottom: "1px solid #f0f0f0",
        }}>
          <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
            All Categories
          </Typography>

          <TextField
            size="small"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#aaa" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 220 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": { borderColor: BLUE },
                "&.Mui-focused fieldset": { borderColor: BLUE },
              },
            }}
          />
        </Box>

        {/* table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: RED }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#aaa" }}>
            <CategoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography fontSize={14}>
              {search ? "No categories match your search" : "No categories found"}
            </Typography>
            {search && (
              <Button size="small" onClick={() => setSearch("")} sx={{ mt: 1, color: RED }}>
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: BLUE }}>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 60 }}>#</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Category Name</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 100 }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((c, index) => (
                <TableRow
                  key={c._id}
                  hover
                  sx={{
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: "#f8f9fa" },
                    "&:hover .delete-btn": { opacity: 1 },
                  }}
                >
                  <TableCell sx={{ color: "#999", fontSize: 13 }}>{index + 1}</TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 34, height: 34,
                          bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                          color: BLUE,
                          fontSize: 15,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, md: 14 }, color: BLUE }}>
                        {c.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Delete Category" arrow>
                      <IconButton
                        size="small"
                        className="delete-btn"
                        onClick={() => handleDeleteClick(c)}
                        sx={{
                          color: RED,
                          opacity: { xs: 1, md: 0.4 },
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(196,22,28,0.08)",
                            transform: "scale(1.15)",
                            opacity: 1,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* footer count */}
        {!loading && filtered.length > 0 && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontSize={12} color="text.secondary">
              Showing {filtered.length} of {categories.length} categories
            </Typography>
            {search && (
              <Chip
                label={`"${search}"`}
                size="small"
                onDelete={() => setSearch("")}
                sx={{ fontSize: 11 }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: RED, fontSize: 16 }}>
          Delete Category
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography fontSize={14}>
            Are you sure you want to delete{" "}
            <strong style={{ color: BLUE }}>"{categoryToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>
            ⚠️ Products using this category will not be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            size="small"
            sx={{ borderColor: BLUE, color: BLUE, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            size="small"
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

export default ManageCategories;