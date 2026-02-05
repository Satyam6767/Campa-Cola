import { useEffect, useState, useContext, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

/* ================= HELPERS ================= */
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/* ================= NUMBER TO WORDS (INDIAN) ================= */
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertBelowThousand = (n) => {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) str += ones[n] + " ";
    return str.trim();
  };

  let result = "";
  if (num >= 100000) {
    result += convertBelowThousand(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertBelowThousand(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) result += convertBelowThousand(num);

  return result.trim();
};

/* ================= SINGLE PAGE INVOICE ================= */
const InvoiceLayout = ({ bill, items, isLastPage }) => {
  const paidAmount = bill.paidAmount || 0;
  const pendingAmount = bill.pendingAmount ?? bill.totalAmount;

  const totalQuantity = bill.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <Box
      sx={{
        width: "210mm",
        minHeight: "294mm",
        margin: "0 auto",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        paddingBottom: "10mm",
      }}
    >
      <Typography align="center" sx={{ fontSize: 20, fontWeight: 900, mt: 1 }}>
        Tax Invoice
      </Typography>

      <Box sx={{ px: 2, mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
            Janki Enterprises
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            Station Road, Near Pani Tanki
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            843320 Bihar
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            Phone: 8210038214
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            Email: Jankienterprises252522@gmail.com
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            GSTIN: 10FFUPK9289B1Z2
          </Typography>
        </Box>

        <img src="/logo-invoice.JPG" alt="logo" style={{ width: 130 }} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ px: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          {bill.customerName && (
            <Typography sx={{ fontSize: 20.5, fontWeight: 600 }}>
              <b>Customer:</b> {bill.customerName}
            </Typography>
          )}
          {bill.customerMobile && (
            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
              <b>Mobile:</b> {bill.customerMobile}
            </Typography>
          )}
          {bill.customerAddress && (
            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
              <b>Address:</b> {bill.customerAddress}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            <b>Invoice No:</b> {bill.invoiceNumber}
          </Typography>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            <b>Date:</b>{" "}
            {new Date(bill.createdAt).toLocaleDateString("en-IN")}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mt: 3, mx: 2 }}>
        <Table
          sx={{
            "& th, & td": {
              border: "1px solid #000",
              padding: "4px 6px",
              fontSize: "14px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Item</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Rate (₹)</TableCell>
              <TableCell align="right">Amount (₹)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{item.productId?.title}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.price}</TableCell>
                <TableCell align="right">
                  {item.price * item.quantity}
                </TableCell>
              </TableRow>
            ))}

            {isLastPage && (
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                  TOTAL
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  {totalQuantity}
                </TableCell>
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  ₹{bill.totalAmount}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {isLastPage && (
        <>
          <Box sx={{ mt: 3, px: 2 }}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography>Payment Status: {bill.paymentStatus}</Typography>
                <Typography>Paid: ₹{paidAmount}</Typography>
                <Typography>Pending: ₹{pendingAmount}</Typography>
              </Box>

              <Box sx={{ maxWidth: "55%" }}>
                <Typography>Amount in Words:</Typography>
                <Typography>
                  {numberToWords(bill.totalAmount)} Rupees Only
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 8,
              px: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Receiver Signature</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              Authorized Signatory
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

/* ================= PRINT & PDF ================= */
const PrintInvoice = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    API.get(`/billing/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setBill(data))
      .catch(() => toast.error("Failed to load invoice!"));
  }, [id, token]);

  const handleSavePDF = () => {
    html2pdf()
      .set({
        filename: `Invoice_${bill.invoiceNumber}.pdf`,
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        html2canvas: { scale: 2, useCORS: true },
      })
      .from(invoiceRef.current)
      .save();
  };

  if (!bill) return null;

  const pages = chunkArray(bill.items, 10);

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            .invoice-page { page-break-after: always; }
            .invoice-page:last-child { page-break-after: auto; }
          }
        `}
      </style>

      <Box ref={invoiceRef} className="print-area">
        {pages.map((pageItems, index) => (
          <div key={index} className="invoice-page">
            <InvoiceLayout
              bill={bill}
              items={pageItems}
              isLastPage={index === pages.length - 1}
            />
          </div>
        ))}
      </Box>

      <Box className="no-print" sx={{ mt: 3, textAlign: "center" }}>
        <Button variant="outlined" onClick={handleSavePDF}>
          Save as PDF
        </Button>
        <Button
          variant="contained"
          onClick={() => window.print()}
          sx={{ ml: 2 }}
        >
          Print Invoice
        </Button>
      </Box>
    </>
  );
};

export default PrintInvoice;
