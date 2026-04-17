import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { buildProductFilters, buildProductSort } from "../services/product.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPaginationMeta } from "../utils/query.js";

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeProductImageUrl = (url = "") => {
  const localMediaPath = "/api/v1/product-media/";
  const localMediaIndex = String(url).indexOf(localMediaPath);

  if (localMediaIndex >= 0) {
    return String(url).slice(localMediaIndex);
  }

  return url;
};

const normalizeProductImages = (product) => {
  if (!product) {
    return product;
  }

  const normalizedProduct = typeof product.toObject === "function" ? product.toObject() : { ...product };
  normalizedProduct.images = (normalizedProduct.images || []).map((image) => ({
    ...image,
    url: normalizeProductImageUrl(image.url),
  }));

  return normalizedProduct;
};

const buildUniqueProductSlug = async (value, excludeProductId = null) => {
  const baseSlug = toSlug(value);

  if (!baseSlug) {
    throw new ApiError(400, "Product slug is required");
  }

  let candidateSlug = baseSlug;
  let suffix = 2;

  while (
    await Product.exists({
      slug: candidateSlug,
      ...(excludeProductId ? { _id: { $ne: excludeProductId } } : {}),
    })
  ) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidateSlug;
};

export const listProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const filters = buildProductFilters(req.query);
  const sort = buildProductSort(req.query.sortBy, req.query.order);

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filters),
  ]);

  res.status(200).json(
    new ApiResponse("Products fetched successfully", {
      products: products.map(normalizeProductImages),
      pagination: buildPaginationMeta(page, limit, total),
    }),
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).populate("category", "name slug");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(new ApiResponse("Product fetched successfully", normalizeProductImages(product)));
});

export const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const normalizedSku = String(req.body.sku ?? "").trim();
  const existingSku = await Product.findOne({ sku: normalizedSku });

  if (existingSku) {
    throw new ApiError(409, "SKU already exists. Please use a different SKU.");
  }

  const product = await Product.create({
    ...req.body,
    sku: normalizedSku,
    slug: await buildUniqueProductSlug(req.body.slug || req.body.name),
  });
  res.status(201).json(new ApiResponse("Product created successfully", normalizeProductImages(product)));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const normalizedSku = String(req.body.sku ?? "").trim();
  const existingSku = await Product.findOne({
    sku: normalizedSku,
    _id: { $ne: req.params.productId },
  });

  if (existingSku) {
    throw new ApiError(409, "SKU already exists. Please use a different SKU.");
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (req.body.category) {
    const category = await Category.findById(req.body.category);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  product.name = req.body.name ?? product.name;
  product.description = req.body.description ?? product.description;
  product.category = req.body.category ?? product.category;
  product.metalType = req.body.metalType ?? product.metalType;
  product.price = req.body.price ?? product.price;
  product.discountPrice = req.body.discountPrice ?? product.discountPrice;
  product.stock = req.body.stock ?? product.stock;
  product.featured = req.body.featured ?? product.featured;
  product.sku = normalizedSku;
  product.slug = await buildUniqueProductSlug(req.body.slug || req.body.name || product.name, product._id);
  await product.save();

  res.status(200).json(new ApiResponse("Product updated successfully", normalizeProductImages(product)));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(new ApiResponse("Product deleted successfully"));
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json(new ApiResponse("Categories fetched successfully", categories));
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const slug = toSlug(req.body.slug || name);

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  if (!slug) {
    throw new ApiError(400, "Category slug is required");
  }

  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    ...req.body,
    name,
    slug,
  });
  res.status(201).json(new ApiResponse("Category created successfully", category));
});
