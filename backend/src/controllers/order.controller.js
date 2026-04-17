import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { env } from "../config/env.js";
import { calculateOrderTotals, ensureCartHasItems } from "../services/order.service.js";
import { createOrderPaymentIntent, verifyPaymentIntent } from "../services/payment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  ensureCartHasItems(cart);

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0]?.url || "",
    quantity: item.quantity,
    priceAtPurchase: item.product.discountPrice || item.product.price,
  }));

  const totals = calculateOrderTotals(orderItems);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "razorpay",
    ...totals,
  });

  let paymentIntent;
  try {
    paymentIntent = await createOrderPaymentIntent({
      orderId: order._id,
      amount: order.totalPrice,
    });
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    throw error;
  }

  order.paymentOrderId = paymentIntent.id;
  await order.save();

  res.status(201).json(
    new ApiResponse("Order created successfully", {
      order,
      payment: {
        provider: "razorpay",
        keyId: env.razorpayKeyId,
        orderId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    }),
  );
});

export const verifyOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order || String(order.user) !== String(req.user._id)) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json(new ApiResponse("Payment already verified", order));
  }

  const paymentIntent = await verifyPaymentIntent({
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpaySignature: req.body.razorpaySignature,
  });

  if (order.paymentOrderId && order.paymentOrderId !== paymentIntent.order_id) {
    throw new ApiError(400, "Payment does not match this order");
  }

  order.paymentStatus = "paid";
  order.orderStatus = "processing";
  order.paymentMethod = "razorpay";
  order.paymentOrderId = paymentIntent.order_id;
  order.paymentId = paymentIntent.id;
  order.paymentSignature = req.body.razorpaySignature;
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(200).json(new ApiResponse("Payment verified successfully", order));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse("Order history fetched successfully", orders));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate("items.product");

  if (!order || String(order.user) !== String(req.user._id)) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse("Order fetched successfully", order));
});
