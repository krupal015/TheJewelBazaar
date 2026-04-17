import { Router } from "express";
import { uploadProductImages } from "../controllers/upload.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = Router();

router.post(
  "/products/:productId/images",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  upload.array("images", 5),
  uploadProductImages,
);

export default router;
