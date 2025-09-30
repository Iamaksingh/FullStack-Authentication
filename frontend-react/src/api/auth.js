const API_BASE = "https://fullstack-authentication-xwe7.onrender.com/api/v1";

export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  return data;
};

export const loginUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, { // <-- add /auth here
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Login API error:", err);
    return { success: false, message: "Network error" };
  }
};

//reset from old and new password
export const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
};


//reset from mail 
export const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });
  return res.json();
};

export const getCurrentUser = async (token) => {
  const res = await fetch(`${API_BASE}/auth/current-user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// forgot password: request reset link to be sent to email
export const requestPasswordReset = async (email) => {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (err) {
    console.error("Forgot password request error:", err);
    return { success: false, message: "Network error" };
  }
};

// resend verification email
export const resendEmailVerification = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };

  try {
    const res = await fetch(`${API_BASE}/auth/resend-email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Resend email verification error:", err);
    return { success: false, message: "Network error" };
  }
};

export const verifyEmail = async (token) => {
  const res = await fetch(`${API_BASE}/auth/verify-email/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};
