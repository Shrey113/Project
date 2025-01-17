import React, { useEffect } from "react";
import "./TableToggleButton.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Server_url } from "../../../../../redux/AllData";
import { useCount } from "../../../../../redux/CountContext";

const TableToggleButtons = ({ selectedTable, setSelectedTable }) => {
  const user = useSelector((state) => state.user);
  const { count, setCount } = useCount();
  const navigate = useNavigate();
  const handleTableToggle = (tableName) => {
    setSelectedTable(tableName);
  };

  const fetchInvoicesWithDraft = async (user_email,setCount) => {
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
      setCount(with_draft.length);
    } catch (error) {
      console.error("Error fetching invoices with draft:", error);
      setCount(0);
    }
  };
  useEffect(() => {
    fetchInvoicesWithDraft(user.user_email,setCount);
  }, [user.user_email,setCount]);
  const active_button_left =
    selectedTable === "firstTable"
      ? "0px"
      : selectedTable === "secondTable"
      ? "180px"
      : "360px";

  // console.log("Selected Table:", selectedTable);
  // console.log("Active Button Left:", active_button_left);
  // const fetchInvoicesWithDraft = async (user_email) => {
  //   try {
  //     // setLoading(true);
  //     const response = await fetch(`${Server_url}/invoices/with-draft`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ user_email: user_email }),
  //     });
  //     const data = await response.json();
  //     const with_draft = Array.isArray(data.with_draft)
  //       ? [...data.with_draft].sort((a, b) => a.invoice_id - b.invoice_id)
  //       : [];
  //     console.log("Fetched draft invoices:", with_draft);
  //     setCount(with_draft.length);
  //   } catch (error) {
  //     console.error("Error fetching invoices with draft:", error);
  //     setCount(0);
  //   }
  // };
  // useEffect(() => {
  //   fetchInvoicesWithDraft(user?.user_email);
  // }, [user?.user_email]);
  return (
    <>
      <div className="button_con_wrap">
        <div className="button_con">
          {/* Animated Active Button */}
          <div
            className="active_button"
            style={{ left: active_button_left }}
          ></div>

          {/* Buttons */}
          <button
            onClick={() => {
              handleTableToggle("firstTable");
              navigate("/Owner/Invoice");
            }}
          >
            <span>Invoice List</span>
          </button>

          <button
            onClick={() => {
              handleTableToggle("secondTable");
              navigate("/Owner/Invoice/generator");
            }}
          >
            <span>Invoice Generator</span>
          </button>

          <button
            onClick={() => {
              handleTableToggle("draftTable");
              navigate("/Owner/Invoice/draft");
            }}
          >
            <div
              className="draft_count"
              style={{
                position: "absolute",
                top: "0px",
                right: "10px",
                padding: "2px 7px",
                backgroundColor: "lightblue",
                borderRadius: "50%",
              }}
            >
              {count}
            </div>
            <span>Draft Invoices</span>
          </button>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default TableToggleButtons;
