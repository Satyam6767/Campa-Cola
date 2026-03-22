import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  PersonAdd,
  Search,
  Receipt,
  Close,
  Add,
  Delete,
} from "@mui/icons-material";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MasterList = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Table state ──
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  // ── Search ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Add Customer Dialog ──
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [adding, setAdding] = useState(false);

  // ── Bill History Dialog ──
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingBills, setLoadingBills] = useState(false);

  // ── Delete Confirm Dialog ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch customers ── */
  const fetchCustomers = async (pg = 0) => {
    try {
      setLoading(true);
      const res = await API.get(
        `/customers?page=${pg + 1}&limit=${rowsPerPage}&search=${debouncedSearch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(res.data.customers || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(page); }, [page]);
  useEffect(() => { setPage(0); fetchCustomers(0); }, [debouncedSearch]);

  /* ── Add Customer ── */
  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      return toast.error("Name and phone are required");
    }
    try {
      setAdding(true);
      await API.post("/customers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Customer added!");
      setAddOpen(false);
      setForm({ name: "", phone: "", address: "" });
      fetchCustomers(0);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add customer");
    } finally {
      setAdding(false);
    }
  };

  /* ── Delete Customer ── */
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await API.delete(`/customers/${customerToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Customer deleted from Master List");
      setDeleteOpen(false);
      setCustomerToDelete(null);
      fetchCustomers(page);
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  /* ── View Bill History ── */
  const handleViewBills = async (customer) => {
    setSelectedCustomer(customer);
    setHistoryOpen(true);
    setLoadingBills(true);
    try {
      const res = await API.get(`/customers/${customer._id}/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data.bills || []);
      setStats({
        totalBills: res.data.totalBills,
        totalSpent: res.data.totalSpent,
        pendingAmount: res.data.pendingAmount,
        lastPurchase: res.data.lastPurchase,
      });
      fetchCustomers(page);
    } catch {
      toast.error("Failed to load bill history");
    } finally {
      setLoadingBills(false);
    }
  };

  /* ── Payment status chip ── */
  const paymentChip = (bill) => {
    if (bill.pendingAmount === 0)
      return <Chip label="Paid" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 }} />;
    if (bill.paidAmount === 0)
      return <Chip label="Unpaid" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 700 }} />;
    return <Chip label="Partial" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700 }} />;
  };

  const pendingColor = (amt) => {
    if (amt === 0) return { color: "#2e7d32", fontWeight: 700 };
    return { color: "#c62828", fontWeight: 700 };
  };

  return (
    <Box sx={{ p: 2, background: "#f4f6f9", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0B2A4A">
            Master Customer List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your regular customers
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setAddOpen(true)}
          sx={{ bgcolor: "#C4161C", "&:hover": { bgcolor: "#a31217" }, fontWeight: 700 }}
        >
          Add Customer
        </Button>
      </Box>

      {/* ── SEARCH ── */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Search sx={{ color: "#aaa" }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </Paper>

      {/* ── TABLE ── */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#0B2A4A" }}>
                <TableRow>
                  {["#", "Customer", "Phone", "Total Bills", "Total Spent", "Pending", "Last Purchase", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#999" }}>
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c, i) => (
                    <TableRow key={c._id} hover>
                      <TableCell>{page * rowsPerPage + i + 1}</TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#0B2A4A", fontSize: 13 }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} fontSize={13}>{c.name}</Typography>
                            {c.address && (
                              <Typography fontSize={11} color="text.secondary">
                                {c.address}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontSize: 13 }}>{c.phone}</TableCell>

                      <TableCell>
                        <Chip
                          label={c.totalBills || 0}
                          size="small"
                          sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700, color: "#2e7d32" }}>
                        ₹{(c.totalSpent || 0).toLocaleString()}
                      </TableCell>

                      <TableCell sx={pendingColor(c.pendingAmount || 0)}>
                        ₹{(c.pendingAmount || 0).toLocaleString()}
                      </TableCell>

                      <TableCell sx={{ fontSize: 12, color: "#666" }}>
                        {c.lastPurchase
                          ? new Date(c.lastPurchase).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <Tooltip title="View Bill History">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBills(c)}
                            sx={{ color: "#0B2A4A" }}
                          >
                            <Receipt fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Create New Bill">
                          <IconButton
                            size="small"
                            onClick={() => navigate("/admin/billing", { state: { customer: c } })}
                            sx={{ color: "#2e7d32" }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Customer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(c)}
                            sx={{ color: "#C4161C" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          </>
        )}
      </Paper>

      {/* ======================================================
          ADD CUSTOMER DIALOG
      ====================================================== */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0B2A4A" }}>
          Add New Customer
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth label="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Phone Number *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Address (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleAdd} variant="contained" disabled={adding}
            sx={{ bgcolor: "#C4161C", "&:hover": { bgcolor: "#a31217" } }}
          >
            {adding ? "Adding..." : "Add Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DELETE CONFIRM DIALOG
      ====================================================== */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#C4161C" }}>
          Delete Customer
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to remove{" "}
            <strong>{customerToDelete?.name}</strong> from the Master List?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ⚠️ This will only remove them from the Master List. Their bills will not be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm} variant="contained" disabled={deleting}
            sx={{ bgcolor: "#C4161C", "&:hover": { bgcolor: "#a31217" } }}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          BILL HISTORY DIALOG
      ====================================================== */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography fontWeight={800} color="#0B2A4A">{selectedCustomer?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedCustomer?.phone}</Typography>
          </Box>
          <IconButton onClick={() => setHistoryOpen(false)}><Close /></IconButton>
        </DialogTitle>

        <Divider />

        {!loadingBills && (
          <Box sx={{ display: "flex", gap: 2, px: 3, py: 2, flexWrap: "wrap" }}>
            <Paper sx={{ flex: 1, p: 2, borderRadius: 2, textAlign: "center", bgcolor: "#e3f2fd" }}>
              <Typography fontSize={22} fontWeight={800} color="#1565c0">{stats.totalBills || 0}</Typography>
              <Typography fontSize={12} color="#555">Total Bills</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, borderRadius: 2, textAlign: "center", bgcolor: "#e8f5e9" }}>
              <Typography fontSize={22} fontWeight={800} color="#2e7d32">₹{(stats.totalSpent || 0).toLocaleString()}</Typography>
              <Typography fontSize={12} color="#555">Total Spent</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, borderRadius: 2, textAlign: "center", bgcolor: (stats.pendingAmount || 0) > 0 ? "#ffebee" : "#e8f5e9" }}>
              <Typography fontSize={22} fontWeight={800} color={(stats.pendingAmount || 0) > 0 ? "#c62828" : "#2e7d32"}>
                ₹{(stats.pendingAmount || 0).toLocaleString()}
              </Typography>
              <Typography fontSize={12} color="#555">Pending Amount</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, borderRadius: 2, textAlign: "center", bgcolor: "#f3e5f5" }}>
              <Typography fontSize={14} fontWeight={800} color="#6a1b9a">
                {stats.lastPurchase ? new Date(stats.lastPurchase).toLocaleDateString("en-IN") : "—"}
              </Typography>
              <Typography fontSize={12} color="#555">Last Purchase</Typography>
            </Paper>
          </Box>
        )}

        <Divider />

        <DialogContent>
          {loadingBills ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : bills.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>
              No bills found for this customer
            </Typography>
          ) : (
            <Table size="small">
              <TableHead sx={{ bgcolor: "#0B2A4A" }}>
                <TableRow>
                  {["Invoice #", "Date", "Amount", "Paid", "Pending", "Status", "Action"].map((h) => (
                    <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill._id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{bill.invoiceNumber}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{new Date(bill.createdAt).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{bill.totalAmount}</TableCell>
                    <TableCell sx={{ color: "#2e7d32", fontWeight: 600 }}>₹{bill.paidAmount}</TableCell>
                    <TableCell sx={{ color: bill.pendingAmount > 0 ? "#c62828" : "#2e7d32", fontWeight: 600 }}>₹{bill.pendingAmount}</TableCell>
                    <TableCell>{paymentChip(bill)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Invoice">
                        <IconButton size="small" onClick={() => { setHistoryOpen(false); navigate(`/admin/invoice/${bill._id}`); }}>
                          <Receipt fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained" startIcon={<Add />}
            onClick={() => { setHistoryOpen(false); navigate("/admin/billing", { state: { customer: selectedCustomer } }); }}
            sx={{ bgcolor: "#C4161C", "&:hover": { bgcolor: "#a31217" } }}
          >
            Create New Bill
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default MasterList;