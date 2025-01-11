import React, { useState, useEffect } from "react";
import "./Invoice.css";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../redux/AllData";
import EditInvoiceModal from "./Sub_component/EditInvoiceModal";
import InvoicePage2 from "./invoicePage2";
import view_icon from "./Images/letter-i.png";
import DraftInvoices from "./Sub_component/DraftInvoices";

const InvoiceForm = ({ selectedTable }) => {
  const user = useSelector((state) => state.user);

  // const [activeTable, setActiveTable] = useState("firstTable");

  const [invoices, setInvoices] = useState([]);
  const [invoice_id, setInvoice_id] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Change



  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const checkEmail = async (user_email) => {
    try {
      setLoading(true);
      const response = await fetch(`${Server_url}/check_email_owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user_email }),
      });
      const data = await response.json();

      console.log("data", data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to load invoices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoicesWithoutDraft = async (user_email) => {
    try {
      setLoading(true);
      const response = await fetch(`${Server_url}/invoices/without-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user_email }),
      });
      const data = await response.json();
      const without_draft = Array.isArray(data.without_draft)
        ? [...data.without_draft].sort((a, b) => a.invoice_id - b.invoice_id)
        : [];
      setInvoices(without_draft);
      console.log("Fetched invoices without draft:", without_draft);
    } catch (error) {
      console.error("Error fetching invoices without draft:", error);
      setError("Failed to load invoices. Please try again later.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkEmail(user.user_email);
      await fetchInvoicesWithoutDraft(user.user_email);
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

  return (
    <div className="invoice_and_table_container">
    
     
        <div className="invoice_list">
          <h2>Invoice List</h2>

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
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No Invoices Generated yet. Please Create an Invoice.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, index) => (
                      <tr
                        key={inv.invoice_id}
                        onClick={() => handleRowClick(inv)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{index + 1}</td>
                        <td>{inv.invoice_id}</td>
                        <td>{inv.user_email}</td>
                        <td>{formatDateTime(inv.date).date}</td>
                        <td>{inv.sub_total}</td>
                        <td>{inv.gst}</td>
                        <td>{inv.total}</td>
                        <td>{inv.invoice_to}</td>
                        <td>
                          <button
                            onClick={() => handleRowClick(inv)}
                            style={{
                              height: "25px",
                              width: "25px",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={view_icon}
                              alt=""
                              style={{ height: "100%" }}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {isEditModalOpen && (
                <EditInvoiceModal
                  invoice={selectedInvoice}
                  user={user}
                  onClose={() => setIsEditModalOpen(false)}
                  formatDateTime={formatDateTime}
                />
              )}
            </>
          )}
        </div>
    
    </div>
  );
};
export default InvoiceForm;
