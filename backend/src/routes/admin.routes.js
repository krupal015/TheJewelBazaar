import { Router } from "express";
import {
  getAllOrders,
  getAllUsers,
  getDashboard,
  updateOrderStatus,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import { updateOrderStatusValidator } from "../validators/order.validator.js";

const router = Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));
router.get("/users", getAllUsers);
router.get("/orders", getAllOrders);
router.get("/dashboard", getDashboard);
router.patch("/orders/:orderId/status", validate(updateOrderStatusValidator), updateOrderStatus);

export default router;
