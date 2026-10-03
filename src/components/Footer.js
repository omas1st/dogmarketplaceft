import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img
            src="/logo.png"
            alt="Dog Marketplace"
            className="footer-brand-logo"
          />
          <div className="footer-brand-text">
            <span className="footer-brand-name">Dog Marketplace</span>
            <span className="footer-brand-tag">
              Thoughtful canine supplies, wellness, and adoption.
            </span>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/">Shop</Link>
          <Link to="/signin">Sign In</Link>
        </nav>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Dog Marketplace. All rights reserved.
        </span>
        <span className="footer-contact">
          <a href="mailto:support@dogmarketplace.online">
            support@dogmarketplace.online
          </a>
          <span className="footer-dot">·</span>
          <a href="tel:+12137564853">+1 213 756 4853</a>
        </span>
      </div>
    </footer>
  );
}