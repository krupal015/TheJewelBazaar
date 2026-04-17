import Order from "../models/Order.js";
import User from "../models/User.js";
import { getDashboardStats } from "../services/dashboard.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse("Users fetched successfully", users));
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate({
      path: "items.product",
      select: "name metalType category",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse("Orders fetched successfully", orders));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = req.body.orderStatus;
  await order.save();

  res.status(200).json(new ApiResponse("Order status updated successfully", order));
});

export const getDashboard = asyncHandler(async (_req, res) => {
  const stats = await getDashboardStats();
  res.status(200).json(new ApiResponse("Dashboard stats fetched successfully", stats));
});
