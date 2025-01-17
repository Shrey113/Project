import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
// import { format } from "date-fns";
import autoTable from "jspdf-autotable";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../redux/AllData";
import { useCount } from "../../../../redux/CountContext";
import "./Invoice.css";

function InvoicePage2() {


  const [emailError, setEmailError] = useState("");
  const user = useSelector((state) => state.user);
  const [logoPreview, setLogoPreview] = useState(null);
  const [toggle_recipient_input, setToggle_recipient_input] = useState(false);
  const [toggleAddressInput, setToggleAddressInput] = useState(false);
  const [toggleEmailInput, setToggleEmailInput] = useState(false);
  const inputRef = useRef(null);
  const addressRef = useRef(null);
  const emailRef = useRef(null);

  const { setCount } = useCount();
  const [invoice_id, setInvoice_id] = useState(null);

  const generateInvoice = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: user_email }),
      });
      const data = await response.json();
      setInvoice_id(data.invoice_id);
    } catch (error) {
      console.error("Error fetching new invoice ID:", error);
      alert("Failed to create a new invoice. Please try again.");
    }
  };

  useEffect(() => {
    generateInvoice(user.user_email);
  }, [user.user_email]);
  const fetchInvoicesWithDraft = async (user_email) => {
    try {
  
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
      setCount(with_draft.length);
      console.log("Fetched draft invoices:", with_draft);
    } catch (error) {
      console.error("Error fetching invoices with draft:", error);
      setCount(0);
    }
  };


  const [invoice, setInvoice] = useState({
    invoice_id: invoice_id,
    invoice_to: "",
    invoice_to_address: "",
    invoice_to_email: "",
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    sub_total: 0,
    gst: 0,
    total: 0,
    user_email: user.user_email,
    items: [{ item: "", quantity: 0, price: 0, amount: 0 }],
  });

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setToggle_recipient_input(false); // Close input
    }
    if (addressRef.current && !addressRef.current.contains(event.target)) {
      setToggleAddressInput(false);
    }
    if (emailRef.current && !emailRef.current.contains(event.target)) {
      setToggleEmailInput(false);
    }
  };

  const getInvoiceId = async (user_email) => {
    try {
      const response = await fetch(`${Server_url}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email }),
      });
      const data = await response.json();

      setInvoice((prev) => ({
        ...prev,
        invoice_id: data.invoice_id,
      }));
    } catch (error) {
      console.error("Error fetching invoice ID:", error);
    }
  };

  //   for getting invoice id
  useEffect(() => {
    getInvoiceId(user.user_email);
  }, [user.user_email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name.startsWith("item_") ||
      name.startsWith("quantity_") ||
      name.startsWith("price_")
    ) {
      const index = parseInt(name.split("_")[1], 10); // Extract index
      const field = name.split("_")[0]; // Extract field name
      const updatedItems = [...invoice.items];
      updatedItems[index][field] =
        field === "price" || field === "quantity" ? Number(value) : value; // Update value
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].price; // Recalculate amount
      const subTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
      const gstAmount = (subTotal * 18) / 100;
      setInvoice({
        ...invoice,
        items: updatedItems,
        sub_total: subTotal,
        gst: gstAmount,
        total: subTotal + gstAmount,
      });
    } else if (
      name === "invoice_to" ||
      name === "invoice_to_address" ||
      name === "invoice_to_email"
    ) {
      // Handle recipient details fields
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        [name]: value,
      }));
    } else {
      // Update other main invoice fields
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        [name]: value,
      }));
    }
  };

  const handleNewInvoice = async () => {
    setInvoice({
      invoice_to: "",
      invoice_to_address: "",
      invoice_to_email: "",
      items: [
        {
          item: "",
          quantity: 0,
          price: 0,
          amount: 0,
        },
      ],
      sub_total: 0,
      gst: 0,
      total: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !invoice.invoice_to ||
      invoice.items[0].item === "" ||
      invoice.invoice_to_address === "" ||
      invoice.invoice_to_email === ""
    ) {
      alert("Please fill in all required fields");
      return;
    }

    for (const item of invoice.items) {
      if (
        !item.item ||
        !item.amount ||
        isNaN(item.amount) ||
        item.amount <= 0
      ) {
        alert("Please ensure all items have a name and a valid amount.");
        return;
      }
    }

    const button = e.target;
    button.disabled = true;
    button.innerHTML = "Generating...";

    try {
      const date = new Date().toISOString();

      console.log(date);

      const completeInvoice = {
        ...invoice,
        date: date,
        user_email: user.user_email,
      };

      const response = await fetch(`${Server_url}/add-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeInvoice),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      generateInvoice();
      handleNewInvoice();
      fetchInvoicesWithDraft(user.user_email);
      alert("Invoice generated successfully!");
      generatePDF();
    } catch (error) {
      console.error("Error adding invoice:", error);
      if (error.message.includes("Failed to fetch")) {
        alert(
          "Server connection error. Please check if the server is running."
        );
      } else {
        alert("Error generating invoice. Please try again.");
      }
    } finally {
      button.disabled = false;
      button.innerHTML = "Generate Invoice";
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
    }
  };

  // Handle add row
  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { item: "", quantity: 0, price: 0, amount: 0 }],
    });
  };
  // Handle remove row
  const removeRow = (index) => {
    if (index > 0) {
      const updatedItems = invoice.items.filter((_, i) => i !== index);
      setInvoice({ ...invoice, items: updatedItems });
    }
  };

  //   Email verification

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleToggleEmailInput = () => {
    if (toggleEmailInput) {
      // Validate email before closing the input
      if (!validateEmail(invoice.invoice_to_email)) {
        setEmailError("Invalid email address"); // Show error if invalid
        return;
      }
      setEmailError(""); // Clear error if valid
    }
    setToggleEmailInput(!toggleEmailInput);
  };

  const handleBlur = () => {
    if (!validateEmail(invoice.invoice_to_email)) {
      setEmailError("Invalid email address"); // Show error if invalid
    } else {
      setEmailError(""); // Clear error if valid
    }
  };

  const handleConfirmRecipient = () => {
    setToggle_recipient_input(false);
  };

  const handle_toggle_input = () => {
    setToggle_recipient_input(!toggle_recipient_input);
  };
  const handleToggleAddressInput = () => {
    setToggleAddressInput(!toggleAddressInput);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const addLogoIfExists = () => {
      return new Promise((resolve) => {
        if (logoPreview) {
          const img = new Image();
          img.onload = () => {
            // Calculate aspect ratio to maintain logo proportions
            const imgWidth = 40;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, "JPEG", 14, 10, imgWidth, imgHeight);
            resolve();
          };
          img.src = logoPreview;
        } else {
          resolve();
        }
      });
    };

    // Generate PDF with proper async handling
    addLogoIfExists().then(() => {
      generateInvoiceContent(doc);
      doc.save(`Invoice_${invoice.invoice_id}.pdf`);
    });
  };

  const generateInvoiceContent = (doc) => {
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

    // Bill to section
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 120, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.invoice_to}`, 120, 55);
    doc.text(`${invoice.invoice_to_address || ""}`, 120, 65);
    doc.text(`${invoice.invoice_to_email || ""}`, 120, 75);

    // Invoice details
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${invoice.invoice_id}`, 120, 85);
    doc.text(`Date: ${(new Date(invoice.date), "dd/MM/yyyy")}`, 120, 95);

    // Items table
    autoTable(doc, {
      startY: 110,
      head: [["Item", "Quantity", "Price", "Amount"]],
      body: invoice.items.map((item) => [
        item.item,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `₹${item.amount.toFixed(2)}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });

    // Summary section
    const finalY = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(10);

    // Right-aligned summary
    const rightColumn = 190;
    doc.text(
      `Subtotal: ₹${invoice.sub_total.toFixed(2)}`,
      rightColumn,
      finalY,
      { align: "right" }
    );
    doc.text(
      `GST (18%): ₹${invoice.gst.toFixed(2)}`,
      rightColumn,
      finalY + 10,
      { align: "right" }
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Total: ₹${invoice.total.toFixed(2)}`, rightColumn, finalY + 20, {
      align: "right",
    });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 14, finalY + 40);
  };

  const handleSaveDraft = async () => {
    if (!invoice.invoice_id || !user.user_email || !invoice.invoice_to) {
      alert("Cannot save draft without invoice ID or user email.");
      return;
    }

    try {
      const date = new Date().toISOString();

      const draftInvoice = {
        ...invoice,
        date,
        user_email: user.user_email,
        as_draft: 1,
      };

      const response = await fetch(`${Server_url}/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftInvoice),
      });

      if (!response.ok) {
        throw new Error("Error saving draft.");
      }

      const data = await response.json();
      if (
        data.message === "Invoice items with draft added successfully" ||
        data.message === "Invoice with draft added successfully"
      ) {
        alert("Draft saved successfully!");
        handleNewInvoice();
        generateInvoice();
        fetchInvoicesWithDraft(user.user_email);
      }
      console.log(data);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft. Please try again.");
    }
  };
  // useEffect(() => {
  //   const navigation_check = navigate((nextLocation) => {
  //     // Check if we're navigating away from invoice generator page
  //     if (!nextLocation.pathname.includes("/Owner/Invoice/generator")) {
  //       // Check if there's data to save
  //       if (
  //         invoice.invoice_to ||
  //         invoice.items.some(
  //           (item) => item.item || item.quantity > 0 || item.price > 0
  //         )
  //       ) {
  //         const userConfirmed = window.confirm(
  //           "Do you want to save your progress as draft before leaving?"
  //         );

  //         if (userConfirmed) {
  //           // Use the existing handleSaveDraft function
  //           handleSaveDraft().then(() => {
  //             navigate(nextLocation.pathname);
  //           });
  //           return false;
  //         }
  //       }
  //     }
  //     return true;
  //   });

  //   return () => {
  //     if (navigation_check) {
  //       navigation_check();
  //     }
  //   };
  // }, [navigate, invoice, handleSaveDraft]);

  // function handleLocationChange() {
  //   if (location.pathname.includes("/Owner/Invoice/generator")) {
  //     if (
  //       invoice.invoice_id &&
  //       invoice.user_email &&
  //       invoice.invoice_to &&
  //       invoice.items.some((item) => item.item)
  //     ) {
  //       alert(
  //         "You have unsaved changes. Do you want to save them before leaving?"
  //       );
  //       handleSaveDraft();
  //     } else {
  //       return;
  //     }
  //   }
  // }

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     const message =
  //       "You have unsaved changes. Do you want to save them before leaving?";
  //     event.returnValue = message;
  //     return message;
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [invoice, location]);

  // useEffect(() => {
  //   const handleLocationChange = () => {
  //     // Check if the user is leaving the invoice generator page and if the form is dirty
  //     // if (isFormDirty && location.pathname !== "/Owner/Invoice/generator") {
  //     //   const confirmLeave = window.confirm(
  //     //     "You have unsaved changes. Do you want to save them before leaving?"
  //     //   );
  //     //   if (confirmLeave) {
  //     //     console.log("Saving draft...");
  //     //     setIsFormDirty(false);
  //     //   } else {
  //     //     console.log("User left without saving.");
  //     //   }
  //     // }
  //     if (isFormDirty) {
  //       if (location.pathname === "/Owner/Invoice") {
  //         window.alert(
  //           "You have unsaved changes. Do you want to save them before leaving?"
  //         );
  //         navigate("/Owner/Invoice", { state: { message: "unsaved changes" } });
  //       }
  //       if (location.pathname === "/Owner/Invoice/draft") {
  //         window.alert(
  //           "You have unsaved changes. Do you want to save them before leaving?"
  //         );
  //         navigate("/Owner/Invoice/draft", {
  //           state: { message: "unsaved changes" },
  //         });
  //       }
  //       if (location.pathname === "/Owner/Packages") {
  //         window.alert("unsaved changes");
  //         navigate("/Owner/Packages", {
  //           state: { message: "unsaved changes" },
  //         });
  //       }
  //     } else {
  //       window.alert("not running");
  //     }
  //   };
  //   handleLocationChange();
  // }, [location]);

  return (
    <div className="invoice_and_table_container">
      <div className="invoice_form">
        <div className="company_logo_invoice">
          <div className="preview_image">
            <input
              type="file"
              name="company_logo"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: "none" }}
              id="input_image"
            />
            <div
              className="companyLogo"
              onClick={() => document.getElementById("input_image").click()}
              style={{
                backgroundImage: logoPreview ? `url(${logoPreview})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100%",
                cursor: "pointer",
                objectFit: "cover",
              }}
            >
              {!logoPreview && <span>Click to upload</span>}
            </div>
          </div>
          <div className="invoice_and_gst_no">
            <div className="invoice_id">
              <strong>INVOICE No :</strong> {invoice_id}
            </div>
            <div className="invoice_id">
              {" "}
              <strong>GST No :</strong> {user.gst_number}
            </div>
          </div>
        </div>
        <h1>INVOICE</h1>
        <div className="bill_details">
          <div className="bill_to">
            <div className="date">
              <strong>Date</strong> : {invoice.date}
            </div>
            <div className="recipient_name">
              <div className="recipient-input" ref={inputRef}>
                <strong>Bill to:</strong>
                {toggle_recipient_input ? (
                  <>
                    <input
                      type="text"
                      value={invoice.invoice_to}
                      onChange={handleChange}
                      name="invoice_to"
                      placeholder="Enter Recipient Name"
                      style={{
                        padding: "5px",
                        border: "none",
                        outline: "1px solid #ddd",
                        fontSize: "14px",
                        borderRadius: "4px",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleConfirmRecipient}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      {" "}
                      ✔{" "}
                    </button>
                  </>
                ) : (
                  <p onClick={handle_toggle_input}>
                    {invoice.invoice_to || "Enter Recipient Name"}
                  </p>
                )}
              </div>

              <div className="recipient-input" ref={addressRef}>
                {toggleAddressInput ? (
                  <>
                    <textarea
                      value={invoice.invoice_to_address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                      name="invoice_to_address"
                      style={{
                        padding: "4px",
                        border: "none",
                        outline: "1px solid #ddd",
                        fontSize: "14px",
                        borderRadius: "4px",
                        width: "200px",
                        height: "60px",
                        resize: "none",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleToggleAddressInput}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ✔
                    </button>
                  </>
                ) : (
                  <p
                    onClick={handleToggleAddressInput}
                    style={{ maxWidth: "300px", width: "200px" }}
                  >
                    {invoice.invoice_to_address || "Enter Address"}
                  </p>
                )}
              </div>

              <div className="recipient-input" ref={emailRef}>
                {toggleEmailInput ? (
                  <>
                    <input
                      type="email"
                      value={invoice.invoice_to_email}
                      onChange={handleChange}
                      placeholder="Enter Email ID"
                      name="invoice_to_email"
                      onBlur={handleBlur}
                      style={{
                        padding: "5px",
                        border: "none",
                        outline: "1px solid #ddd",
                        fontSize: "14px",
                        borderRadius: "4px",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleToggleEmailInput}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ✔
                    </button>
                    {emailError && ( // Display error message
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {emailError}
                      </p>
                    )}
                  </>
                ) : (
                  <p onClick={handleToggleEmailInput}>
                    {invoice.invoice_to_email || "Enter Email ID"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bill_from">
            <div className="recipient_name">
              <strong>From:</strong>
              <p>{user.user_name}</p>
              <p>{user.business_address}</p>
              <p>{user.user_email}</p>
            </div>
          </div>
        </div>

        <table className="invoice_generator">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items &&
              invoice.items.length > 0 &&
              invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="name_of_item">
                    <input
                      type="text"
                      name={`item_${index}`}
                      value={item.item}
                      onChange={handleChange}
                      placeholder="Enter name"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`quantity_${index}`}
                      value={item.quantity}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`price_${index}`}
                      value={item.price}
                      onChange={(e) => {
                        handleChange(e);
                        // updateAmount(index);
                      }}
                      min="0"
                    />
                  </td>
                  <td className="total_amount">{item.amount}</td>
                  <td>
                    {index > 0 && (
                      <button type="button" onClick={() => removeRow(index)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            <tr
              style={{
                borderTop: "1px solid black",
                borderBottom: "1px solid black",
              }}
            >
              <td
                colSpan="3"
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                Total
              </td>
              <td
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                {invoice.sub_total}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div className="add_row">
          <button type="button" onClick={addRow}>
            Add Row
          </button>
        </div>

        {/* Invoice Summary */}

        <div className="invoice-summary">
          <div className="summary-row">
            <span className="summary-label">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Invoice To
            </span>
            <span className="summary-value">{invoice.invoice_to}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Date
            </span>
            {/* {formatDateTime(invoice.date)} */}
            <span className="summary-value">{invoice.date}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Subtotal</span>
            <span className="summary-value">
              ₹{invoice.sub_total.toFixed(2)}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label">GST (18%)</span>
            <span className="summary-value">₹{invoice.gst.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Total Amount</span>
            <span className="summary-value total-value">
              ₹{invoice.total.toFixed(2)}
            </span>
          </div>

          <div className="invoice-actions">
            <button
              className="btn btn-secondary"
              onClick={generatePDF}
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PDF</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              type="submit"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                <line x1="16" y1="5" x2="22" y2="5" />
                <line x1="19" y1="2" x2="19" y2="8" />
              </svg>
              <span>Generate Invoice</span>
            </button>

            <button
              type="submit"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M4 8h16" />
                <path d="M4 12h16" />
                <path d="M4 16h16" />
                <path d="M9 12l2 2l4-4" />
              </svg>
              <span>Save as Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage2;
