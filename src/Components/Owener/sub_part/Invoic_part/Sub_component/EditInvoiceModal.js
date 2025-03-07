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
  }, [invoice]);

  if (loading) {
    return <div className="modal loading">Loading invoice details...</div>;
  }

  if (error) {
    return (
      <div className="modal error-message">
        <div>{error}</div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    );
  }

  const generatePDFPreview = () => {
    const element = document.createElement("div");
    element.className = "pdf-container";
  
    element.innerHTML = `
      <html>
        <head>
          <title>Invoice Preview</title>
          <style>
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .preview-container { 
              padding: 0;
              width: 210mm;
              margin: 0 auto;
              background: white;
            }
            @media print {
              .no-print { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <div class="invoice-page" style="
              padding: 20px;
              font-family: Arial, sans-serif;
              position: relative;
              background: white;
              width: calc(210mm - 40px);
              min-height: calc(297mm - 40px);
              margin: 0 auto;
            ">
              <!-- Header Section -->
              <div class="header" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                align-items: flex-start;
              ">
                ${invoice.invoice_logo 
                  ? `<div class="logo" style="width: 100px; height: 50px;">
                      <img src="${invoice.invoice_logo}" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>
                     </div>`
                  : '<div style="width: 100px; height: 50px;"></div>'
                }
                <div style="
                  text-align: right;
                ">
                  <div style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">INVOICE</div>
                  <div style="font-size: 12px; color: #666;">Invoice No: ${invoice.invoice_id}</div>
                  <div style="font-size: 12px; color: #666;">Date: ${formatDateTime(invoice.date).date}</div>
                </div>
              </div>
  
              <!-- Address Section -->
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                gap: 15px;
              ">
                <div style="flex: 1;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">From:</div>
                  <div style="font-size: 12px; line-height: 1.4; color: #666;">
                    <div>${user.user_name}</div>
                    <div>${user.business_address}</div>
                    <div>${user.user_email}</div>
                    <div>GST No: ${user.gst_number}</div>
                  </div>
                </div>
                <div style="flex: 1; text-align: right;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">Bill To:</div>
                  <div style="font-size: 12px; line-height: 1.4; color: #666;">
                    <div>${invoice.invoice_to}</div>
                    <div>${invoice.invoice_items?.[0]?.invoice_to_address || "Address not available"}</div>
                    <div>${invoice.invoice_items?.[0]?.invoice_to_email || "Email not available"}</div>
                  </div>
                </div>
              </div>
  
              <!-- Items Table -->
              <table style="
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                font-size: 12px;
              ">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: center; width: 50px;">Sr. No.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Item</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 70px;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 90px;">Price</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 100px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.invoice_items && invoice.invoice_items.length > 0
                    ? invoice.invoice_items.map((item, index) => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">${item.item}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${item.quantity}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${item.price}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${item.quantity * item.price}</td>
                      </tr>
                    `).join("")
                    : `<tr><td colspan="5" style="text-align: center; padding: 12px;">No items available</td></tr>`
                  }
                </tbody>
              </table>
  
              <!-- Summary Section -->
              <div style="
                margin-left: auto;
                width: 250px;
                margin-bottom: 25px;
                font-size: 12px;
              ">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  padding: 4px 0;
                  color: #666;
                ">
                  <span>Subtotal:</span>
                  <span>₹${invoice.sub_total}</span>
                </div>
                <div style="
                  display: flex;
                  justify-content: space-between;
                  padding: 4px 0;
                  color: #666;
                ">
                  <span>GST (18%):</span>
                  <span>₹${invoice.gst}</span>
                </div>
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
                  border-top: 2px solid #dee2e6;
                  margin-top: 4px;
                  padding-top: 4px;
                ">
                  <span>Total:</span>
                  <span>₹${invoice.total}</span>
                </div>
              </div>
  
              <!-- Terms and Conditions -->
              <div style="
                margin-top: 15px;
                margin-bottom: 15px;
                padding: 12px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                font-size: 12px;
              ">
                <div style="font-weight: bold; margin-bottom: 6px; color: #333;">Terms & Conditions:</div>
                <div style="line-height: 1.4; color: #666;">
                  ${invoice.terms_conditions || "No terms specified"}
                </div>
              </div>
  
              <!-- Signature Section -->
              <div style="
                margin-top: 25px;
                text-align: right;
                padding-right: 12px;
              ">
                ${invoice.signature_image 
                  ? `<img src="${invoice.signature_image}" alt="Signature" style="
                      max-width: 100px;
                      max-height: 50px;
                      margin-bottom: 4px;
                    "/>`
                  : '<div style="width: 100px; border-top: 1px solid #000; margin-left: auto;"></div>'
                }
                <div style="font-size: 12px; color: #666; margin-top: 4px;">Authorized Signature</div>
              </div>
  
              <!-- Footer -->
              <div style="
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 12px;
              ">
                <p style="margin: 0;">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  
    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoice_id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait"
      }
    };
  
    html2pdf().from(element).set(opt).save();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Print</title>
          <style>
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              background: white;
            }
            .preview-container { 
              padding: 0;
              width: 210mm;
              margin: 0 auto;
              background: white;
            }
            @media print {
              .no-print { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <div class="invoice-page" style="
              padding: 20px;
              font-family: Arial, sans-serif;
              position: relative;
              background: white;
              width: calc(210mm - 40px);
              min-height: calc(297mm - 40px);
              margin: 0 auto;
            ">
              <div class="header" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                align-items: flex-start;
              ">
                ${invoice.invoice_logo 
                  ? `<div class="logo" style="width: 100px; height: 50px;">
                      <img src="${invoice.invoice_logo}" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>
                     </div>`
                  : '<div style="width: 100px; height: 50px;"></div>'
                }
                <div style="text-align: right;">
                  <div style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">INVOICE</div>
                  <div style="font-size: 12px; color: #666;">Invoice No: ${invoice.invoice_id}</div>
                  <div style="font-size: 12px; color: #666;">Date: ${formatDateTime(invoice.date).date}</div>
                </div>
              </div>
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                gap: 15px;
              ">
                <div style="flex: 1;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">From:</div>
                  <div style="font-size: 12px; line-height: 1.4; color: #666;">
                    <div>${user.user_name}</div>
                    <div>${user.business_address}</div>
                    <div>${user.user_email}</div>
                    <div>GST No: ${user.gst_number}</div>
                  </div>
                </div>
                <div style="flex: 1; text-align: right;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">Bill To:</div>
                  <div style="font-size: 12px; line-height: 1.4; color: #666;">
                    <div>${invoice.invoice_to}</div>
                    <div>${invoice.invoice_items?.[0]?.invoice_to_address || "Address not available"}</div>
                    <div>${invoice.invoice_items?.[0]?.invoice_to_email || "Email not available"}</div>
                  </div>
                </div>
              </div>
              <table style="
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                font-size: 12px;
              ">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: center; width: 50px;">Sr. No.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Item</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 70px;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 90px;">Price</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; width: 100px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.invoice_items && invoice.invoice_items.length > 0
                    ? invoice.invoice_items.map((item, index) => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">${item.item}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${item.quantity}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${item.price}</td>
                        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">₹${item.quantity * item.price}</td>
                      </tr>
                    `).join("")
                    : `<tr><td colspan="5" style="text-align: center; padding: 12px;">No items available</td></tr>`
                  }
                </tbody>
              </table>
              <div style="
                margin-left: auto;
                width: 250px;
                margin-bottom: 25px;
                font-size: 12px;
              ">
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #666;">
                  <span>Subtotal:</span>
                  <span>₹${invoice.sub_total}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #666;">
                  <span>GST (18%):</span>
                  <span>₹${invoice.gst}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 2px solid #dee2e6; margin-top: 4px; padding-top: 4px;">
                  <span>Total:</span>
                  <span>₹${invoice.total}</span>
                </div>
              </div>
              <div style="margin-top: 15px; margin-bottom: 15px; padding: 12px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 12px;">
                <div style="font-weight: bold; margin-bottom: 6px; color: #333;">Terms & Conditions:</div>
                <div style="line-height: 1.4; color: #666;">
                  ${invoice.terms_conditions || "No terms specified"}
                </div>
              </div>
              <div style="margin-top: 25px; text-align: right; padding-right: 12px;">
                ${invoice.signature_image 
                  ? `<img src="${invoice.signature_image}" alt="Signature" style="max-width: 100px; max-height: 50px; margin-bottom: 4px;"/>`
                  : '<div style="width: 100px; border-top: 1px solid #000; margin-left: auto;"></div>'
                }
                <div style="font-size: 12px; color: #666; margin-top: 4px;">Authorized Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  

  return (
    <div className="modal-overlay-for-edit-invoice" onClick={(e) => {
      if (e.target.classList.contains("modal-overlay-for-edit-invoice")) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Invoice #{invoice.invoice_id}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="invoice-container">
          <div className="invoice-top">
            <div className="logo-section">
              {invoice.invoice_logo && (
                <img src={invoice.invoice_logo} alt="Invoice Logo" className="invoice-logo" />
              )}
            </div>
            <div className="invoice-info">
              <div className="info-item">
                <span className="label">Invoice To:</span>
                <span className="value">{invoice.invoice_to}</span>
              </div>
              <div className="info-item">
                <span className="label">Recipient Address:</span>
                <span className="value">
                  {invoice.invoice_items?.[0]?.invoice_to_address || "Address not available"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Recipient Email:</span>
                <span className="value">
                  {invoice.invoice_items?.[0]?.invoice_to_email || "Email not available"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Date:</span>
                <span className="value">{formatDateTime(invoice.date).date}</span>
              </div>
              <div className="info-item">
                <span className="label">Subtotal:</span>
                <span className="value">₹{invoice.sub_total}</span>
              </div>
              <div className="info-item">
                <span className="label">GST:</span>
                <span className="value">₹{invoice.gst}</span>
              </div>
              <div className="info-item total">
                <span className="label">Total:</span>
                <span className="value">₹{invoice.total}</span>
              </div>
            </div>
          </div>

          <div className="invoice-items-section">
            <h3>Invoice Items</h3>
            <div className="table-container">
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
                  {invoice.invoice_items && invoice.invoice_items.length > 0 ? (
                    invoice.invoice_items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.item}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.quantity * item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-items">No items available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="invoice-footer-section">
            <div className="terms-section">
              <h3>Terms & Conditions</h3>
              <div className="terms-content">
                {invoice.terms_conditions || "No terms specified"}
              </div>
            </div>
            <div className="signature-section">
              <h3>Signature</h3>
              <div className="signature-container">
                {invoice.signature_image ? (
                  <img src={invoice.signature_image} alt="Signature" className="signature-image" />
                ) : (
                  <div className="no-signature">No signature available</div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="print-button" onClick={handlePrint}>
              Print Invoice
            </button>
            <button className="download-button" onClick={generatePDFPreview}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
