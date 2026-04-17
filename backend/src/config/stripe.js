import Stripe from "stripe";
import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";

export const getStripeClient = () => {
  if (!env.stripeSecretKey) {
    throw new ApiError(500, "Stripe secret key is not configured");
  }

  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2025-03-31.basil",
  });
};
