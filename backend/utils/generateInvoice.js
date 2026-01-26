const PDFDocument = require("pdfkit");

const generateInvoice = (bill, res) => {
  const doc = new PDFDocument({ margin: 40 });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${bill._id}.pdf`);

  doc.pipe(res);

  doc.fontSize(22).text("CAMPA COLA ENTERPRISE", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice No: ${bill._id}`);
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.text(`Customer Name: ${bill.customerId.name}`);
  doc.text(`Phone: ${bill.customerId.phone}`);
  doc.moveDown();

  doc.text("--------------------------------------------------");
  doc.text("Items");
  doc.text("--------------------------------------------------");

  bill.items.forEach((item) => {
    doc.text(
      `${item.productId.title} x ${item.quantity} - ₹${item.price * item.quantity}`
    );
  });

  doc.text("--------------------------------------------------");
  doc.fontSize(14).text(`Total Amount: ₹${bill.totalAmount}`, { align: "right" });
  doc.text("--------------------------------------------------");

  doc.moveDown();
  doc.text("Thank you for shopping!", { align: "center" });

  doc.end();
};

module.exports = generateInvoice;
