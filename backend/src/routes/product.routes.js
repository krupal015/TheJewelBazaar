import { Router } from "express";
import {
  createCategory,
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  listProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  categoryCreateValidator,
  productCreateValidator,
  productIdValidator,
  productQueryValidator,
  productUpdateValidator,
} from "../validators/product.validator.js";

const router = Router();

router.get("/", validate(productQueryValidator), listProducts);
router.get("/categories", listCategories);
router.get("/:productId", validate(productIdValidator), getProductById);

router.post("/", authenticate, authorize(USER_ROLES.ADMIN), validate(productCreateValidator), createProduct);
router.patch(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(productUpdateValidator),
  updateProduct,
);
router.delete("/:productId", authenticate, authorize(USER_ROLES.ADMIN), validate(productIdValidator), deleteProduct);
router.post(
  "/categories",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(categoryCreateValidator),
  createCategory,
);

export default router;
