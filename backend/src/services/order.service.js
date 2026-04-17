import { ApiError } from "../utils/ApiError.js";

export const calculateOrderTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 5000 ? 0 : 250;
  const tax = Number((subtotal * 0.03).toFixed(2));
  const totalPrice = subtotal + shippingFee + tax;

  return {
    subtotal,
    shippingFee,
    tax,
    totalPrice,
  };
};

export const ensureCartHasItems = (cart) => {
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }
};
