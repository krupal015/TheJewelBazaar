import crypto from "crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ensureRazorpayConfigured = () => {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new ApiError(503, "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.");
  }
};

const requestRazorpay = async (path, options = {}) => {
  ensureRazorpayConfigured();

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.description || payload?.error?.reason || "Unable to communicate with Razorpay",
    );
  }

  return payload;
};

export const createOrderPaymentIntent = async ({ orderId, amount, currency = "INR" }) =>
  requestRazorpay("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: Math.round(Number(amount || 0) * 100),
      currency: String(currency || "INR").toUpperCase(),
      receipt: String(orderId),
      notes: {
        appOrderId: String(orderId),
      },
    }),
  });

export const verifyPaymentIntent = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  ensureRazorpayConfigured();

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const providedSignature = String(razorpaySignature || "");
  const signatureMatches =
    providedSignature.length === expectedSignature.length
    && crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature));

  if (!signatureMatches) {
    throw new ApiError(400, "Payment signature verification failed");
  }

  const payment = await requestRazorpay(`/payments/${razorpayPaymentId}`, {
    method: "GET",
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.order_id !== razorpayOrderId) {
    throw new ApiError(400, "Payment does not belong to the expected Razorpay order");
  }

  if (!["authorized", "captured"].includes(String(payment.status || "").toLowerCase())) {
    throw new ApiError(400, "Payment has not been completed");
  }

  return payment;
};
