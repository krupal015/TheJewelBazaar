import crypto from "crypto";
import User from "../models/User.js";
import {
  getOtpDeliveryNotice,
  sendForgotPasswordOtpEmail,
  sendRegistrationOtpEmail,
  shouldExposeDebugOtp,
} from "../services/email.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";

const normalizeName = (value) => String(value ?? "").trim();
const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
const normalizePassword = (value) => String(value ?? "");
const normalizeOtp = (value) => String(value ?? "").replace(/\D/g, "");
const normalizePhone = (value) => String(value ?? "").trim();
const normalizeAddress = (value) => String(value ?? "").trim();
const EMAIL_OTP_EXPIRY_MINUTES = 10;

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const createEmailOtp = () => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + EMAIL_OTP_EXPIRY_MINUTES * 60 * 1000);

  return {
    otp,
    hashedOtp: hashOtp(otp),
    expiresAt,
  };
};

const buildOtpPayload = (email, otp) => ({
  email,
  expiresInMinutes: EMAIL_OTP_EXPIRY_MINUTES,
  deliveryNotice: getOtpDeliveryNotice(),
  ...(shouldExposeDebugOtp() ? { debugOtp: otp } : {}),
});

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  address: user.address || "",
  role: user.role,
});

const buildAuthResponse = async (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
};

export const register = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = normalizePassword(req.body.password);

  const existingVerifiedUser = await User.findOne({ email, isEmailVerified: true });
  if (existingVerifiedUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const { otp, hashedOtp, expiresAt } = createEmailOtp();
  let user = await User.findOne({ email });

  if (user) {
    user.name = name;
    user.password = password;
    user.role = USER_ROLES.USER;
    user.isEmailVerified = false;
    user.emailVerificationOtp = hashedOtp;
    user.emailVerificationOtpExpires = expiresAt;
    user.refreshToken = null;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      password,
      role: USER_ROLES.USER,
      isEmailVerified: false,
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpires: expiresAt,
    });
  }

  const emailResult = await sendRegistrationOtpEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  res.status(200).json(
    new ApiResponse(
      emailResult?.deliveryMode === "mailtrap-sandbox"
        ? "Verification OTP generated for development."
        : "Verification OTP sent successfully",
      buildOtpPayload(user.email, otp),
    ),
  );
});

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = normalizeOtp(req.body.otp);
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "Registration not found for this email");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified. Please login.");
  }

  if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date()) {
    throw new ApiError(400, "OTP is invalid or expired. Please request a new OTP.");
  }

  if (hashOtp(otp) !== user.emailVerificationOtp) {
    throw new ApiError(400, "OTP is invalid or expired. Please try again.");
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = null;
  user.emailVerificationOtpExpires = null;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse("Email verified successfully. Please login to continue.", {
      email: user.email,
      verified: true,
    }),
  );
});

export const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "Registration not found for this email");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified. Please login.");
  }

  const { otp, hashedOtp, expiresAt } = createEmailOtp();
  user.emailVerificationOtp = hashedOtp;
  user.emailVerificationOtpExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendRegistrationOtpEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  res.status(200).json(
    new ApiResponse(
      emailResult?.deliveryMode === "mailtrap-sandbox"
        ? "Verification OTP regenerated for development."
        : "Verification OTP resent successfully",
      buildOtpPayload(user.email, otp),
    ),
  );
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = normalizePassword(req.body.password);
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role !== USER_ROLES.ADMIN && !user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email with OTP before logging in");
  }

  const response = await buildAuthResponse(user);
  res.status(200).json(new ApiResponse("Login successful", response));
});

export const adminLogin = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = normalizePassword(req.body.password);
  const user = await User.findOne({ email });

  if (!user || user.role !== USER_ROLES.ADMIN || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const response = await buildAuthResponse(user);
  res.status(200).json(new ApiResponse("Admin login successful", response));
});

export const refreshSession = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.role !== USER_ROLES.ADMIN && !user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email with OTP before logging in");
  }

  const response = await buildAuthResponse(user);
  res.status(200).json(new ApiResponse("Session refreshed", response));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { otp, hashedOtp, expiresAt } = createEmailOtp();
  user.passwordResetToken = hashedOtp;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendForgotPasswordOtpEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  res.status(200).json(
    new ApiResponse(
      emailResult?.deliveryMode === "mailtrap-sandbox"
        ? "Password reset OTP generated for development."
        : "Password reset OTP sent successfully",
      buildOtpPayload(user.email, otp),
    ),
  );
});

export const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = normalizeOtp(req.body.otp);
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.passwordResetToken || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(400, "OTP is invalid or expired. Please request a new OTP.");
  }

  if (hashOtp(otp) !== user.passwordResetToken) {
    throw new ApiError(400, "OTP is invalid or expired. Please try again.");
  }

  res.status(200).json(new ApiResponse("OTP verified successfully", { email: user.email }));
});

export const resendForgotPasswordOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { otp, hashedOtp, expiresAt } = createEmailOtp();
  user.passwordResetToken = hashedOtp;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendForgotPasswordOtpEmail({
    email: user.email,
    name: user.name,
    otp,
  });

  res.status(200).json(
    new ApiResponse(
      emailResult?.deliveryMode === "mailtrap-sandbox"
        ? "Password reset OTP regenerated for development."
        : "Password reset OTP resent successfully",
      buildOtpPayload(user.email, otp),
    ),
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = normalizeOtp(req.body.otp);
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.passwordResetToken || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(400, "OTP is invalid or expired. Please request a new OTP.");
  }

  if (hashOtp(otp) !== user.passwordResetToken) {
    throw new ApiError(400, "OTP is invalid or expired. Please try again.");
  }

  user.password = normalizePassword(req.body.password);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshToken = null;
  await user.save();

  res.status(200).json(new ApiResponse("Password reset successful"));
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse("Profile fetched successfully", serializeUser(req.user)));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.name = normalizeName(req.body.name) || user.name;
  user.phone = normalizePhone(req.body.phone) || "";
  user.address = normalizeAddress(req.body.address) || "";
  await user.save();

  res.status(200).json(new ApiResponse("Profile updated successfully", serializeUser(user)));
});
