import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SignIn.css";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setBusy(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(location.state?.from || "/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sign in failed. Please check your email and password."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <p className="auth-subtitle">
          Sign in to track your orders. You can still browse and checkout as a
          guest.
        </p>

        {error && <p className="error">{error}</p>}

        <label className="auth-field">
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          Password
          <div className="password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Signing In..." : "Sign In"}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/create-account">Create Account</Link>
        </p>
      </form>
    </div>
  );
}