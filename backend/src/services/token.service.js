import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const createHashedToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  return {
    rawToken,
    hashedToken,
    expiresAt,
  };
};

export const hashIncomingToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
