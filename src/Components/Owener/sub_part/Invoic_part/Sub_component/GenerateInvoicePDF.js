// generatePdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable

const generateInvoiceContent = (doc, invoice, user, invoiceData) => {
  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("INVOICE", 14, 30);

  // Company details section
  doc.setFontSize(12);
  doc.text("From:", 14, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`${user.user_name}`, 14, 55);
  doc.text(`${user.business_address}`, 14, 65);
  doc.text(`${user.user_email}`, 14, 75);
  doc.text(`GST No: ${user.gst_number}`, 14, 85);

  // Bill to section - Including the recipient's address and email
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`${invoice.invoice_to}`, 120, 55);

  console.log("invoiceData", invoiceData);
  // Check if invoiceData exists and is an array
  if (Array.isArray(invoiceData) && invoiceData.length > 0) {
    doc.text(`${invoiceData[0].invoice_to_address || ""}`, 120, 65);
    doc.text(`${invoiceData[0].invoice_to_email || ""}`, 120, 75);
  } else {
    doc.text("Address not available", 120, 65);
    doc.text("Email not available", 120, 75);
  }

  // Invoice details
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice No: ${invoice.invoice_id}`, 120, 85);

  const formattedDate = new Date(invoice.date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  doc.text(`Date: ${formattedDate}`, 120, 95);

  // Check if invoice.items is defined and is an array before calling map
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  // Items table
  autoTable(doc, {
    startY: 110,
    head: [["Item", "Quantity", "Price", "Amount"]],
    body: items.map((item) => [
      items.item,
      items.quantity,
      `₹${items.price.toFixed(2)}`,
      `₹${items.amount.toFixed(2)}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 2 },
  });

  // Ensure invoice.sub_total, invoice.gst, and invoice.total are valid numbers
  const subTotal = parseFloat(invoice.sub_total) || 0;
  const gst = parseFloat(invoice.gst) || 0;
  const total = parseFloat(invoice.total) || 0;

  // Summary section
  const finalY = doc.autoTable.previous.finalY + 10;
  doc.setFontSize(10);

  // Right-aligned summary
  const rightColumn = 190;
  doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, rightColumn, finalY, {
    align: "right",
  });
  doc.text(`GST (18%): ₹${gst.toFixed(2)}`, rightColumn, finalY + 10, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.text(`Total: ₹${total.toFixed(2)}`, rightColumn, finalY + 20, {
    align: "right",
  });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 14, finalY + 40);
};

const generateInvoicePDF = (invoice, user) => {
  const doc = new jsPDF();

  generateInvoiceContent(doc, invoice, user); // Call the content generation function

  // Save PDF
  doc.save(`Invoice_${invoice.invoice_id}.pdf`);
};

export default generateInvoicePDF;
