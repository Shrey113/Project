import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import "./EditInvoiceModal.css";

const EditInvoiceModal = ({
  invoice,
  onClose,
  user,
  formatDateTime,
  error,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // console.log("editinvoiceModal data", invoice);
  }, [invoice]);

  if (loading) {
    return <div className="modal">Loading invoice details...</div>;
  }

  if (error) {
    return (
      <div className="modal">
        <div className="error-message">{error}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  const formatAmount = (amount) => parseFloat(amount).toFixed(2);

  const handleDownloadPDF = () => {
    const element = document.createElement("div");
    element.className = "pdf-container";

    element.innerHTML = `
      <div class="invoice-page" style="
        width: 210mm;
        height: 297mm;
        padding: 20mm;
        margin: 0;
        background: white;
        position: relative;
        box-sizing: border-box;
        page-break-after: always;
      ">
        <!-- Header Section - 15% of height -->
        <div style="
          height: 12%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        ">
          ${
            invoice.invoice_logo
              ? `
            <div style="
              width: 150px;
              height: 80px;
              overflow: hidden;
            ">
              <img src="${invoice.invoice_logo}" style="
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              "/>
            </div>
          `
              : `
            <div style="width: 150px; height: 80px;"></div>
          `
          }
          <div style="
            text-align: right;
            font-size: 24px;
            font-weight: bold;
          ">
            INVOICE<br/>
            <span style="font-size: 14px;">Invoice No: ${
              invoice.invoice_id
            }</span><br/>
            <span style="font-size: 14px;">Date: ${
              formatDateTime(invoice.date).date
            }</span>
          </div>
        </div>
  
        <!-- Address Section - 18% of height -->
        <div style="
          height: 18%;
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
        ">
          <div style="width: 45%;">
            <h3 style="margin-bottom: 8px; color: #555;">From:</h3>
            <p style="margin: 0; font-size: 14px;">${user.user_name}</p>
            <p style="margin: 0; font-size: 14px;">${user.business_address}</p>
            <p style="margin: 0; font-size: 14px;">${user.user_email}</p>
            <p style="margin: 0; font-size: 14px;">GST No: ${
              user.gst_number
            }</p>
          </div>
          <div style="width: 45%; text-align: right;">
            <h3 style="margin-bottom: 8px; color: #555;">Bill To:</h3>
            <p style="margin: 0; font-size: 14px;">${invoice.invoice_to}</p>
            <p style="margin: 0; font-size: 14px;">${
              invoice.invoice_items[0]?.invoice_to_address ||
              "Address not available"
            }</p>
            <p style="margin: 0; font-size: 14px;">${
              invoice.invoice_items[0]?.invoice_to_email ||
              "Email not available"
            }</p>
          </div>
        </div>
  
        <!-- Items Table Section - 50% of height -->
        <div style="height: 50%;">
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 40px;
          ">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: center; width: 10%;">Sr. No.</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; width: 40%;">Item</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 15%;">Quantity</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 15%;">Price</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 20%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items
                .map(
                  (item, index) => `
                <tr class="${
                  index > 0 && index % 10 === 0 ? "page-break" : ""
                }">
                  <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${
                    index + 1
                  }</td>
                  <td style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">${
                    item.item
                  }</td>
                  <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${
                    item.quantity
                  }</td>
                  <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${
                    item.price
                  }</td>
                  <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${formatAmount(
                    item.quantity * item.price
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
  
          <!-- Summary Section - Immediately after table -->
          <div style="
            margin-left: auto;
            width: 300px;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            ">
              <span>Subtotal:</span>
              <span>₹${formatAmount(invoice.sub_total)}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            ">
              <span>GST (18%):</span>
              <span>₹${formatAmount(invoice.gst)}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #dee2e6;
              font-size: 14px;
            ">
              <span>Total Amount:</span>
              <span>₹${formatAmount(invoice.total)}</span>
            </div>
          </div>
        </div>
  
        <!-- Footer Section -->
        <div style="
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          position: absolute;
          bottom: 20mm;
          left: 0;
          right: 0;
        ">
          <p style="margin: 0;">Thank you for your business!</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoice_id}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break",
      },
    };

    // Generate PDF
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Close the modal only if the click is outside the modal-content
        if (e.target.classList.contains("modal-overlay")) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Invoice #{invoice.invoice_id}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="preview_and_invoice_details_wrapper">
          <div className="preview_image">
            <img src={invoice.invoice_logo} alt="" />
          </div>
          <div className="invoice-details">
            <div className="detail-item">
              <span className="label">Invoice To</span>
              <span className="value">{invoice.invoice_to}</span>
            </div>
            <div className="detail-item">
              <span className="label">Recipient Address</span>
              <span className="value">
                {invoice.invoice_items[0].invoice_to_address}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Recipient Email</span>
              <span className="value">
                {invoice.invoice_items[0].invoice_to_email}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Date</span>
              <span className="value">{formatDateTime(invoice.date).date}</span>
            </div>
            <div className="detail-item">
              <span className="label">Subtotal</span>
              <span className="value">₹{formatAmount(invoice.sub_total)}</span>
            </div>
            <div className="detail-item">
              <span className="label">GST</span>
              <span className="value">₹{formatAmount(invoice.gst)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total</span>
              <span className="value">₹{formatAmount(invoice.total)}</span>
            </div>
          </div>
        </div>
        <div className="table-container">
          <h2 className="invoice_list_heading" style={{ margin: "0px" }}>
            Invoice Items
          </h2>
          {/* <div className="table-responsive"> */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items &&
                invoice.invoice_items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.item}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{formatAmount(item.quantity * item.price)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {/* </div> */}
        </div>
        <div className="modal-footer">
          <button className="print-button">Print Invoice</button>
          <button className="download-button" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;

// useEffect(() => {
//   const fetchInvoiceDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${Server_url}/invoice-items`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           invoice_id: invoice.invoice_id,
//           user_email: invoice.user_email,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch invoice details");
//       }

//       const data = await response.json();
//       setInvoiceData(data);
//     } catch (error) {
//       console.error("Error fetching invoice details:", error);
//       setError("Failed to load invoice details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchInvoiceDetails();
// }, [invoice.invoice_id, invoice.user_email]);

// useEffect(() => {
//   if (invoiceData) {
//     if (Array.isArray(invoiceData) && invoiceData.length > 0) {
//       console.log(
//         "Address:",
//         invoiceData[0].invoice_to_address,
//         "Email:",
//         invoiceData[0].invoice_to_email
//       );
//     } else {
//       console.log("No invoice data available.");
//     }
//   }
// }, [invoiceData]);
