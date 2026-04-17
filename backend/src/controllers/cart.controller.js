import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate("items.product");
  }

  return cart;
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json(new ApiResponse("Cart fetched successfully", cart));
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.stock < quantity) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => String(item.product._id) === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.status(200).json(new ApiResponse("Item added to cart", updatedCart));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((entry) => String(entry.product._id) === req.params.productId);

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  item.quantity = req.body.quantity;
  await cart.save();
  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.status(200).json(new ApiResponse("Cart item updated", updatedCart));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => String(item.product._id) !== req.params.productId);
  await cart.save();
  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.status(200).json(new ApiResponse("Cart item removed", updatedCart));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.status(200).json(new ApiResponse("Cart cleared successfully", cart));
});
