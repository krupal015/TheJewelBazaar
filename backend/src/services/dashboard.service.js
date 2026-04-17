import Order from "../models/Order.js";
import User from "../models/User.js";

export const getDashboardStats = async () => {
  const [salesAgg, totalOrders, totalUsers, pendingOrders, recentOrders] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]),
    Order.countDocuments(),
    User.countDocuments(),
    Order.countDocuments({ orderStatus: { $in: ["pending", "processing", "shipped"] } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email"),
  ]);

  return {
    totalSales: salesAgg[0]?.totalSales || 0,
    totalOrders,
    totalUsers,
    pendingOrders,
    recentOrders,
  };
};
