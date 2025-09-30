import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await loginUser(form); // res = full apiResponse
    console.log("API response:", res);

    setMessage(res.message || "Login attempt complete");

    if (res.success && res.data?.accessToken) {
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.loggedUser));
      setUser(res.data.loggedUser);
      navigate("/profile");
    }
  } catch (err) {
    console.error(err);
    setMessage("Something went wrong. Please try again.");
  }
};

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome back</h2>
        <p className="helper">Sign in to continue to your dashboard</p>
        <form className="form" onSubmit={handleSubmit}>
          <input className="input" name="email" placeholder="Email" onChange={handleChange} required />
          <input className="input" name="password" placeholder="Password" type="password" onChange={handleChange} required />
          <button className="btn" type="submit">Login</button>
        </form>
        <div className="actions">
          <Link className="muted-link" to="/forgot-password">Forgot password?</Link>
          <div className="row">
            <span className="muted-link">Don't have an account?</span>
            <Link to="/register">Register</Link>
          </div>
        </div>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}
