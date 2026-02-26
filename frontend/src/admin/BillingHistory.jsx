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
  IconButton,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

const BillingHistory = () => {
  const { token } = useContext(AuthContext);

  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ new state
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const rowsPerPage = 10;
  const navigate = useNavigate();

  /* =========================
     DEBOUNCE LOGIC (500ms)
  ========================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================
     FETCH BILLS
  ========================= */
  const fetchBills = async (pageNumber = 0) => {
    try {
      setLoading(true);

      const response = await API.get(
        `/billing/all?page=${pageNumber + 1}&limit=${rowsPerPage}&search=${debouncedSearch}&payment=${paymentFilter}&date=${dateFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data.bills)) {
        setBills(response.data.bills);
        setTotalCount(response.data.total || 0);
      } else {
        setBills([]);
        setTotalCount(0);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      setBills([]);
      setTotalCount(0);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  /* Fetch when page changes */
  useEffect(() => {
    fetchBills(page);
  }, [page]);

  /* Fetch when filters OR debounced search change */
  useEffect(() => {
    setPage(0);
    fetchBills(0);
  }, [debouncedSearch, dateFilter, paymentFilter]);

  /* =========================
     DELETE BILL
  ========================= */
  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    try {
      await API.delete(`/billing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Bill Deleted!");
      fetchBills(page);

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Delete failed");
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  /* =========================
     PAYMENT ICON
  ========================= */
  const renderPaymentIcon = (bill) => {
    if (bill.pendingAmount === 0) {
      return (
        <Tooltip title="Fully Paid">
          <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} />
        </Tooltip>
      );
    }

    if (bill.paidAmount === 0) {
      return (
        <Tooltip title="Unpaid">
          <CancelIcon sx={{ color: "red", fontSize: 18 }} />
        </Tooltip>
      );
    }

    return (
      <Tooltip
        title={`Partial | Paid: ₹${bill.paidAmount}, Pending: ₹${bill.pendingAmount}`}
      >
        <HourglassBottomIcon sx={{ color: "#f9a825", fontSize: 18 }} />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Billing History
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Select
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <MenuItem value="all">All Dates</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
          </Select>

          <Select
            size="small"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <MenuItem value="all">All Payments</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
            <MenuItem value="Partial">Partial</MenuItem>
          </Select>

          <TextField
            size="small"
            placeholder="Search name or mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      </Box>

      {/* TABLE */}
      <Paper sx={{ p: 1.5, borderRadius: "8px" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#1976d2" }}>
                <TableRow>
                  {["Customer", "Mobile", "Amount", "Date", "Actions"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No bills found
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.customerMobile}</TableCell>
                      <TableCell>₹{bill.totalAmount}</TableCell>
                      <TableCell>
                        {new Date(bill.createdAt).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        <IconButton size="small" disabled>
                          {renderPaymentIcon(bill)}
                        </IconButton>

                        <Tooltip title="Print Invoice">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/admin/invoice/${bill._id}`)
                            }
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Bill">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate(`/admin/billing/edit/${bill._id}`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Bill">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteBill(bill._id)}
                          >
                            <DeleteIcon fontSize="small" />
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
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BillingHistory;