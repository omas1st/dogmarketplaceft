import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ItemForm from "../components/ItemForm";
import "./AddItem.css";

export default function AddItem() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (payload) => {
    setBusy(true);
    setError("");

    try {
      await API.post("/products", payload);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "The item could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="add-item-page">
      <h1>Add New Item</h1>
      {error && <p className="error">{error}</p>}
      <ItemForm
        onSubmit={handleSubmit}
        submitLabel="Save & Publish Item"
        busy={busy}
      />
    </div>
  );
}