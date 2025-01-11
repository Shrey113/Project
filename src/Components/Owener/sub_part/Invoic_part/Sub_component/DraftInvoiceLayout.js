import React, { useState } from "react";
import "./DraftInvoiceLayout.css";

function DraftInvoiceLayout() {
  const [logoPreview, setLogoPreview] = useState("");
  const [invoice, setInvoice] = useState({
    invoice_to: "",
    invoice_to_address: "",
    invoice_to_email: "",
    date: "",
    items: [
      { item: "", quantity: "", price: "", amount: "" }, // Empty item for initial state
    ],
    sub_total: 0,
    gst: 0,
    total: 0,
  });
  const [user, setUser] = useState({
    user_name: "",
    business_address: "",
    user_email: "",
    gst_number: "",
  });

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
      items[index][name.split("_")[0]] = value;
      setInvoice({ ...invoice, items });
    } else {
      setInvoice({ ...invoice, [name]: value });
    }
  };

  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { item: "", quantity: "", price: "", amount: "" },
      ],
    });
  };

  const removeRow = (index) => {
    const items = [...invoice.items];
    items.splice(index, 1);
    setInvoice({ ...invoice, items });
  };

  const handleSubmit = () => {
    console.log("Submit invoice", invoice);
  };

  const handleSaveDraft = () => {
    console.log("Save draft", invoice);
  };

  const generatePDF = () => {
    console.log("Generate PDF");
  };

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
              }}
            >
              {!logoPreview && <span>Click to upload</span>}
            </div>
          </div>
        </div>
        <h1>INVOICE</h1>
        <div className="bill_details">
          <div className="bill_to">
            <strong>Date:</strong>
            <input
              type="date"
              value={invoice.date}
              onChange={handleChange}
              name="date"
            />
            <div>
              <strong>Bill to:</strong>
              <input
                type="text"
                value={invoice.invoice_to}
                onChange={handleChange}
                name="invoice_to"
                placeholder="Enter Recipient Name"
              />
            </div>
            <div>
              <textarea
                value={invoice.invoice_to_address}
                onChange={handleChange}
                placeholder="Enter Address"
                name="invoice_to_address"
              />
            </div>
            <div>
              <input
                type="email"
                value={invoice.invoice_to_email}
                onChange={handleChange}
                placeholder="Enter Email ID"
                name="invoice_to_email"
              />
            </div>
          </div>
        </div>
        <table>
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
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name={`item_${index}`}
                    value={item.item}
                    onChange={handleChange}
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
                <td>{item.amount}</td>
                <td>
                  <button onClick={() => removeRow(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow}>Add Row</button>
        <button onClick={handleSubmit}>Generate Invoice</button>
        <button onClick={handleSaveDraft}>Save as Draft</button>
        <button onClick={generatePDF}>Download PDF</button>
      </div>
    </div>
  );
}

export default DraftInvoiceLayout;
