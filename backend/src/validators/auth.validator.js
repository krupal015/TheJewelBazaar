import { body } from "express-validator";

const toRequiredText = (value) => (value === undefined || value === null ? "" : String(value).trim());
const toPasswordText = (value) => (value === undefined || value === null ? "" : String(value));

export const registerValidator = [
  body("name").customSanitizer(toRequiredText).notEmpty().withMessage("Name is required"),
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
  body("password")
    .customSanitizer(toPasswordText)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const loginValidator = [
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
  body("password").customSanitizer(toPasswordText).notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
];

export const verifyOtpValidator = [
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
  body("otp")
    .customSanitizer(toRequiredText)
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
];

export const verifyRegistrationOtpValidator = verifyOtpValidator;

export const resendRegistrationOtpValidator = [
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
];

export const resetPasswordOtpValidator = [
  body("email")
    .customSanitizer((value) => toRequiredText(value).toLowerCase())
    .isEmail()
    .withMessage("A valid email is required"),
  body("otp")
    .customSanitizer(toRequiredText)
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
  body("password")
    .customSanitizer(toPasswordText)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const resetPasswordValidator = [
  body("password")
    .customSanitizer(toPasswordText)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];
