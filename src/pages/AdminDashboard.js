import React, { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminMarketplace from "./AdminMarketplace";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          className={`admin-tab ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          User Details
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === "marketplace"}
          className={`admin-tab ${tab === "marketplace" ? "active" : ""}`}
          onClick={() => setTab("marketplace")}
        >
          Marketplace
        </button>
      </div>

      <div className="admin-tab-panel">
        {tab === "users" ? <AdminUsers /> : <AdminMarketplace />}
      </div>
    </div>
  );
}