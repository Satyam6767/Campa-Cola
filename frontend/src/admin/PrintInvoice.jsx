import { useEffect, useState, useContext } from "react";
import { 
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper 
} from "@mui/material";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const PrintInvoice = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  const fetchBill = async () => {
    try {
      const { data } = await API.get(`/billing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBill(data);
    } catch (err) {
      toast.error("Failed to load invoice!");
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!bill) return <p>Loading...</p>;

  return (
    <Box sx={{ p: 4, width: "210mm", margin: "auto", backgroundColor: "#fff" }}>

      {/* PRINT CSS FIX */}
      <style>
        {`
          @media print {
            nav, aside, header, footer, .MuiDrawer-root, .MuiAppBar-root, .no-print {
              display: none !important;
            }

            body {
              background: #fff !important;
            }

            .invoice-container {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* PRINT HEADING BACKGROUND FIX */
            .table-header th {
              background-color: #2c2ebf !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: #fff !important;
              font-weight: bold !important;
            }

            /* ✅ FIX LINE MISSING IN PRINT */
            .print-line {
              background-color: #000 !important;
              height: 2px !important;
              width: 100% !important;
              display: block !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <Box className="invoice-container">

        <Typography variant="h5" textAlign="center" fontWeight="bold">
          Tax Invoice
        </Typography>

        {/* ADDRESS + LOGO */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight="bold">Janki Enterprises</Typography>
            <Typography>Station Road, Near Pani Tanki</Typography>
            <Typography>843320</Typography>
            <Typography>Phone: 8210038214</Typography>
            <Typography>Email: Jankienterprises252522@gmail.com</Typography>
            <Typography>GSTIN: 10FFUPK9289B1Z2</Typography>
            <Typography>State: 10-Bihar</Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <img 
              src="/logo-invoice.JPG"
              alt="Campa Cola"
              style={{ width: "140px", objectFit: "contain" }}
            />
          </Box>
        </Box>

        {/* HORIZONTAL LINE BELOW ADDRESS + LOGO */}
        <Box
          className="print-line"
          sx={{
            width: "100%",
            height: "2px",
            backgroundColor: "#000",
            mt: 2,
            mb: 2,
          }}
        />

        {/* CUSTOMER + INVOICE INFO */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography><b>Customer:</b> {bill.customerName}</Typography>
            <Typography><b>Mobile:</b> {bill.customerMobile}</Typography>
          </Box>

          <Box>
            <Typography><b>Invoice No:</b> {bill._id.slice(-6)}</Typography>
            <Typography><b>Date:</b> {new Date(bill.createdAt).toLocaleDateString()}</Typography>
          </Box>
        </Box>

        {/* ITEMS TABLE */}
        <Paper sx={{ mt: 3 }}>
          <Table>

            {/* TABLE HEADER - screen + print */}
            <TableHead
              className="table-header"
              sx={{
                backgroundColor: "#2c2ebf",
                "& th": {
                  fontWeight: "bold",
                  color: "#fff",
                  fontSize: "15px"
                }
              }}
            >
              <TableRow>
                <TableCell>Item Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit Price (₹)</TableCell>
                <TableCell>Amount (₹)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productId.title}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.price * item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </Paper>

        {/* TOTAL */}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Typography fontSize={18}>
            <b>Total Amount: ₹{bill.totalAmount}</b>
          </Typography>
        </Box>

        {/* SIGNATURE */}
        <Box sx={{ mt: 5, textAlign: "right" }}>
          <Typography>Authorized Signatory</Typography>
        </Box>

        {/* PRINT BUTTON */}
        <Box className="no-print" sx={{ mt: 4, textAlign: "center" }}>
          <Button variant="contained" onClick={handlePrint}>Print Invoice</Button>
        </Box>

      </Box>
    </Box>
  );
};

export default PrintInvoice;








