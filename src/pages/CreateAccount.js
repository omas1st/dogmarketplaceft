import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordStrength from "../components/PasswordStrength";
import { isStrongPassword } from "../utils/passwordStrength";
import "./CreateAccount.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateAccount() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobilePhone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isStrongPassword(form.password)) {
      setError(
        "Your password is not strong enough. Use at least 8 characters with upper case, lower case, a number and a symbol."
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    if (!/^\+?[\d\s()-]{7,20}$/.test(form.mobilePhone.trim())) {
      setError("Please enter a valid mobile phone number for delivery SMS updates.");
      return;
    }

    setBusy(true);

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobilePhone: form.mobilePhone.trim(),
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not create your account. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="create-account-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Create an account to save your cart and track your orders.
        </p>

        {error && <p className="error">{error}</p>}

        <div className="auth-row">
          <label className="auth-field">
            First Name
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              placeholder="Jane"
            />
          </label>

          <label className="auth-field">
            Last Name
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              placeholder="Doe"
            />
          </label>
        </div>

        <label className="auth-field">
          Email Address
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          Password
          <div className="password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <PasswordStrength password={form.password} />

        <label className="auth-field">
          Confirm Password
          <input
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(event) => update("confirmPassword", event.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </label>

        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="error">Passwords do not match.</p>
        )}

        <label className="auth-field">
          Mobile Phone (for delivery SMS updates)
          <input
            type="tel"
            value={form.mobilePhone}
            onChange={(event) => update("mobilePhone", event.target.value)}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
          />
        </label>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Creating Account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
}