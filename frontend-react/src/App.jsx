import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPasswordWithToken from "./pages/ForgotPassword.jsx"
import ForgotPasswordRequest from "./pages/ForgotPasswordRequest.jsx";
import ResendVerification from "./pages/ResendVerification.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
      <Route path="/forgot-password/:resetToken" element={<ForgotPasswordWithToken />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </BrowserRouter>
  );
}



export default App;
