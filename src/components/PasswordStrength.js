import React from "react";
import {
  passwordChecks,
  scorePassword,
  strengthMeta,
  passwordRequirements,
} from "../utils/passwordStrength";
import "./PasswordStrength.css";

export default function PasswordStrength({ password = "" }) {
  const score = scorePassword(password);
  const meta = strengthMeta(score);
  const checks = passwordChecks(password);
  const percent = (score / 5) * 100;

  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        <div
          className="password-strength-fill"
          style={{ width: `${percent}%`, backgroundColor: meta.color }}
        />
      </div>

      <p className="password-strength-label" style={{ color: meta.color }}>
        Password strength: <strong>{password ? meta.label : "—"}</strong>
      </p>

      <ul className="password-requirements">
        {passwordRequirements.map((requirement) => (
          <li
            key={requirement.key}
            className={checks[requirement.key] ? "met" : ""}
          >
            {checks[requirement.key] ? "✓" : "○"} {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  );
}