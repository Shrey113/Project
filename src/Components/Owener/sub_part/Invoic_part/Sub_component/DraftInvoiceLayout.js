import React, { useState, useRef, useEffect } from "react";
import "./DraftInvoiceLayout.css";
import { useSelector } from "react-redux";
import { Server_url, showAcceptToast, showWarningToast, showRejectToast } from "../../../../../redux/AllData";
import { FaArrowLeft } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
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

  const [terms, setTerms] = useState("1. ");
  const [signature_file, set_signature_file] = useState(null);

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
  console.log("invoice...............", invoiceData);

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
      reader.onloadend = async () => {
        setLogoPreview(reader.result);
        uploadBase64ImageDraft(reader.result);
      };
      reader.readAsDataURL(file);
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

  const formatAmount = (amount) => parseFloat(amount).toFixed(2);

  const removeRow = (index) => {
    setInvoice((prevInvoice) => {
      const updatedItems = prevInvoice.items.filter((_, i) => i !== index);

      const sub_total = updatedItems.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );
      const gst = sub_total * 0.18;
      const total = sub_total + gst;

      return {
        ...prevInvoice,
        items: updatedItems,
        sub_total,
        gst,
        total,
      };
    });
  };


  // new one invoice pdf 
  const generatePDF = () => {
    const element = document.createElement("div");
    element.className = "pdf-container";

    element.innerHTML = `
        <style>
          .invoice-page {
            padding: 40px;
            font-family: 'Arial', sans-serif;
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 50px;
          }
          .from-address{
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          .logo img {
            max-width: 100%;
            max-height: 90px;
            object-fit: contain;
          }
          
          .address-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }

          h3 {
            font-size: 18px;
          }

          .to-address{
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
            justify-content: center;
          }
          .invoice-title{
            display: flex;
            alin-items: flex-end ;
            justify-content: flex-start;
            gap: 10px;
            flex-direction: column;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          table thead tr {
            background-color: #f8f9fa;
          }
          table th,
          table td {
            padding: 12px;
            border: 1px solid #dee2e6;
          }
          table th {
            text-align: left;
          }
          table td {
            text-align: right;
          }
          table td:first-child {
            text-align: left;
          }
          .summary-section {
            margin-left: auto;
            width: 300px;
          }
          .summary-section div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .summary-section .total {
            font-weight: bold;
            border-top: 2px solid #dee2e6;
            padding-top: 10px;
            margin-top: 10px;
          }
          .terms {
            font-size: 12px;
            white-space: pre-line;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 10px;
          }
          .terms p{
            font-size: 12px;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            border:none;
          }
          .signature {
            text-align: center;
          }
          .signature img {
            max-width: 150px;
            height: auto;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
          }
        </style>
    
        <div class="invoice-page">
          <div class="header">
            ${logoPreview
        ? `<div class="logo"><img src="${logoPreview}" alt="Logo" /></div>`
        : `<div class="logo" style="width: 150px; height: 80px;"></div>`
      }
            <div class="from-address">
              <h2>${user.business_name}</h2>
              <p style="margin: 0;">${user.user_name}</p>
              <p style="margin: 0;">${user.business_address}</p>
              <p style="margin: 0;">${user.user_email}</p>
            </div>
            
          </div>
          <h3 style="margin-bottom: 14px;"> INVOICE </h3>
          <div class="address-section">
      
            <div class="to-address">
              <span style="font-size: 14px;"><strong>Recipient Name : </strong>${invoice.invoice_to}</span>
              <span style="font-size: 14px;"><strong>Recipient Address : </strong>${invoice.invoice_to_address || ""}</span>
              <span style="font-size: 14px;"><strong>Recipient Email : </strong> ${invoice.invoice_to_email || ""}</span>
            </div>
            
            <div class="invoice-title">
              <span style="font-size: 14px;">Invoice No: ${invoice.invoice_id}</span>
              <span style="font-size: 14px;">Date: ${invoice.date}</span>
              <span style="font-size: 14px;">GST No: ${user.gst_number}</span>
            </div>

          </div>
    
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
        .map(
          (item) => `
                    <tr>
                      <td>${item.item}</td>
                      <td>${item.quantity}</td>
                      <td>₹${formatAmount(item.price)}</td>
                      <td>₹${formatAmount(item.amount)}</td>
                    </tr>
                  `
        )
        .join("")}
            </tbody>
          </table>
    
          <div class="summary-section">
            <div>
              <span>Subtotal:</span>
              <span>₹${formatAmount(invoice.sub_total)}</span>
            </div>
            <div>
              <span>GST (18%):</span>
              <span>₹${formatAmount(invoice.gst)}</span>
            </div>
            <div class="total">
              <span>Total:</span>
              <span>₹${formatAmount(invoice.total)}</span>
            </div>
          </div>
    
          
    
          <div class="signature-section">
            <div class="terms">
              <h3>Terms & Conditions:</h3>
              <p> ${terms || "No terms specified"} </p>
            </div>
            <div class="signature">
              ${signature_file ? `<img src="${signature_file}" alt="Signature" />`
        : '<div style="width: 150px; border-top: 1px solid #000;"></div>'
      }
              <div style="font-size: 14px;">Authorized Signature</div>
            </div>
            
          </div>
    
          <div class="footer">
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
        showWarningToast({ message: "Please ensure all items have a name and a valid amount." });
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
        signature_file: signature_file,
        terms: terms,
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
      showAcceptToast({ message: "Invoice generated successfully!" });
      setDraftInvoiceChange(false);
      fetchInvoicesWithDraft(user.user_email);
      generatePDF();
    } catch (error) {
      console.error("Error adding invoice:", error);
      if (error.message.includes("Failed to fetch")) {
        showRejectToast({ message: "Server connection error. Please check if the server is running." });
      } else {
        showRejectToast({ message: "Error generating invoice. Please try again." });
      }
    } finally {
      button.disabled = false;
      button.innerHTML = "Generate Invoice";
    }
  };
  //  const fetchInvoicesWithDraft = async (user_email) => {
  //     try {
  //       // setLoading(true);
  //       const response = await fetch(`${Server_url}/invoices/with-draft`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ user_email: user_email }),
  //       });
  //       const data = await response.json();
  //       const with_draft = Array.isArray(data.with_draft)
  //         ? [...data.with_draft].sort((a, b) => a.invoice_id - b.invoice_id)
  //         : [];
  //       setDraftInvoices(with_draft);
  //       setDraftCount(with_draft.length);
  //       console.log("Fetched draft invoices:", with_draft);
  //     } catch (error) {
  //       console.error("Error fetching invoices with draft:", error);
  //       // setError("Failed to load invoices. Please try again later.");
  //       setDraftInvoices([]);
  //     }
  //   };

  const handleSaveDraft = async () => {
    if (isSavedraft) return;

    if (!invoice.invoice_id || !user.user_email || !invoice.invoice_to) {
      showWarningToast({ message: "Cannot save draft without invoice ID or user email." });
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
        terms: terms,
      };

      console.log("draft invoice save", draftInvoice);
      console.log("draft item save", invoice.items);

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



  const handleBullet = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const lines = terms.split("\n").filter(line => line.trim() !== "");
      const lastLine = lines[lines.length - 1];
      const lastNumber = parseInt(lastLine?.split(".")[0], 10) || 0;
      const nextNumber = lastNumber + 1;

      setTerms(terms + "\n" + nextNumber + ". ");
    }
  };

  const handleFocus = () => {
    if (!terms || terms.trim() === "") {
      setTerms("1. ");
    }
  };

  useEffect(() => {
    const fetchSignatureTerms = async () => {
      try {
        const response = await fetch(`${Server_url}/fetch_signature_terms_draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.user_email,
            invoice_id: invoice.invoice_id,
          }),
        })
        const data = await response.json();
        if (response.ok) {
          set_signature_file(data.image);
          setTerms(data.terms);
        } else {
          set_signature_file(null);
          setTerms(null);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    }
    if (user.user_email) {
      fetchSignatureTerms();
    }
  }, [user.user_email, invoice.invoice_id])

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function () {
      const base64String = reader.result;
      set_signature_file(base64String);

      try {
        const response = await fetch(`${Server_url}/upload-signature-draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signature_file: base64String,
            user_email: user.user_email,
            invoice_id: invoice.invoice_id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload image.");
        }

        const data = await response.json();
        if (data.message === "Signature uploaded successfully") {
          console.log("Draft Signature uploaded successfully");
          showAcceptToast({ message: "Signature uploaded successfully!" });
        }
      } catch (error) {
        console.error("Error uploading signature:", error);
      }
    };

    reader.readAsDataURL(file);
  };


  return (
    <div className="invoice_and_table_container_draft">
      <div className="back-btn" onClick={() => setDraftInvoiceChange(false)}>
        <FaArrowLeft />
        Back
      </div>
      <div className="invoice_form">
        <div className="company_logo_invoice">
          <div className="logo_for_invoice">
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
          </div>

          <div className="bill_from">
            <div className="business_name">{user.business_name}</div>

            <div className="invoice_top_field">
              <FaUser style={{ color: "var(--color_main_button_owner)" }} />
              <div>{user.user_name}</div>
            </div>
            <div className="invoice_top_field">
              <FaLocationDot style={{ color: "var(--color_main_button_owner)" }} />
              <div className="">{user.business_address}</div>
            </div>

            <div className="invoice_top_field">
              <MdEmail style={{ color: "var(--color_main_button_owner)" }} />
              <div>{user.user_email}</div>
            </div>

          </div>
        </div>

        <h1>INVOICE</h1>
        <div className="bill_details">
          <div className="bill_to">
            <div className="recipient_name">
              <div className="recipient-input" ref={inputRef}>
                {/* <strong>Bill to:</strong> */}
                {toggle_recipient_input ? (
                  <>
                    <input
                      type="text"
                      value={invoice.invoice_to}
                      onChange={handleChange}
                      name="invoice_to"
                      placeholder="Enter Recipient Name"
                      autoFocus
                    />
                    <button
                      onClick={handleConfirmRecipient}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      ✔
                    </button>
                  </>
                ) : (
                  <div onClick={handle_toggle_input}>
                    {invoice.invoice_to || "Enter Recipient Name"}
                  </div>
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
                      autoFocus
                      cols={30}
                    />
                    <button
                      onClick={handleToggleAddressInput}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      ✔
                    </button>
                  </>
                ) : (
                  <div
                    onClick={handleToggleAddressInput}
                    style={{ maxWidth: "300px", width: "200px" }}
                  >
                    {invoice.invoice_to_address || "Enter Address"}
                  </div>
                )}
              </div>

              <div className="recipient-input" ref={emailRef}>
                {/* <strong>Email : </strong> */}
                {toggleEmailInput ? (
                  <>
                    <input
                      type="email"
                      value={invoice.invoice_to_email}
                      onChange={handleChange}
                      placeholder="Enter Email ID"
                      name="invoice_to_email"
                      onBlur={handleBlur}
                      autoFocus
                    />
                    <button
                      onClick={handleToggleEmailInput}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      ✔
                    </button>
                    {emailError && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          outline: "none",
                          border: "none",
                          fontSize: 13,
                        }}
                      >
                        {emailError}
                      </div>
                    )}
                  </>
                ) : (
                  <div onClick={handleToggleEmailInput}>
                    {invoice.invoice_to_email || "Enter Email ID"}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="invoice_and_gst_no">
            <div className="invoice_id">
              <strong>INVOICE No :</strong> {invoice.invoice_id}
            </div>
            <div className="date">
              <strong>Date</strong> : {invoice.date}
            </div>

            <div className="invoice_id">
              {" "}
              <strong>GST No :</strong> {user.gst_number}
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

        {/* terms and summary section */}
        <div className="terms_and_summary">
          <div className="invoice_terms">
            <div className="terms_heading">Terms & Conditions</div>
            <textarea
              className="terms_textarea"
              value={terms ? terms : ""}
              onFocus={handleFocus}
              onChange={(e) => setTerms(e.target.value)}
              onKeyDown={handleBullet}
              maxLength={150}
              placeholder="Enter terms and conditions..."
            ></textarea>
          </div>
          <div className=" invoice-summary">
            <div className="summary_calculate">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{invoice.sub_total}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">GST (18%)</span>
                <span className="summary-value">₹{formatAmount(invoice.gst)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value total-value">₹{formatAmount(invoice.total)}</span>
              </div>

            </div>

            <div className="signature_wrapper">
              <div className="invoice_signature">
                <input
                  type="file"
                  id="signatureInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <div className="signature_file" onClick={() => document.getElementById("signatureInput").click()}
                  style={{
                    backgroundImage: signature_file ? `url(${signature_file})` : "none",
                  }}>
                  {!signature_file && <span>Click to upload</span>}
                </div>
              </div>
              <div className="signature_text">
                Signature
              </div>
            </div>
          </div>
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
  );
}

export default DraftInvoiceLayout;
