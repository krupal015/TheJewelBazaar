import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productMediaDirectory = path.resolve(__dirname, "..", "..", "product-data", "photos");

const isCloudinaryConfigured =
  env.cloudinaryCloudName
  && env.cloudinaryApiKey
  && env.cloudinaryApiSecret
  && env.cloudinaryCloudName !== "replace_me"
  && env.cloudinaryApiKey !== "replace_me"
  && env.cloudinaryApiSecret !== "replace_me";

const getFileExtension = (file) => path.extname(file.originalname || "") || ".jpg";

const uploadToCloudinary = async (file) => {
  const uploaded = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    { folder: "thejewelbazzar/products" },
  );

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
};

const uploadToLocalStorage = async (file, req) => {
  await fs.mkdir(productMediaDirectory, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${getFileExtension(file)}`;
  const filepath = path.join(productMediaDirectory, filename);

  await fs.writeFile(filepath, file.buffer);

  return {
    url: `/api/v1/product-media/${filename}`,
    publicId: `local:${filename}`,
  };
};

const uploadBuffer = async (file, req) => {
  if (isCloudinaryConfigured) {
    try {
      return await uploadToCloudinary(file);
    } catch {
      // Fall back to local storage if cloud upload is unavailable.
    }
  }

  return uploadToLocalStorage(file, req);
};

export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  const images = await Promise.all(req.files.map((file) => uploadBuffer(file, req)));

  product.images.push(...images);
  await product.save();

  res.status(200).json(new ApiResponse("Product images uploaded successfully", product));
});
