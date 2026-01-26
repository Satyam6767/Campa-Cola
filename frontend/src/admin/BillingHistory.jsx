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
  TextField
} from "@mui/material";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

const BillingHistory = () => {
  const { token } = useContext(AuthContext);

  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const rowsPerPage = 10;
  const navigate = useNavigate();

  // Fetch Bills
  const fetchBills = async () => {
    try {
      const { data } = await API.get("/billing/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(data.reverse());
    } catch (err) {
      toast.error("Failed to fetch bills");
    }
  };

  // Delete Bill
  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await API.delete(`/billing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bill Deleted!");
      fetchBills();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0); // reset page on search
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ✅ SAFE FILTER (NO CRASH)
  const filteredBills = bills.filter((bill) => {
    const name = bill.customerName || "";
    const mobile = bill.customerMobile || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      mobile.includes(search)
    );
  });

  return (
    <Box sx={{ p: 1 }}>

      {/* Header + Search */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Billing History
        </Typography>

        <TextField
          size="small"
          placeholder="Search name or mobile"
          value={search}
          onChange={handleSearch}
        />
      </Box>

      {/* Table */}
      <Paper elevation={1} sx={{ p: 1.5, borderRadius: "8px" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>
                Customer
              </TableCell>
              <TableCell sx={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>
                Mobile
              </TableCell>
              <TableCell sx={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>
                Amount
              </TableCell>
              <TableCell sx={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>
                Date
              </TableCell>
              <TableCell sx={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredBills
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((bill) => (
                <TableRow key={bill._id} sx={{ height: "38px" }}>
                  <TableCell sx={{ fontSize: "13px" }}>
                    {bill.customerName || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    {bill.customerMobile || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    ₹{bill.totalAmount}
                  </TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    {new Date(bill.createdAt).toLocaleString()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => navigate(`/admin/invoice/${bill._id}`)}
                    >
                      <PrintIcon sx={{ fontSize: 17 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteBill(bill._id)}
                    >
                      <DeleteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Pagination */}
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
