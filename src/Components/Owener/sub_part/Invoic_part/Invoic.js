import React, { useState, useEffect } from "react";
import "./Invoice.css";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../redux/AllData";
import EditInvoiceModal from "./Sub_component/EditInvoiceModal";
import InvoicePage2 from "./invoicePage2";
import view_icon from "./Images/letter-i.png";
import DraftInvoices from "./Sub_component/DraftInvoices";

const InvoiceForm = () => {
  const user = useSelector((state) => state.user);

  const [activeTable, setActiveTable] = useState("firstTable");
  const [selectedTable, setSelectedTable] = useState("firstTable");

  const [invoices, setInvoices] = useState([]);
  const [invoice_id, setInvoice_id] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);

  const [draftInvoices, setDraftInvoices] = useState([]);
  const [draftCount, setDraftCount] = useState(0);

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Change

  const generateInvoice = async () => {
    try {
      const response = await fetch(`${Server_url}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user.user_email }),
      });
      const data = await response.json();
      setInvoice_id(data.invoice_id);
    } catch (error) {
      console.error("Error fetching new invoice ID:", error);
      alert("Failed to create a new invoice. Please try again.");
    }
  };

  const handleTableToggle = (tableName) => {
    setActiveTable(tableName);
    setSelectedTable(tableName);
  };

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

  const fetchInvoices = async (user_email) => {
    try {
      setLoading(true);
      const response = await fetch(`${Server_url}/invoices`, {
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
      console.log("Fetched invoices:", without_draft);

      const with_draft = Array.isArray(data.with_draft)
        ? [...data.with_draft].sort((a, b) => a.invoice_id - b.invoice_id)
        : [];
      setDraftInvoices(with_draft);
      setDraftCount(with_draft.length);
      console.log("Fetched draft invoices:", with_draft);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to load invoices. Please try again later.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkEmail(user.user_email);
      await fetchInvoices(user.user_email);
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
  // useEffect(() => {
  //   setTotalPages(Math.ceil(invoices.length / itemsPerPage));
  //   setCurrentPage(1); // Reset to first page when changing items per page
  // }, [itemsPerPage, invoices.length]);

  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };
  // const handleItemsPerPageChange = (event) => {
  //   setItemsPerPage(Number(event.target.value));
  // };

  // const renderPagination = () => {
  //   const pages = [];
  //   const maxVisiblePages = 5;
  //   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  //   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  //   if (endPage - startPage + 1 < maxVisiblePages) {
  //     startPage = Math.max(1, endPage - maxVisiblePages + 1);
  //   }

  //   for (let i = startPage; i <= endPage; i++) {
  //     pages.push(
  //       <button
  //         key={i}
  //         onClick={() => handlePageChange(i)}
  //         className={`pagination-button ${currentPage === i ? "active" : ""}`}
  //         style={{
  //           margin: "0 5px",
  //           padding: "5px 10px",
  //           backgroundColor: currentPage === i ? "#007bff" : "#fff",
  //           color: currentPage === i ? "#fff" : "#000",
  //           border: "1px solid #ddd",
  //           cursor: "pointer",
  //           borderRadius: "3px",
  //         }}
  //       >
  //         {i}
  //       </button>
  //     );
  //   }
  //   return (
  //     <div className="pagination-container" style={{ marginTop: "20px" }}>
  //       <button
  //         onClick={() => handlePageChange(1)}
  //         disabled={currentPage === 1}
  //         style={{ marginRight: "10px" }}
  //       >
  //         First
  //       </button>
  //       <button
  //         onClick={() => handlePageChange(currentPage - 1)}
  //         disabled={currentPage === 1}
  //         style={{ marginRight: "10px" }}
  //       >
  //         Previous
  //       </button>
  //       {pages}
  //       <button
  //         onClick={() => handlePageChange(currentPage + 1)}
  //         disabled={currentPage === totalPages}
  //         style={{ marginLeft: "10px" }}
  //       >
  //         Next
  //       </button>
  //       <button
  //         onClick={() => handlePageChange(totalPages)}
  //         disabled={currentPage === totalPages}
  //         style={{ marginLeft: "10px" }}
  //       >
  //         Last
  //       </button>
  //       <div style={{ marginLeft: "20px", display: "inline-block" }}>
  //         <select
  //           value={itemsPerPage}
  //           onChange={handleItemsPerPageChange}
  //           style={{ padding: "5px" }}
  //         >
  //           <option value={5}>5 per page</option>
  //           <option value={10}>10 per page</option>
  //           <option value={20}>20 per page</option>
  //           <option value={50}>50 per page</option>
  //         </select>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="invoice_and_table_container">
      <div className="table-toggle-buttons">
        <button
          onClick={() => handleTableToggle("firstTable")}
          className={selectedTable === "firstTable" ? "selected" : ""}
        >
          Invoice List
        </button>
        <button
          onClick={() => {
            handleTableToggle("secondTable");
            generateInvoice();
          }}
          className={selectedTable === "secondTable" ? "selected" : ""}
        >
          Invoice Generator
        </button>
        <button
          onClick={() => {
            handleTableToggle("draftTable");
          }}
          className={`draft-button ${
            selectedTable === "draftTable" ? "selected" : ""
          }`}
        >
          <span className="draft_count">{draftCount}</span>
          Draft Invoices
        </button>
      </div>
      

      {activeTable === "firstTable" && (
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
      )}
      {/* invoice generator form  */}
      {activeTable === "secondTable" && (
        <InvoicePage2
          fetchInvoices={fetchInvoices}
          invoices={invoices}
          setInvoices={setInvoices}
          generateInvoice={generateInvoice}
          invoice_id={invoice_id}
        />
      )}
      {activeTable === "draftTable" && (
        <DraftInvoices
          fetchDraftInvoices={fetchInvoices}
          draftInvoices={draftInvoices}
        />
      )}
    </div>
  );
};
export default InvoiceForm;
