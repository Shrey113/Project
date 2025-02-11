import React, { useState, useRef, useEffect } from "react";
import "./DraftInvoiceLayout.css";
import { useSelector } from "react-redux";
import {
  Server_url,
  showAcceptToast,
  showWarningToast,
  showRejectToast,
} from "../../../../../redux/AllData";
import { FaArrowLeft } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { useCount } from "../../../../../redux/CountContext";

function DraftInvoiceLayout({ invoiceData, setDraftInvoiceChange }) {
  const [toggle_recipient_input, setToggle_recipient_input] = useState(false);
  const [toggleAddressInput, setToggleAddressInput] = useState(false);
  const [toggleEmailInput, setToggleEmailInput] = useState(false);
  const [emailError, setEmailError] = useState("");
  const user = useSelector((state) => state.user);
  const [isSavedraft, setIsSavedraft] = useState(false);

  const { decrementCount } = useCount();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // console.log("invoiceData", invoiceData);
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

    return {
      date: formattedDate,
      time: date.toLocaleTimeString(),
    };
  }
  const inputRef = useRef(null);
  const addressRef = useRef(null);
  const emailRef = useRef(null);

  const [logoPreview, setLogoPreview] = useState("");
  const [invoice, setInvoice] = useState({
    invoice_id: invoiceData.invoice_id,
    invoice_to: invoiceData.invoice_to,
    invoice_to_address: invoiceData.invoice_to_address,
    invoice_to_email: invoiceData.invoice_to_email,
    date: formatDateTime(invoiceData.date).date,
    sub_total: invoiceData.sub_total,
    gst: invoiceData.gst,
    total: invoiceData.total,
    items: invoiceData.items,
    as_draft: 1,
  });

  const handleConfirmRecipient = () => {
    setToggle_recipient_input(false);
  };

  const handle_toggle_input = () => {
    setToggle_recipient_input(true);
  };

  const handleToggleAddressInput = () => {
    setToggleAddressInput(!toggleAddressInput);
  };

  const handleToggleEmailInput = (e) => {
    e.stopPropagation();
    setToggleEmailInput(!toggleEmailInput);
  };

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

  useEffect(() => {
    if (invoiceData.invoice_logo) {
      setLogoPreview(invoiceData.invoice_logo);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [invoiceData.invoice_logo]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBlur = () => {
    if (!validateEmail(invoice.invoice_to_email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name.startsWith("item_") ||
      name.startsWith("quantity_") ||
      name.startsWith("price_")
    ) {
      const index = parseInt(name.split("_")[1], 10);
      const items = [...invoice.items];
      const field = name.split("_")[0];
      let fieldValue =
        field === "quantity" || field === "price" ? parseFloat(value) : value;

      // Ensure quantity and price are valid numbers
      if (field === "quantity" || field === "price") {
        if (isNaN(fieldValue)) {
          fieldValue = 0; // default to 0 if not a valid number
        }
      }

      // Update the field value in the items array
      items[index][field] = fieldValue;

      // Recalculate amount if both quantity and price are valid
      if (!isNaN(items[index].quantity) && !isNaN(items[index].price)) {
        items[index].amount = items[index].quantity * items[index].price;
      } else {
        items[index].amount = 0; // reset amount if quantity or price are invalid
      }

      // Recalculate sub_total, gst, and total
      const sub_total = items.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );
      setInvoice({
        ...invoice,
        items,
        sub_total,
        gst: sub_total * 0.18,
        total: sub_total * 1.18,
      });
    } else {
      setInvoice({ ...invoice, [name]: value });
    }
  };

  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { item: "", quantity: 0, price: 0, amount: 0 }],
    });
  };

  const removeRow = (index) => {
    const items = [...invoice.items];
    items.splice(index, 1);
    const sub_total = items.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setInvoice({
      ...invoice,
      items,
      sub_total,
      gst: (sub_total * 0.18).toFixed(2),
      total: (sub_total * 1.18).toFixed(2),
    });
  };

  // const generateInvoiceContent = (doc) => {
  //   // Set font styles
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(24);
  //   doc.text("INVOICE", 14, 30);

  //   // Company details section
  //   doc.setFontSize(12);
  //   doc.text("From:", 14, 45);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(`${user.user_name}`, 14, 55);
  //   doc.text(`${user.business_address}`, 14, 65);
  //   doc.text(`${user.user_email}`, 14, 75);
  //   doc.text(`GST No: ${user.gst_number}`, 14, 85);

  //   // Bill to section
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Bill To:", 120, 45);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(`${invoice.invoice_to}`, 120, 55);
  //   doc.text(`${invoice.invoice_to_address || ""}`, 120, 65);
  //   doc.text(`${invoice.invoice_to_email || ""}`, 120, 75);

  //   // Invoice details
  //   doc.setFont("helvetica", "bold");
  //   doc.text(`Invoice No: ${invoice.invoice_id}`, 120, 85);
  //   doc.text(`Date: ${(new Date(invoice.date), "dd/MM/yyyy")}`, 120, 95);

  //   // Items table
  //   autoTable(doc, {
  //     startY: 110,
  //     head: [["Item", "Quantity", "Price", "Amount"]],
  //     body: invoice.items.map((item) => [
  //       item.item,
  //       item.quantity,
  //       `₹${item.price.toFixed(2)}`,
  //       `₹${item.amount.toFixed(2)}`,
  //     ]),
  //     theme: "grid",
  //     headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  //     styles: { fontSize: 10 },
  //   });

  //   // Summary section
  //   const finalY = doc.autoTable.previous.finalY + 10;
  //   doc.setFontSize(10);

  //   // Right-aligned summary
  //   const rightColumn = 190;
  //   doc.text(
  //     `Subtotal: ₹${invoice.sub_total.toFixed(2)}`,
  //     rightColumn,
  //     finalY,
  //     { align: "right" }
  //   );
  //   doc.text(
  //     `GST (18%): ₹${invoice.gst.toFixed(2)}`,
  //     rightColumn,
  //     finalY + 10,
  //     { align: "right" }
  //   );

  //   doc.setFont("helvetica", "bold");
  //   doc.text(`Total: ₹${invoice.total.toFixed(2)}`, rightColumn, finalY + 20, {
  //     align: "right",
  //   });

  //   // Footer
  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(8);
  //   doc.text("Thank you for your business!", 14, finalY + 40);
  // };

  // const generatePDF = () => {
  //   const doc = new jsPDF();

  //   const addLogoIfExists = () => {
  //     return new Promise((resolve) => {
  //       if (logoPreview) {
  //         const img = new Image();
  //         img.onload = () => {
  //           // Calculate aspect ratio to maintain logo proportions
  //           const imgWidth = 40;
  //           const imgHeight = (img.height * imgWidth) / img.width;
  //           doc.addImage(img, "JPEG", 14, 10, imgWidth, imgHeight);
  //           resolve();
  //         };
  //         img.src = logoPreview;
  //       } else {
  //         resolve();
  //       }
  //     });
  //   };

  //   // Generate PDF with proper async handling
  //   addLogoIfExists().then(() => {
  //     generateInvoiceContent(doc);
  //     doc.save(`Invoice_${invoice.invoice_id}.pdf`);
  //   });
  // };

  const generatePDF = () => {
    // Create a container div for the PDF content
    const element = document.createElement("div");
    element.className = "pdf-container";

    // Generate the HTML content
    element.innerHTML = `
      <div class="invoice-page" style="
        padding: 40px;
        font-family: Arial, sans-serif;
        position: relative;
        background: white;
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
      ">
        <div class="header" style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        ">
          ${
            logoPreview
              ? `
            <div class="logo" style="width: 150px; height: 90px;">
              <img src="${logoPreview}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>
          `
              : `
            <div style="width: 150px; height: 80px;"></div>
          `
          }
          <div class="invoice-title" style="text-align: right; font-size: 24px; font-weight: bold;">
            INVOICE<br/>
            <span style="font-size: 14px;">Invoice No: ${
              invoice.invoice_id
            }</span><br/>
            <span style="font-size: 14px;">Date: ${invoice.date}</span>
          </div>
        </div>

        <div class="address-section" style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        ">
          <div class="from-address">
            <h3 style="margin-bottom: 10px;">From:</h3>
            <p style="margin: 0;">${user.user_name}</p>
            <p style="margin: 0;">${user.business_address}</p>
            <p style="margin: 0;">${user.user_email}</p>
            <p style="margin: 0;">GST No: ${user.gst_number}</p>
          </div>
          <div class="to-address" style="text-align: right;">
            <h3 style="margin-bottom: 10px;">Bill To:</h3>
            <p style="margin: 0;">${invoice.invoice_to}</p>
            <p style="margin: 0;">${invoice.invoice_to_address || ""}</p>
            <p style="margin: 0;">${invoice.invoice_to_email || ""}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Item</th>
              <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Quantity</th>
              <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Price</th>
              <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${
                  item.item
                }</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">${
                  item.quantity
                }</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${item.price.toFixed(
                  2
                )}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${item.amount.toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="summary-section" style="margin-left: auto; width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>₹${invoice.sub_total.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>GST (18%):</span>
            <span>₹${invoice.gst.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; border-top: 2px solid #dee2e6; padding-top: 10px;">
            <span>Total:</span>
            <span>₹${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer" style="margin-top: 50px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>Thank you for your business!</p>
        </div>
      </div>
    `;

    // Configure pdf options
    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoice_id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "css", before: ".page-break" },
    };

    // Generate PDF
    html2pdf().from(element).set(opt).save();
  };

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
      console.log("Fetched draft invoices:", with_draft);
    } catch (error) {
      console.error("Error fetching invoices with draft:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !invoice.invoice_to ||
      !invoice.invoice_to_address ||
      !invoice.invoice_to_email ||
      invoice.items[0].item === "" ||
      invoice.invoice_to_address === "" ||
      invoice.invoice_to_email === ""
    ) {
      showWarningToast({ message: "Please fill in all required fields" });
      return;
    }

    for (const item of invoice.items) {
      if (
        !item.item ||
        !item.amount ||
        isNaN(item.amount) ||
        item.amount <= 0
      ) {
        showWarningToast({
          message: "Please ensure all items have a name and a valid amount.",
        });
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
        as_draft: 0,
      };

      const response = await fetch(`${Server_url}/add-draft-as-invoice`, {
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
      decrementCount();
      fetchInvoicesWithDraft(user.user_email);
      showAcceptToast({ message: "Invoice generated successfully!" });
      setDraftInvoiceChange(false);
      generatePDF();
    } catch (error) {
      console.error("Error adding invoice:", error);
      if (error.message.includes("Failed to fetch")) {
        showRejectToast({
          message:
            "Server connection error. Please check if the server is running.",
        });
      } else {
        showRejectToast({
          message: "Error generating invoice. Please try again.",
        });
      }
    } finally {
      button.disabled = false;
      button.innerHTML = "Generate Invoice";
    }
  };

  const handleSaveDraft = async () => {
    if (isSavedraft) return;

    if (!invoice.invoice_id || !user.user_email || !invoice.invoice_to) {
      showWarningToast({
        message: "Cannot save draft without invoice ID or user email.",
      });
      return;
    }

    try {
      setIsSavedraft(true);
      const date = new Date().toISOString();

      const draftInvoice = {
        ...invoice,
        date,
        user_email: user.user_email,
        as_draft: 1,
      };

      const response = await fetch(`${Server_url}/save-draft-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftInvoice),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Error saving draft.");
      }

      const data = await response.json();
      if (data?.message?.includes("successfully")) {
        showAcceptToast({ message: "Draft saved successfully!" });
        fetchInvoicesWithDraft(user.user_email);
        setDraftInvoiceChange(false);
      } else {
        showRejectToast({ message: "Unexpected response from server." });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      showRejectToast({ message: "Error saving draft. Please try again." });
    } finally {
      setIsSavedraft(false);
    }
  };
  const uploadBase64ImageDraft = async () => {
    if (!logoPreview) {
      showWarningToast({ message: "Please upload an image first." });
      return;
    }

    try {
      const response = await fetch(`${Server_url}/upload-draft-invoice-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: logoPreview,
          user_email: user.user_email,
          invoice_id: invoice.invoice_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await response.json();
      showAcceptToast({ message: "Image uploaded successfully!" });
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error uploading image:", error);
      showRejectToast({ message: "Error uploading image. Please try again." });
    }
  };

  return (
    <div className="invoice_and_table_container_draft">
      <div className="back-btn" onClick={() => setDraftInvoiceChange(false)}>
        <FaArrowLeft />
        Back
      </div>
      <div className="invoice_form">
        <div className="company_logo_invoice">
          <div
            className="logo_for_invoice"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
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
                }}
              >
                {!logoPreview && <span>Click to upload</span>}
              </div>
            </div>
            <button onClick={uploadBase64ImageDraft}>Upload Image</button>
          </div>
          <div className="invoice_and_gst_no">
            <div className="invoice_id">
              <strong>INVOICE No :</strong> {invoice.invoice_id}
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
                <strong> Address:</strong>
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
                <strong>Email : </strong>
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
                    {emailError && (
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

        {isMobile ? (
          <div className="mobile-invoice-generator">
            {invoice.items &&
              invoice.items.length > 0 &&
              invoice.items.map((item, index) => (
                <div className="invoice-item" key={index}>
                  <div className="input-wrapper">
                    <label htmlFor={`item_${index}`} className="input-label">
                      Item
                    </label>
                    <input
                      type="text"
                      name={`item_${index}`}
                      value={item.item}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className="input-field"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label
                      htmlFor={`quantity_${index}`}
                      className="input-label"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      name={`quantity_${index}`}
                      value={item.quantity}
                      onChange={handleChange}
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label htmlFor={`price_${index}`} className="input-label">
                      Price
                    </label>
                    <input
                      type="number"
                      name={`price_${index}`}
                      value={item.price}
                      onChange={handleChange}
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">SubTotal</label>
                    <div className="total-amount">₹{item.amount}</div>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            <div className="subtotal">Total: ₹{invoice.sub_total}</div>
          </div>
        ) : (
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
                        onChange={handleChange}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name={`price_${index}`}
                        value={item.price}
                        onChange={handleChange}
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
                className="total_amount_draft"
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
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {invoice.sub_total}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="add_row">
          <button type="button" onClick={addRow}>
            Add Row
          </button>
        </div>

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
            <span className="summary-value">₹{invoice.sub_total}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">GST (18%)</span>
            <span className="summary-value">₹{invoice.gst}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Total Amount</span>
            <span className="summary-value ">₹{invoice.total}</span>
          </div>

          <div className="invoice-actions">
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
              <span>Keep as Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DraftInvoiceLayout;
