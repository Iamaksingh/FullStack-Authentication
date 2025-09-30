import { Router } from "express";
import {registerUser,loginUser,logoutUser,getCurrentUser,verifyEmail,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,resendVerificationEmail,resetPassword} from "../controllers/auth.controllers.js";
import {userRegisterValidator,emailValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPassword} from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(emailValidator(),validate,loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);

//send email if user forget password
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest)
//the email redirects to this page 
router.route("/reset-password/:resetToken").post(userResetForgotPassword(),validate,resetForgotPassword);

//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validate,resetPassword);
router.route("/resend-email-verification").post(verifyJWT,resendVerificationEmail);

export default router;