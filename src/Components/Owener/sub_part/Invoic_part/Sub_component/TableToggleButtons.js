import React, { useState, useEffect, useRef } from "react";
import "./TableToggleButton.css";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../../redux/AllData";
import { useCount } from "../../../../../redux/CountContext";


import InvoicePage2 from "./../invoicePage2.js";
import DraftInvoices from "./DraftInvoices.js";
import InvoiceForm from "./../Invoic";
import { PiInvoiceLight } from "react-icons/pi";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { FaFileInvoiceDollar } from "react-icons/fa";

const TableToggleButtons = () => {

  const [selectedTable, setSelectedTable] = useState("firstTable");
  const user = useSelector((state) => state.user);
  const { count, setCount } = useCount();


  const dropdownRef = useRef(null); // Reference for dropdown

  const handleTableToggle = (tableName, label) => {
    setSelectedTable(tableName);
    setSelectedItem(label);

    setIsDropdownOpen(false);
  };
 
  useEffect(() => {
    console.log(count);
  }, [count]);




  const [is_size_set, set_is_size_set] = useState(window.innerWidth < 650);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Select Table");

  useEffect(() => {
    const handleResize = () => {
      set_is_size_set(window.innerWidth < 650);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  useEffect(() => {
    const fetchInvoicesWithDraft = async (user_email, setCount) => {
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

    fetchInvoicesWithDraft(user.user_email, setCount);
  }, [user.user_email, setCount]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <div className={`button_con_wrap ${user.isMobile ? "for_mobile" : ""}`}>
        {selectedTable === "firstTable" && <div className="title_for_buttons">
          <h2>Invoice List</h2>
        </div>}
        {selectedTable === "secondTable" && <div className="title_for_buttons">
          <h2>Invoice Generator</h2>
        </div>}
        {selectedTable === "draftTable" && <div className="title_for_buttons">
          <h2>Draft Invoices</h2>
        </div>}
        <div className={`button_con ${is_size_set ? "set_it_null" : ""}`}>
          {/* Animated Active Button */}
          <div
            className="active_button"
            style={{
              left:
                selectedTable === "firstTable"
                  ? "0px"
                  : selectedTable === "secondTable"
                    ? "60px"
                    : "120px",
            }}
          ></div>

          {/* Buttons */}
          <button onClick={() => handleTableToggle("firstTable", "Invoice List")}>
            <PiInvoiceLight style={{ fontSize: "22px", color: selectedTable === "firstTable" ? "#4F46E5" : "black" }} />
          </button>

          <button onClick={() => handleTableToggle("secondTable", "Invoice Generator")}>
            <LiaFileInvoiceDollarSolid style={{ fontSize: "22px", color: selectedTable === "secondTable" ? "#4F46E5" : "black" }} />
          </button>

          <button onClick={() => handleTableToggle("draftTable", "Draft Invoices")}>
            <FaFileInvoiceDollar style={{ fontSize: "22px", color: selectedTable === "draftTable" ? "#4F46E5" : "black" }} />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {is_size_set && (
          <div className="select_table_button_con" ref={dropdownRef}>
            <div
              className="seleted_table_button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedItem}</span>
            </div>

            {isDropdownOpen && (
              <div className="list_down_item">
                <button onClick={() => handleTableToggle("firstTable", "Invoice List", "/Owner/Invoice")}>
                  Invoice List
                </button>
                <button onClick={() => handleTableToggle("secondTable", "Invoice Generator", "/Owner/Invoice/generator")}>
                  Invoice Generator
                </button>
                <button onClick={() => handleTableToggle("draftTable", "Draft Invoices", "/Owner/Invoice/draft")}>
                  Draft Invoices
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="table_con">
        {selectedTable === "firstTable" && <InvoiceForm />}
        {selectedTable === "secondTable" && <InvoicePage2 />}
        {selectedTable === "draftTable" && <DraftInvoices />}
      </div>



      {/* <Outlet /> */}
    </>
  );
};

export default TableToggleButtons;
