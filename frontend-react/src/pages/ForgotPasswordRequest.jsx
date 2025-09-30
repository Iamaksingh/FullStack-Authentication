import { useState } from "react";
import { requestPasswordReset } from "../api/auth";

export default function ForgotPasswordRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message || "If an account exists, a reset email was sent.");
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Forgot Password</h2>
        <p className="helper">Enter your email and we'll send a reset link</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p className={`status ${message.toLowerCase().includes('success') ? 'success' : ''}`}>{message}</p>}
      </div>
    </div>
  );
}


