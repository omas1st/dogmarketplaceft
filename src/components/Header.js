import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="Dog Marketplace"
            className="brand-logo"
          />
          <span className="brand-name">Dog Marketplace</span>
        </Link>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="cart-btn"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open cart"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="cart-label">Cart</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>

        <div className="menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <span className="menu-btn-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="menu-btn-text">Menu</span>
          </button>

          {menuOpen && (
            <div className="menu-dropdown">
              {!user && (
                <>
                  <Link to="/signin" onClick={closeMenu}>
                    Sign In
                  </Link>
                  <Link to="/create-account" onClick={closeMenu}>
                    Create Account
                  </Link>
                </>
              )}

              {user && !isAdmin && (
                <>
                  <Link to="/dashboard" onClick={closeMenu}>
                    My Dashboard
                  </Link>
                  <Link to="/cart" onClick={closeMenu}>
                    My Cart
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin" onClick={closeMenu}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/items/new" onClick={closeMenu}>
                    Add New Item
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {user && (
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}