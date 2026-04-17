import { body, param, query } from "express-validator";

export const productCreateValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("slug").trim().notEmpty().withMessage("Product slug is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").isMongoId().withMessage("Valid category id is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be 0 or greater"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be 0 or greater"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
];

export const productUpdateValidator = [
  param("productId").isMongoId().withMessage("Valid product id is required"),
];

export const productIdValidator = [
  param("productId").isMongoId().withMessage("Valid product id is required"),
];

export const productQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
];

export const categoryCreateValidator = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  body("slug").optional().trim().notEmpty().withMessage("Slug cannot be empty"),
];
