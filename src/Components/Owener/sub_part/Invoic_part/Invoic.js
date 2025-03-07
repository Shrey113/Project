import React, { useState, useEffect } from "react";
import "./Invoice.css";
// import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../redux/AllData";
import EditInvoiceModal from "./Sub_component/EditInvoiceModal";
import { VscOpenPreview } from "react-icons/vsc";
import { IoInformation } from "react-icons/io5";

const InvoiceForm = () => {
  const user = useSelector((state) => state.user);

  // const [activeTable, setActiveTable] = useState("firstTable");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle Change

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const checkEmail = async (user_email) => {
    try {
      setLoading(true);
      await fetch(`${Server_url}/check_email_owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user_email }),
      });
      // const data = await response.json();
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to load invoices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkEmail(user.user_email);
      try {
        setLoading(true);
        const response = await fetch(`${Server_url}/invoices/without-draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_email: user.user_email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        const without_draft = Array.isArray(data.without_draft)
          ? [...data.without_draft].sort((a, b) => a.invoice_id - b.invoice_id)
          : [];

        setInvoices(without_draft);
      } catch (error) {
        console.error("Error fetching invoices without draft:", error);
        setError("Failed to load invoices. Please try again later.");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user.user_email]);

  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const formattedDate = new Intl.DateTimeFormat("en-IN", options).format(
      date
    );

    // Return the full date in the format '7 Jan 2025'
    return {
      date: formattedDate, // Full date format like '7 Jan 2025'
      time: date.toLocaleTimeString(), // Extracts the time part as '14:30:00 PM'
    };
  }

  const formatAmount = (amount) => parseFloat(amount).toFixed(2);

  const generatePDFPreview = (invoice) => {
    const element = document.createElement("div");
    element.className = "pdf-container";
    const previewWindow = window.open(
      "",
      "_blank",
      "width=800,height=900,menubar=no,toolbar=no,location=no,status=no"
    );

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
              padding: 30px;
              max-width: 210mm;
              margin: 0 auto;
            }
            @media print {
              .no-print { display: none; }
              body { background: white; }
              .preview-container { padding: 0; }
            }
            .terms-section {
              margin-top: 30px;
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #dee2e6;
              border-radius: 4px;
            }
            .signature-section {
              margin-top: 40px;
              text-align: right;
              padding-right: 20px;
            }
            .signature-image {
              max-width: 150px;
              max-height: 80px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <!-- Control buttons -->
            <div class="no-print" style="
              position: fixed;
              top: 20px;
              right: 20px;
              display: flex;
              gap: 15px;
              z-index: 1000;
            ">
              <!-- ... buttons remain same ... -->
            </div>
    
            <!-- Invoice Container -->
            <div class="invoice-page" style="
              padding: 50px;
              font-family: Arial, sans-serif;
              position: relative;
              background: white;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            ">
              <!-- Header Section with more space -->
              <div class="header" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 50px;
                align-items: flex-start;
              ">
                ${invoice.invoice_logo
        ? `<div class="logo" style="width: 150px; height: 80px;">
                      <img src="${invoice.invoice_logo}" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>
                     </div>`
        : '<div style="width: 150px; height: 80px;"></div>'
      }
                <div style="
                  height: 100px;
                  font-size: 26px;
                  font-weight: bold;
                  text-align: right;
                ">
                  INVOICE<br/>
                  <span style="font-size: 16px; display: block; margin-top: 10px;">Invoice No: ${invoice.invoice_id
      }</span>
                  <span style="font-size: 15px; font-weight: 300; display: block; margin-top: 5px;">Date: ${formatDateTime(invoice.date).date
      }</span>
                </div>
              </div>
    
              <!-- Address Section with increased spacing -->
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 50px;
                gap: 40px;
              ">
                <div style="flex: 1;">
                  <h3 style="margin-bottom: 20px; color: #333;">From:</h3>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${user.user_name
      }</p>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${user.business_address
      }</p>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${user.user_email
      }</p>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">GST No: ${user.gst_number
      }</p>
                </div>
                <div style="flex: 1; text-align: right;">
                  <h3 style="margin-bottom: 20px; color: #333;">Bill To:</h3>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${invoice.invoice_to
      }</p>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${invoice.invoice_items[0]?.invoice_to_address ||
      "Address not available"
      }</p>
                  <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">${invoice.invoice_items[0]?.invoice_to_email ||
      "Email not available"
      }</p>
                </div>
              </div>
    
              <!-- Items Table with improved spacing -->
              <table style="
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
              ">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; border: 1px solid #dee2e6; text-align: center;">Sr. No.</th>
                    <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Item</th>
                    <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Quantity</th>
                    <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Price</th>
                    <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.invoice_items
        ? invoice.invoice_items
          .map(
            (item, index) => `
                      <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: center;">${index + 1
              }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">${item.item
              }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">${item.quantity
              }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${item.price
              }</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${formatAmount(
                item.quantity * item.price
              )}</td>
                      </tr>
                    `
          )
          .join("")
        : ""
      }
                </tbody>
              </table>
    
              <!-- Summary Section with better spacing -->
              <div style="
                margin-left: auto;
                width: 350px;
                margin-bottom: 40px;
              ">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 12px;
                  padding: 8px 0;
                ">
                  <span>Subtotal:</span>
                  <span>₹${invoice.sub_total}</span>
                </div>
                <div style="
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 12px;
                  padding: 8px 0;
                ">
                  <span>GST (18%):</span>
                  <span>₹${formatAmount(invoice.gst)}</span>
                </div>
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
                  border-top: 2px solid #dee2e6;
                  padding-top: 12px;
                  margin-top: 12px;
                ">
                  <span>Total:</span>
                  <span>₹${formatAmount(invoice.total)}</span>
                </div>
              </div>
    
              <!-- Terms and Conditions Section -->
              <div class="terms-section">
                <h3 style="margin-bottom: 15px; color: #333;">Terms & Conditions:</h3>
                <div style="font-size: 14px; line-height: 1.6;">
                  ${invoice.terms_conditions || "No terms specified"}
                </div>
              </div>

              <!-- Signature Section -->
              <div class="signature-section">
                ${invoice.signature_image 
                  ? `<img src="${invoice.signature_image}" alt="Signature" class="signature-image" />`
                  : '<div style="width: 150px; border-top: 1px solid #000; margin-left: auto;"></div>'
                }
                <div style="font-size: 14px; margin-top: 10px;">Authorized Signature</div>
              </div>

              <!-- Footer with more space -->
              <div style="
                text-align: center;
                margin-top: 60px;
                color: #6c757d;
                font-size: 14px;
                padding-bottom: 30px;
              ">
                <p>Thank you for your business!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    previewWindow.document.write(element.innerHTML);
    previewWindow.document.close();
  };

  return (
    <div className="invoice_and_table_container">
      {/* <h2>Invoice List</h2> */}
      <div className="invoice_list">
        {loading ? (
          <p>Loading invoices...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <>
            <table className="invoice_table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Invoice ID</th>
                  <th>User Email</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Invoice To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No Invoices Generated yet. Please Create an Invoice.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, index) => (
                    <tr
                      key={index}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{index + 1}</td>
                      <td>{inv.invoice_id}</td>
                      <td style={{ minWidth: "200px" }}>{inv.user_email}</td>
                      <td>{formatDateTime(inv.date).date}</td>
                      <td>{formatAmount(inv.sub_total)}</td>
                      <td>{formatAmount(inv.gst)}</td>
                      <td>{formatAmount(inv.total)}</td>
                      <td>{inv.invoice_to}</td>
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => handleRowClick(inv)}
                        >
                          <IoInformation style={{ fontSize: "20px" }} />
                        </button>
                        <button
                          onClick={() => {
                            generatePDFPreview(inv);
                          }}
                        >
                          <VscOpenPreview style={{ fontSize: "20px" }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </>
        )}
      </div>
      {isEditModalOpen && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
};
export default InvoiceForm;
