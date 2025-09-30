import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/login");
      return;
    }

    setUser(savedUser);
  }, [setUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome, {user.username}!</h2>
        <p className="helper">Manage your account settings</p>
        <div className="divider"></div>
        <div className="form">
          <div className="row"><span className="muted-link">Email</span><span>{user.email}</span></div>
          <div className="row"><span className="muted-link">Verified</span><span>{user.isEmailVerified ? "Yes" : "No"}</span></div>
          <div className="row"><span className="muted-link">Joined</span><span>{new Date(user.createdAt).toLocaleDateString()}</span></div>
        </div>
        <div className="actions">
          {!user.isEmailVerified && (
            <Link className="btn" to="/resend-verification">Resend verification email</Link>
          )}
          <Link className="btn" to="/reset-password">Change password</Link>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
