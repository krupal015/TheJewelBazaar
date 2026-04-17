import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  getProfile,
  login,
  refreshSession,
  register,
  resendForgotPasswordOtp,
  resendRegistrationOtp,
  resetPassword,
  verifyForgotPasswordOtp,
  verifyRegistrationOtp,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordOtpValidator,
  resendRegistrationOtpValidator,
  verifyOtpValidator,
  verifyRegistrationOtpValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), register);
router.post("/register/verify-otp", validate(verifyRegistrationOtpValidator), verifyRegistrationOtp);
router.post("/register/resend-otp", validate(resendRegistrationOtpValidator), resendRegistrationOtp);
router.post("/login", validate(loginValidator), login);
router.post("/admin/login", validate(loginValidator), adminLogin);
router.post("/refresh", refreshSession);
router.post("/forgot-password", validate(forgotPasswordValidator), forgotPassword);
router.post("/forgot-password/verify-otp", validate(verifyOtpValidator), verifyForgotPasswordOtp);
router.post("/forgot-password/resend-otp", validate(forgotPasswordValidator), resendForgotPasswordOtp);
router.post("/forgot-password/reset", validate(resetPasswordOtpValidator), resetPassword);
router.get("/me", authenticate, getProfile);

export default router;
