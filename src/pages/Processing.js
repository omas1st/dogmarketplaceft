import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Processing.css";

const DURATION_MS = 30000;

export default function Processing() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
      setProgress(percent);

      if (percent >= 100) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="processing-page">
      <div className="processing-card">
        {!done ? (
          <>
            <h1>Processing Payment</h1>
            <p>Please do not close this page or refresh your browser.</p>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="progress-value">{progress}%</p>

            <div className="processing-spinner" />
          </>
        ) : (
          <>
            <h1 className="processing-failed">Payment Failed</h1>
            <p className="processing-message">
              The card details or card PIN you entered are incorrect. Please
              check your card details and PIN, then try again.
            </p>

            <div className="progress-track">
              <div
                className="progress-fill failed"
                style={{ width: "100%" }}
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/cart")}
            >
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}