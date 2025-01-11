import React from "react";
import "./TableToggleButton.css";
import { Outlet, useNavigate } from "react-router-dom";

const TableToggleButtons = ({
  draftCount,
  selectedTable,
  setSelectedTable,
}) => {
  const navigate = useNavigate();
  const handleTableToggle = (tableName) => {
    setSelectedTable(tableName);
  };

  const active_button_left =
    selectedTable === "firstTable"
      ? "0px"
      : selectedTable === "secondTable"
      ? "180px"
      : "360px";

  // console.log("Selected Table:", selectedTable);
  // console.log("Active Button Left:", active_button_left);
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
          <span>Draft Invoices</span>
        </button>
      </div>
    </div>
    <Outlet/>
    </>
  );
};

export default TableToggleButtons;
