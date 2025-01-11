import { React, useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./DraftInvoices.css";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../../redux/AllData";

function DraftInvoices({ draftInvoices, fetchDraftInvoices, draftCount }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const user = useSelector((state) => state.user);
  useEffect(() => {
    fetchDraftInvoices();
  }, []);
  // const handleDelete = async (invoiceId) => {
  //   const isConfirmed = window.confirm(
  //     "Are you sure you want to delete this invoice?"
  //   );
  //   if (!isConfirmed) return;

  //   try {
  //     const response = await fetch(`/api/delete-invoice/${invoiceId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to delete invoice");
  //     }

  //     alert("Invoice deleted successfully.");
  //     fetchDraftInvoices(); // Refresh the draft invoices
  //   } catch (error) {
  //     console.error("Error deleting invoice:", error);
  //     alert("Failed to delete invoice. Please try again.");
  //   }
  //   setDeleteInvoice(false);
  // };

  const openDeleteModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedInvoiceId(null);
  };
  const handleDelete = async () => {
    try {
      const response = await fetch(`${Server_url}/api/delete-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId,
          user_email: user.user_email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchDraftInvoices();
      } else {
        throw new Error(result.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

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
  return (
    <div className="draft-invoices-container">
      {draftCount === 0 ? (
        <p className="no-drafts-message">No Draft Invoices Available</p>
      ) : (
        <div className="drafts-grid">
          {draftInvoices.map((invoice) => (
            <div className="draft-card" key={invoice.invoice_id}>
              <div className="draft-header">
                <h3>Invoice #{invoice.invoice_id}</h3>
                <div className="action-buttons">
                  <button className="edit-btn">
                    <FaEdit />
                  </button>
                  <button className="delete-btn">
                    <FaTrash
                      onClick={() => openDeleteModal(invoice.invoice_id)}
                    />
                  </button>
                </div>
              </div>

              <div className="draft-content">
                <div className="info-row">
                  <span className="label">To:</span>
                  <span className="value">{invoice.invoice_to}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{invoice.user_email}</span>
                </div>
                <div className="info-row">
                  <span className="label"> Date:</span>
                  <span className="value">
                    {formatDateTime(invoice.date).date}
                  </span>
                </div>
              </div>

              <div className="draft-footer">
                <div className="amount-info">
                  <div className="subtotal">
                    <span className="label"> Subtotal:</span>
                    <span className="value">₹ {invoice.sub_total}</span>
                  </div>
                  <div className="total">
                    <span className="label"> Total:</span>
                    <span className="value">₹ {invoice.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="delete-modal">
          <div className="delete-content">
            <h3>
              Are you sure you want to delete invoice with ID :{" "}
              {selectedInvoiceId}?
            </h3>
            <div className="delte-actions">
              <button className="confirm-btn" onClick={handleDelete}>
                Yes
              </button>
              <button className="cancel-btn" onClick={closeDeleteModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DraftInvoices;
