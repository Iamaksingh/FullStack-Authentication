import { useState, useEffect } from "react";
import { changePassword, getCurrentUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for valid token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await getCurrentUser(token);
        if (!res.success) {
          // Token invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    checkToken();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await changePassword(form.oldPassword, form.newPassword);
      setMessage(res.message || "Password updated successfully");
      setLoading(false);

      if (res.success) {
        // Log out after password change
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
        <h2>Change Password</h2>
        <p className="helper">For your security, you’ll be logged out after changing</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="password"
            name="oldPassword"
            placeholder="Current Password"
            value={form.oldPassword}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}
