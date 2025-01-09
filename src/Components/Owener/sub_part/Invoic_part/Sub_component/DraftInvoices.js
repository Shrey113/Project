import React, { useEffect, useState } from "react";
import { Server_url } from "./../../../../../redux/AllData";
import { useSelector } from "react-redux";

function DraftInvoices({ fetchDraftInvoices, draftInvoices }) {
  const draftCount = draftInvoices.length;
  const user_email = useSelector((state) => state.user.user_email);

  useEffect(() => {
    fetchDraftInvoices();
  }, [user_email]);
  return (
    <div>
      {draftCount === 0 ? (
        <p
          style={{
            color: "black",
            fontSize: "14px",
            fontFamily: "raleway",
            marginTop: "50px",
            fontWeight: "600",
          }}
        >
          No Draft Invoices Available
        </p>
      ) : (
        <>
          {draftInvoices.map((invoice) => (
            <div>
              <div>{invoice.invoice_id}</div>
              <div>{invoice.invoice_to}</div>
              <div>{invoice.user_email}</div>
              <div>{invoice.date}</div>
              <div>{invoice.sub_total}</div>
              <div>{invoice.total}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default DraftInvoices;
