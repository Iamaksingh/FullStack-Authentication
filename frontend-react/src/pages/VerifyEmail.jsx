import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // make sure path is correct

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");
  const { setUser } = useAuth(); // get setUser from context

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/v1/auth/verify-email/${token}`);
        if (!res.ok) throw new Error("Verification failed");
        const data = await res.json();

        // update auth context and localStorage so profile updates automatically
        setUser(prev => {
          const updated = { ...(prev || {}), isEmailVerified: true };
          try {
            localStorage.setItem("user", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        setMessage("✅ Email verified successfully! You can close this tab.");
      } catch (err) {
        setMessage("❌ Verification failed or token expired.");
        console.error(err);
      }
    };
    verify();
  }, [token, setUser]);

  return (
    <div className="container">
      <div className="card center">
        <h2>Email Verification</h2>
        <p className="status">{message}</p>
      </div>
    </div>
  );
}