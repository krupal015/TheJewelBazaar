import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Always resolve the backend env file from this package, even if the server was launched elsewhere.
const envPath = path.resolve(__dirname, "..", "..", ".env");

dotenv.config({
  path: envPath,
  override: true,
});

const readEnvText = (value) => String(value ?? "").trim();

const smtpHost = readEnvText(process.env.SMTP_HOST);
const smtpUser = readEnvText(process.env.SMTP_USER);
const normalizedSmtpPass = /gmail\.com$/i.test(smtpHost)
  ? String(process.env.SMTP_PASS ?? "").replace(/\s+/g, "")
  : readEnvText(process.env.SMTP_PASS);
const clientUrl = readEnvText(process.env.CLIENT_URL);
const emailFrom = readEnvText(process.env.EMAIL_FROM) || smtpUser || "noreply@thejewelbazzar.com";

const requiredVariables = [
  "PORT",
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "CLIENT_URL",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  console.warn(
    `Missing environment variables: ${missingVariables.join(", ")}. Some features may not work until they are provided.`,
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || "",
  corsOrigin: clientUrl || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  emailFrom,
  smtpHost,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || "false") === "true",
  smtpUser,
  smtpPass: normalizedSmtpPass,
  clientUrl: clientUrl || "http://localhost:5173",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  razorpayKeyId: readEnvText(process.env.RAZORPAY_KEY_ID),
  razorpayKeySecret: readEnvText(process.env.RAZORPAY_KEY_SECRET),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  adminName: process.env.ADMIN_NAME || "Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@thejewelbazzar.com",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  exposeDebugOtp: readEnvText(process.env.EXPOSE_DEBUG_OTP || "false").toLowerCase() === "true",
};
