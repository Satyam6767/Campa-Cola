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
  const [page, setPage] = useState(0);

  const [dateFilter, setDateFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const rowsPerPage = 10;
  const navigate = useNavigate();

  const fetchBills = async () => {
    try {
      const { data } = await API.get("/billing/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBills(sorted);
    } catch {
      toast.error("Failed to fetch bills");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await API.delete(`/billing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bill Deleted!");
      fetchBills();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

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
        title={`Partial Payment | Paid: ₹${bill.paidAmount}, Pending: ₹${bill.pendingAmount}`}
      >
        <HourglassBottomIcon sx={{ color: "#f9a825", fontSize: 18 }} />
      </Tooltip>
    );
  };

  const filteredBills = bills.filter((bill) => {
    const name = bill.customerName?.toLowerCase() || "";
    const mobile = bill.customerMobile || "";
    const createdAt = new Date(bill.createdAt);
    const now = new Date();

    const searchMatch =
      name.includes(search.toLowerCase()) || mobile.includes(search);

    let paymentMatch = true;
    if (paymentFilter === "Paid") paymentMatch = bill.pendingAmount === 0;
    if (paymentFilter === "Unpaid") paymentMatch = bill.paidAmount === 0;
    if (paymentFilter === "Partial")
      paymentMatch = bill.paidAmount > 0 && bill.pendingAmount > 0;

    let dateMatch = true;
    if (dateFilter === "today") {
      dateMatch = createdAt.toDateString() === now.toDateString();
    }
    if (dateFilter === "7days") {
      dateMatch = (now - createdAt) / 86400000 <= 7;
    }
    if (dateFilter === "30days") {
      dateMatch = (now - createdAt) / 86400000 <= 30;
    }

    return searchMatch && paymentMatch && dateMatch;
  });

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </Box>
      </Box>

      {/* TABLE */}
      <Paper sx={{ p: 1.5, borderRadius: "8px" }}>
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
            {filteredBills
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((bill) => {
                const isFullyPaid = bill.pendingAmount === 0;

                return (
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

                      {/* EDIT BUTTON ENABLED */}
                      <Tooltip
                        title={
                          isFullyPaid
                            ? "Fully paid bill (Editing Allowed)"
                            : "Edit Bill"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate(`/admin/billing/edit/${bill._id}`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
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
                );
              })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredBills.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </Paper>
    </Box>
  );
};

export default BillingHistory;
