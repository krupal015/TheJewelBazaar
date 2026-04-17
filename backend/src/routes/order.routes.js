import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  verifyOrderPayment,
} from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderValidator,
  orderIdValidator,
  verifyPaymentValidator,
} from "../validators/order.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", getMyOrders);
router.get("/:orderId", validate(orderIdValidator), getOrderById);
router.post("/", validate(createOrderValidator), createOrder);
router.post("/:orderId/verify-payment", validate(verifyPaymentValidator), verifyOrderPayment);

export default router;
