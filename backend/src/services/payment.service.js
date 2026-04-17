import { getStripeClient } from "../config/stripe.js";
import { ApiError } from "../utils/ApiError.js";

export const createOrderPaymentIntent = async ({ orderId, amount, currency = "inr" }) => {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: {
      orderId: String(orderId),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
};

export const verifyPaymentIntent = async (paymentIntentId) => {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent) {
    throw new ApiError(404, "Payment intent not found");
  }

  return paymentIntent;
};
