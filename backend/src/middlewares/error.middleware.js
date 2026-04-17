import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];
    const duplicateValue = duplicateField ? error.keyValue?.[duplicateField] : null;

    return res.status(409).json({
      success: false,
      message: duplicateField
        ? `${duplicateField.toUpperCase()} already exists${duplicateValue ? `: ${duplicateValue}` : ""}`
        : "A record with that value already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};
