import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(env.mongodbUri, {
    dbName: "thejewelbazzar",
  });

  console.log("MongoDB connected successfully");
};
