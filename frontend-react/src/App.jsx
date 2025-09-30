import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ForgotPasswordWithToken from "./pages/ForgotPassword"
import ForgotPasswordRequest from "./pages/ForgotPasswordRequest";
import ResendVerification from "./pages/ResendVerification";
import VerifyEmail from "./pages/VerifyEmail";

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
