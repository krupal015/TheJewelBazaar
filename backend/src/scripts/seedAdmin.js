import { connectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { USER_ROLES } from "../utils/constants.js";

const seedAdmin = async () => {
  await connectDatabase();

  const existing = await User.findOne({ email: env.adminEmail });
  if (existing) {
    const passwordMatches = await existing.comparePassword(env.adminPassword);
    const requiresUpdate =
      existing.name !== env.adminName ||
      existing.role !== USER_ROLES.ADMIN ||
      !passwordMatches;

    if (!requiresUpdate) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    existing.name = env.adminName;
    existing.password = env.adminPassword;
    existing.role = USER_ROLES.ADMIN;
    await existing.save();

    console.log("Admin user synced successfully");
    process.exit(0);
  }

  await User.create({
    name: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
    role: USER_ROLES.ADMIN,
  });

  console.log("Admin user seeded successfully");
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Failed to seed admin user", error);
  process.exit(1);
});
