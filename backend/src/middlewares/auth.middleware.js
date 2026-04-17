import User from "../models/User.js";
import { verifyAccessToken } from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../utils/constants.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid authentication token");
  }

  if (user.role !== USER_ROLES.ADMIN && !user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email with OTP before accessing this resource");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }

  next();
};
