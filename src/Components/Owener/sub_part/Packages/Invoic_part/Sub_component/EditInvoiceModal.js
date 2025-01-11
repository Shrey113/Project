import React, { useState, useEffect } from "react";
import { Server_url } from "../../../../../redux/AllData";

import "./EditInvoiceModal.css";
import generateInvoicePDF from "./GenerateInvoicePDF";

const EditInvoiceModal = ({ invoice, onClose, user, formatDateTime }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${Server_url}/invoice-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: invoice.invoice_id,
            user_email: invoice.user_email,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoice details");
        }

        const data = await response.json();
        setInvoiceData(data);
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        setError("Failed to load invoice details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoice.invoice_id, invoice.user_email]);

  useEffect(() => {
    if (invoiceData) {
      // If invoiceData is an array, access the first item or iterate through it
      if (Array.isArray(invoiceData) && invoiceData.length > 0) {
        console.log(
          "Address:",
          invoiceData[0].invoice_to_address,
          "Email:",
          invoiceData[0].invoice_to_email
        );
      } else {
        console.log("No invoice data available.");
      }
    }
  }, [invoiceData]);

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

  const handleDownloadPDF = () => {
    if (
      !invoiceData ||
      !Array.isArray(invoiceData) ||
      invoiceData.length === 0
    ) {
      console.error("Invoice data is not available.");
      return;
    }
    generateInvoicePDF(invoice, user, invoiceData); // Pass the data to PDF generation
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
        <div className="invoice-details">
          <div className="detail-item">
            <span className="label">
              Invoice To <span>:</span>
            </span>
            <span className="value">{invoice.invoice_to}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              Recipient Address <span>:</span>
            </span>
            <span className="value">{invoiceData[0].invoice_to_address}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              Recipient Email <span>:</span>
            </span>
            <span className="value">{invoiceData[0].invoice_to_email}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              Date <span>:</span>
            </span>
            <span className="value">{formatDateTime(invoice.date).date}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              Subtotal <span>:</span>
            </span>
            <span className="value">₹{invoice.sub_total}</span>
            <span className="value">{user.invoice_to_address}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              GST <span>:</span>
            </span>
            <span className="value">₹{invoice.gst}</span>
          </div>
          <div className="detail-item">
            <span className="label">
              Total <span>:</span>
            </span>
            <span className="value">₹{invoice.total}</span>
          </div>
        </div>

        <div className="table-container">
          <h2>Invoice Items</h2>
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
              {invoiceData &&
                invoiceData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.item}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.quantity * item.price}</td>
                  </tr>
                ))}
            </tbody>
          </table>
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
