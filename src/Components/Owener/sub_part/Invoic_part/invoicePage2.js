import React, { useState, useEffect, useRef } from "react";

import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import {
  Server_url,
  showAcceptToast,
  showWarningToast,
  showRejectToast,
} from "../../../../redux/AllData";
import { useCount } from "../../../../redux/CountContext";
import "./Invoice.css";

function InvoicePage2() {
  const [emailError, setEmailError] = useState("");
  const user = useSelector((state) => state.user);
  const [toggle_recipient_input, setToggle_recipient_input] = useState(false);
  const [toggleAddressInput, setToggleAddressInput] = useState(false);
  const [toggleEmailInput, setToggleEmailInput] = useState(false);
  const inputRef = useRef(null);
  const addressRef = useRef(null);
  const emailRef = useRef(null);

  const { incrementCount, setCount } = useCount();
  const [invoice_id, setInvoice_id] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [base64Image, setBase64Image] = useState("");

  // const [services, setService] = useState([]);

  const [services, set_services] = useState([]);
  const [filter_services, set_filter_services] = useState([]);

  const [is_mobile, set_is_mobile] = useState(true);

  const formatAmount = (amount) => parseFloat(amount).toFixed(2);

  useEffect(() => {
    const handle_mobile_resize = () => {
      set_is_mobile(window.innerWidth < 1100);
    };
    handle_mobile_resize();
    window.addEventListener("resize", handle_mobile_resize);
    return () => {
      window.removeEventListener("resize", handle_mobile_resize);
    };
  }, []);
  useEffect(() => {
    const fetch_services = async () => {
      try {
        const response = await fetch(
          `${Server_url}/owner/services/${user.user_email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("services", data);

        set_services(data);
        set_filter_services(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetch_services();
  }, [user.user_email]);

  const handleKeyDown = (e, index) => {
    const filterSearch = e.target.value.toLowerCase();
    const filter_item = services.filter((item) => {
      return item.service_name.toLowerCase().includes(filterSearch);
    });
    set_filter_services(filter_item);
  };

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
      showRejectToast({
        message: "Failed to create a new invoice. Please try again.",
      });
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
    } catch (error) {
      console.error("Error fetching invoices with draft:", error);
      setCount(0);
    }
  };

  const [invoice, setInvoice] = useState({
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

  const addItem = (index, item_name, quantity, price) => {
    setInvoice((prevInvoice) => {
      const updatedItems = [...prevInvoice.items];

      // Update the correct row (not just the last row)
      if (updatedItems[index]) {
        updatedItems[index] = {
          item: item_name,
          quantity: quantity,
          price: price,
          amount: quantity * price,
        };
      }

      // Recalculate total
      const subTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
      const gstAmount = (subTotal * 18) / 100;
      const total = (parseFloat(subTotal) + parseFloat(gstAmount)).toFixed(2);

      return {
        ...prevInvoice,
        items: updatedItems,
        sub_total: subTotal,
        gst: gstAmount,
        total: total,
      };
    });
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("item_")) {
      const index = parseInt(name.split("_")[1], 10);
      const updatedItems = [...invoice.items];

      updatedItems[index].item = value;
      setInvoice({
        ...invoice,
        items: updatedItems,
      });
    } else if (name.startsWith("quantity_") || name.startsWith("price_")) {
      const index = parseInt(name.split("_")[1], 10);
      const field = name.split("_")[0];
      const updatedItems = [...invoice.items];
      updatedItems[index][field] = Number(value);
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].price;

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
      ["invoice_to", "invoice_to_address", "invoice_to_email"].includes(name)
    ) {
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        [name]: value,
      }));
    } else {
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        [name]: value,
      }));
    }
  };

  const handleNewInvoice = async () => {
    setInvoice({
      invoice_id: invoice_id,
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
      !invoice_id ||
      !invoice.invoice_to ||
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

      const completeInvoice = {
        ...invoice,
        invoice_id: invoice_id,
        date: date,
        user_email: user.user_email,
        invoice_photo: logoPreview,
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

      // const data = await response.json();
      // console.log(data);

      generateInvoice(user.user_email);
      handleNewInvoice();
      fetchInvoicesWithDraft(user.user_email);
      showAcceptToast({ message: "Invoice generated successfully!" });
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

  // Handle add row
  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { item: "", quantity: 0, price: 0, amount: 0 }],
    });
    set_filter_services(services);
  };
  // Handle remove row
  const removeRow = (index) => {
    setInvoice((prevInvoice) => {
      const updatedItems = prevInvoice.items.filter((_, i) => i !== index); // Remove the item at the given index

      // Recalculate subtotal
      const subTotal = updatedItems.reduce((acc, item) => acc + item.amount, 0);
      const gstAmount = (subTotal * 18) / 100;
      const total = (parseFloat(subTotal) + parseFloat(gstAmount)).toFixed(2);

      return {
        ...prevInvoice,
        items: updatedItems,
        sub_total: subTotal,
        gst: gstAmount,
        total: total,
      };
    });
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
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
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
            <span style="font-size: 14px;">Invoice No: ${invoice_id}</span><br/>
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
                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${formatAmount(
                  item.price
                )}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">₹${formatAmount(
                  item.amount
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
            <span>₹${formatAmount(invoice.sub_total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>GST (18%):</span>
            <span>₹${formatAmount(invoice.gst)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; border-top: 2px solid #dee2e6; padding-top: 10px;">
            <span>Total:</span>
            <span>₹${formatAmount(invoice.total)}</span>
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
      filename: `Invoice_${invoice_id}.pdf`,
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

  const handleSaveDraft = async () => {
    if (!invoice_id || !user.user_email || !invoice.invoice_to) {
      showWarningToast({
        message: "Cannot save draft without invoice ID or user email.",
      });
      return;
    }

    try {
      const date = new Date().toISOString();

      const draftInvoice = {
        ...invoice,
        invoice_id: invoice_id,
        date,
        user_email: user.user_email,
        as_draft: 1,
        invoice_logo: logoPreview,
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
      // console.log(data);
      if (
        data.message === "Invoice items with draft added successfully" ||
        data.message === "Invoice with draft added successfully"
      ) {
        incrementCount();
        showAcceptToast({ message: "Draft saved successfully!" });
        handleNewInvoice();
        generateInvoice(user.user_email);
        fetchInvoicesWithDraft(user.user_email);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      showRejectToast({ message: "Error saving draft. Please try again." });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setBase64Image(reader.result);
        setLogoPreview(reader.result);
      };

      console.log(reader.readAsDataURL(file));
    }
  };

  const uploadBase64Image = async () => {
    if (!base64Image) {
      showWarningToast({ message: "Please upload an image first." });
      return;
    }

    try {
      const response = await fetch(`${Server_url}/upload-invoice-logo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          user_email: user.user_email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await response.json();
      console.log(data);
      showAcceptToast({ message: "Image uploaded successfully!" });
    } catch (error) {
      console.error("Error uploading image:", error);
      showRejectToast({ message: "Error uploading image. Please try again." });
    }
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`${Server_url}/get-invoice-logo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_email: user.user_email }), // Send user_email in the body
        });

        const data = await response.json();
        if (response.ok && data.invoice_logo) {
          setLogoPreview(data.invoice_logo);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    if (user.user_email) {
      fetchLogo();
    }
  }, [user.user_email]);

  return (
    <div className="invoice_and_table_container">
      <div className="invoice_form">
        <div className="company_logo_invoice">
          <div className="logo_for_invoice">
            <div className="preview_image">
              <input
                type="file"
                name="company_logo"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="input_image"
              />

              <div
                className="companyLogo"
                onClick={() => document.getElementById("input_image").click()}
                style={{
                  backgroundImage: logoPreview ? `url(${logoPreview})` : "none",
                }}
              >
                {!logoPreview && <span>Click to upload</span>}
              </div>
            </div>
            <button
              onClick={uploadBase64Image}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Upload Image
            </button>
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
            <div className="recipient_name">
              <div className="date">
                <strong>Date</strong> : {invoice.date}
              </div>
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
                    <button onClick={handleConfirmRecipient}> ✔ </button>
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
                    {emailError && ( // Display error message
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
          <div className="bill_from">
            <div className="recipient_name">
              <strong>From:</strong>
              <div>{user.user_name}</div>
              <div className="business_address">{user.business_address}</div>
              <div>{user.user_email}</div>
            </div>
          </div>
        </div>

        {is_mobile ? (
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
                      onChange={(event) => {
                        handleKeyDown(event, index);
                        handleChange(event);
                      }}
                      onFocus={(e) => {
                        e.target.nextSibling.style.display = "block";
                      }}
                      onBlur={(e) =>
                        setTimeout(
                          () => (e.target.nextSibling.style.display = "none"),
                          200
                        )
                      }
                      autoComplete="off"
                      placeholder="Enter name"
                      className="input-field"
                      autoFocus="true"
                    />
                    {filter_services && (
                      <ul className="dropdown">
                        {filter_services.map((service, i) => (
                          <li
                            key={i}
                            onMouseDown={() =>
                              addItem(
                                index,
                                service.service_name,
                                1,
                                parseInt(service.price_per_day)
                              )
                            }
                          >
                            {service.service_name}
                          </li>
                        ))}
                      </ul>
                    )}
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
                  <tr key={index} style={{ padding: "30px" }}>
                    <td className="name_of_item">
                      <input
                        type="text"
                        name={`item_${index}`}
                        value={item.item}
                        onChange={(event) => {
                          handleKeyDown(event, index);
                          handleChange(event);
                        }}
                        placeholder="Enter name"
                        onFocus={(e) => {
                          e.target.nextSibling.style.display = "block";
                        }}
                        onBlur={(e) =>
                          setTimeout(
                            () => (e.target.nextSibling.style.display = "none"),
                            200
                          )
                        }
                        autoFocus={true}
                        autoComplete="off"
                      />

                      {filter_services && (
                        <ul className="dropdown">
                          {filter_services.map((service, i) => (
                            <li
                              key={i}
                              onMouseDown={() =>
                                addItem(
                                  index,
                                  service.service_name,
                                  1,
                                  parseInt(service.price_per_day)
                                )
                              }
                            >
                              {service.service_name}
                            </li>
                          ))}
                        </ul>
                      )}
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
            <span className="summary-value total-value">₹{invoice.total}</span>
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

            <div className="wrapper_for_buttons">
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
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                type="submit"
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
    </div>
  );
}

export default InvoicePage2;
