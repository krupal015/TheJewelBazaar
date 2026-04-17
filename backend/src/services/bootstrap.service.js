import Category from "../models/Category.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { USER_ROLES } from "../utils/constants.js";

const DEFAULT_CATEGORIES = [
  { name: "Rings", slug: "rings" },
  { name: "Pendants", slug: "pendants" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Necklaces", slug: "necklaces" },
];

export const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ email: env.adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: env.adminName,
      email: env.adminEmail,
      password: env.adminPassword,
      role: USER_ROLES.ADMIN,
      isEmailVerified: true,
    });
    return;
  }

  const passwordMatches = await existingAdmin.comparePassword(env.adminPassword);
  const requiresUpdate =
    existingAdmin.name !== env.adminName
    || existingAdmin.role !== USER_ROLES.ADMIN
    || !passwordMatches;

  if (!requiresUpdate) {
    return;
  }

  existingAdmin.name = env.adminName;
  existingAdmin.password = env.adminPassword;
  existingAdmin.role = USER_ROLES.ADMIN;
  existingAdmin.isEmailVerified = true;
  existingAdmin.emailVerificationOtp = null;
  existingAdmin.emailVerificationOtpExpires = null;
  await existingAdmin.save();
};

export const ensureDefaultCategories = async () => {
  for (const category of DEFAULT_CATEGORIES) {
    const existingCategory = await Category.findOne({ slug: category.slug });

    if (!existingCategory) {
      await Category.create(category);
    }
  }
};
