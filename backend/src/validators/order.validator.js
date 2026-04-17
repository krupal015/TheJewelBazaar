import { body, param } from "express-validator";

export const createOrderValidator = [
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required"),
  body("shippingAddress.line1").trim().notEmpty().withMessage("Address line1 is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
  body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),
];

export const orderIdValidator = [
  param("orderId").isMongoId().withMessage("Valid order id is required"),
];

export const updateOrderStatusValidator = [
  param("orderId").isMongoId().withMessage("Valid order id is required"),
  body("orderStatus")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
];

export const verifyPaymentValidator = [
  param("orderId").isMongoId().withMessage("Valid order id is required"),
  body("razorpayOrderId").trim().notEmpty().withMessage("Razorpay order id is required"),
  body("razorpayPaymentId").trim().notEmpty().withMessage("Razorpay payment id is required"),
  body("razorpaySignature").trim().notEmpty().withMessage("Razorpay payment signature is required"),
];
