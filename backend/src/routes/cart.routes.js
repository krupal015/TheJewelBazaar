import { Router } from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addToCartValidator,
  cartItemParamValidator,
  updateCartItemValidator,
} from "../validators/cart.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/", validate(addToCartValidator), addToCart);
router.patch("/:productId", validate(updateCartItemValidator), updateCartItem);
router.delete("/:productId", validate(cartItemParamValidator), removeCartItem);
router.delete("/", clearCart);

export default router;
