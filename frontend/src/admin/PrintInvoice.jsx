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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";

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

/* ================= SINGLE INVOICE COPY ================= */

const InvoiceLayout = ({ bill }) => {

  const paidAmount = bill.paidAmount || 0;
  const pendingAmount = bill.pendingAmount ?? bill.totalAmount;

  const totalQuantity = bill.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const itemCount = bill.items.length;

  const tableFontSize =
    itemCount <= 10 ? 16 :
    itemCount <= 15 ? 14 :
    12;

  const tablePadding =
    itemCount <= 10 ? "6px" :
    itemCount <= 15 ? "4px" :
    "3px";

  return (

    <Box
      sx={{
        width: "210mm",
        minHeight: "294mm",
        margin: "0 auto",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        paddingBottom: "8mm",
      }}
    >

      <Typography align="center" sx={{ fontSize: 20, fontWeight: 900, mt: 1 }}>
        Bill Invoice
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

        <img src="/logo-invoice.JPG" alt="logo" style={{ width: 126 }} />

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
            <b>Invoice No:</b> {bill.invoiceNumber ?? "N/A"}
          </Typography>

          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            <b>Date:</b> {new Date(bill.createdAt).toLocaleDateString("en-IN")}
          </Typography>

          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            <b>Time:</b> {new Date(bill.createdAt).toLocaleTimeString("en-IN")}
          </Typography>
        </Box>

      </Box>

      <Paper sx={{ mt: 3, mx: 2 }}>

        <Table
          sx={{
            "& th, & td": {
              border: "1px solid #000",
              fontSize: `${tableFontSize}px`,
              padding: tablePadding,
            },
          }}
        >

          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Rate (₹)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

            {bill.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{item.productId?.title}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.price}</TableCell>
                <TableCell align="right">{item.price * item.quantity}</TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {totalQuantity}
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                ₹{bill.totalAmount}
              </TableCell>
            </TableRow>

          </TableBody>

        </Table>

      </Paper>

      <Box sx={{ mt: 3, px: 2 }}>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>

          <Box>
            <Typography>Payment Status: {bill.paymentStatus}</Typography>
            <Typography>Paid: ₹{paidAmount}</Typography>
            <Typography>Pending: ₹{pendingAmount}</Typography>
          </Box>

          <Box sx={{ maxWidth: "55%" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              Total Amount: ₹{bill.totalAmount}
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 14 }}>
              Amount in Words:
            </Typography>

            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
              {numberToWords(bill.totalAmount)} Rupees Only
            </Typography>
          </Box>

        </Box>

      </Box>

      <Box sx={{ mt: 8, px: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 600 }}>Receiver Signature</Typography>
        <Typography sx={{ fontWeight: 600 }}>Authorized Signatory</Typography>
      </Box>

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

  return (
    <>

      <style>
        {`
          @media print {

            @page {
              size: A4;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
            }

            body * {
              visibility: hidden;
            }

            .print-area,
            .print-area * {
              visibility: visible;
            }

            .print-area {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
            }

            .invoice-page {
              page-break-after: always;
            }

            .invoice-page:last-child {
              page-break-after: auto;
            }

            .no-print {
              display: none !important;
            }

          }
        `}
      </style>

      <Box ref={invoiceRef} className="print-area">

        <div className="invoice-page">
          <InvoiceLayout bill={bill} />
        </div>

        <div className="invoice-page">
          <InvoiceLayout bill={bill} />
        </div>

      </Box>

      <Box className="no-print" sx={{ mt: 3, textAlign: "center", display: "flex", justifyContent: "center", gap: 2 }}>

        <Button
  variant="outlined"
  startIcon={<PictureAsPdfIcon />}
  onClick={handleSavePDF}
>
  Save as PDF
</Button>

<Button
  variant="contained"
  startIcon={<PrintIcon />}
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