import { React, useEffect, useState } from "react";

import { FaEdit, FaTrash } from "react-icons/fa";
import "./DraftInvoices.css";
import { useSelector } from "react-redux";
import { Server_url, showRejectToast, showAcceptToast } from "../../../../../redux/AllData";
import DraftInvoiceLayout from "./DraftInvoiceLayout";
import { useCount } from "../../../../../redux/CountContext";
import draftIcon from "./../Images/draft Icon.png"

function DraftInvoices() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [draftInvoices, setDraftInvoices] = useState([]);
  const [draftCount, setDraftCount] = useState(0);
  const [DraftInvoiceChange, setDraftInvoiceChange] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
  const { decrementCount } = useCount();



  const user = useSelector((state) => state.user);

  const fetchInvoicesWithDraft = async (user_email) => {
    try {
      // setLoading(true);
      const response = await fetch(`${Server_url}/invoices/with-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user_email }),
      });
      const data = await response.json();
      const with_draft = Array.isArray(data.with_draft)
        ? [...data.with_draft].sort((a, b) => a.invoice_id - b.invoice_id)
        : [];
      setDraftInvoices(with_draft);
      setDraftCount(with_draft.length);
      // console.log("Fetched draft invoices:", with_draft);
    } catch (error) {
      console.error("Error fetching invoices with draft:", error);
      // setError("Failed to load invoices. Please try again later.");
      setDraftInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoicesWithDraft(user.user_email);
  }, [user.user_email]);

  const invoice_items_fetch = async (invoice_id, user_email) => {
    try {
      const response = await fetch(`${Server_url}/get-invoice-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice_id, user_email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoice items");
      }

      const data = await response.json();
      if (data.success && data.items && data.items.length > 0) {
        return data.items;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching invoice items:", error);

      return [];
    }
  };

  const handleEdit = async (invoice) => {
    try {
      const invoiceItems = await invoice_items_fetch(
        invoice.invoice_id,
        invoice.user_email
      );

      const invoiceToAddress =
        invoiceItems && invoiceItems.length > 0
          ? invoiceItems[0].invoice_to_address || ""
          : "";

      const invoiceToEmail =
        invoiceItems && invoiceItems.length > 0
          ? invoiceItems[0].invoice_to_email || ""
          : "";

      // Prepare the full invoice data
      const formattedInvoice = {
        ...invoice,
        invoice_to: invoice.invoice_to || "",
        invoice_to_address: invoiceToAddress,
        invoice_to_email: invoiceToEmail,
        invoice_id: Number(invoice.invoice_id),
        sub_total: Number(invoice.sub_total) || 0,
        gst: Number(invoice.gst) || 0,
        total: Number(invoice.total) || 0,
        items:
          Array.isArray(invoiceItems) && invoiceItems.length > 0
            ? invoiceItems.map((item) => ({
              item: item.item || "",
              quantity: Number(item.quantity) || 0,
              price: Number(item.price) || 0,
              amount: Number(item.amount) || 0,
            }))
            : [{ item: "", quantity: 0, price: 0, amount: 0 }],
      };

      setDraftInvoiceChange(true);
      setSelectedInvoiceData(formattedInvoice);
    } catch (error) {
      console.error("Error preparing invoice for editing:", error);
    }
  };

  const openDeleteModal = (invoiceId) => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
    setSelectedInvoiceId(invoiceId);
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
        decrementCount();
        showAcceptToast({ message: result.message });
        fetchInvoicesWithDraft(user.user_email);
      } else {
        showRejectToast({ message: result.message || "Failed to delete invoice" });
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showRejectToast({ message: "Failed to delete invoice. Please try again." });
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
      date: formattedDate,
      time: date.toLocaleTimeString(),
    };
  }

  return (
    <div>
      {DraftInvoiceChange ? (
        <DraftInvoiceLayout
          invoiceData={selectedInvoiceData}
          setDraftInvoiceChange={setDraftInvoiceChange}
        />
      ) : (
        <div className="draft-invoices-container">
          {draftCount === 0 ? (
            <div className="empty-drafts-wrapper">
              <div className="icon-wrapper pulse-animation">
                <img src={draftIcon} alt="No Drafts" />
                <div className="dots">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                  <span className="dot dot3"></span>
                  <span className="dot dot4"></span>
                  <span className="dot dot5"></span>
                </div>
              </div>
              <div className="empty-title">No draft invoices</div>
              <p className="empty-subtitle">Your saved draft invoices will appear here. Start one anytime.</p>
            </div>
          ) : (
            <div className="drafts-grid">
              {draftInvoices.map((invoice) => (
                <div className="draft-card" key={invoice.invoice_id}>
                  <div className="draft-header">
                    <h3>Invoice #{invoice.invoice_id}</h3>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(invoice)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => openDeleteModal(invoice.invoice_id)}
                      >
                        <FaTrash />
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
      )}

    </div>
  );
}

export default DraftInvoices;
