import { Server_url } from "../../../../redux/AllData";

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
    setDraftInvoices(with_draft);
    setDraftCount(with_draft.length);
    console.log("Fetched draft invoices:", with_draft);
  } catch (error) {
    console.error("Error fetching invoices with draft:", error);
    // setError("Failed to load invoices. Please try again later.");
    setDraftInvoices([]);
  } finally {
    // setLoading(false);
  }
};

const fetchInvoicesWithoutDraft = async (user_email) => {
  try {
    setLoading(true);
    const response = await fetch(`${Server_url}/invoices/without-draft`, {
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
    console.log("Fetched invoices without draft:", without_draft);
  } catch (error) {
    console.error("Error fetching invoices without draft:", error);
    setError("Failed to load invoices. Please try again later.");
    setInvoices([]);
  } finally {
    setLoading(false);
  }
};

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

export { fetchInvoicesWithDraft, fetchInvoicesWithoutDraft, generateInvoice };
