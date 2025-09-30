import { useState, useEffect } from "react";
import { resendEmailVerification } from "../api/auth";

export default function ResendVerification() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  const handleResend = async () => {
    setLoading(true);
    const res = await resendEmailVerification();
    setMessage(res.message || "Verification email sent!");
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        <p>You must be logged in to resend verification email.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Resend Verification Email</h2>
        <p className="helper">We’ll send a fresh verification link to your inbox</p>
        <button className="btn" onClick={handleResend} disabled={loading}>
          {loading ? "Sending..." : "Resend Email"}
        </button>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}
