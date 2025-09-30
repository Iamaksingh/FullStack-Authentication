import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await registerUser(form);
    console.log("Register API response:", res);

    setMessage(res.message);

    if (res.success) {
      // Optional: save token if backend sends it, or just redirect to login
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create an account</h2>
        <p className="helper">Join us to access your dashboard</p>
        <form className="form" onSubmit={handleSubmit}>
          <p style={{ color: "gray", fontSize: "0.9rem", marginTop: "10px" }}>
              ⚠️ Note: Since this app is running on Render free tier, emails are not delivered to inboxes. They are captured in a test inbox (Mailtrap) for demo purposes.
          </p>
          <input
            className="input"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
            required
          />
          <input
            className="input"
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            required
          />
          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            required
          />
          <button className="btn" type="submit">Register</button>
        </form>
        <div className="actions">
          <Link className="muted-link" to="/forgot-password">Forgot password?</Link>
          <div className="row">
            <span className="muted-link">Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>
        </div>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}