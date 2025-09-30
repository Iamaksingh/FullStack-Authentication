import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPasswordWithToken() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword);
      setMessage(res.message || "Password updated successfully");
      setLoading(false);
      if (res.success) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Reset Password</h2>
        <p className="helper">Enter a new password for your account</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}
