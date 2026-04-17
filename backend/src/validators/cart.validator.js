import { body, param } from "express-validator";

export const addToCartValidator = [
  body("productId").isMongoId().withMessage("Valid product id is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const updateCartItemValidator = [
  param("productId").isMongoId().withMessage("Valid product id is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const cartItemParamValidator = [
  param("productId").isMongoId().withMessage("Valid product id is required"),
];
