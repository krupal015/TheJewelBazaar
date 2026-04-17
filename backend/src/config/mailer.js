import nodemailer from "nodemailer";
import { env } from "./env.js";

export const mailTransporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export const isMailtrapSandbox = () => /mailtrap\.io/i.test(env.smtpHost || "");

export const getEmailDeliveryMode = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return "disabled";
  }

  if (isMailtrapSandbox()) {
    return "mailtrap-sandbox";
  }

  return "smtp";
};

export const verifyMailTransport = async () => {
  const deliveryMode = getEmailDeliveryMode();

  if (deliveryMode === "disabled") {
    console.warn("SMTP is not configured. OTP emails cannot be sent.");
    return false;
  }

  if (deliveryMode === "mailtrap-sandbox" && !env.exposeDebugOtp) {
    console.warn(
      "Mailtrap sandbox is still configured in backend/.env. Replace it with a real SMTP provider to send OTPs to real inboxes.",
    );
    return false;
  }

  try {
    await mailTransporter.verify();
    console.log(`SMTP connection verified using ${deliveryMode === "smtp" ? "real SMTP" : "Mailtrap sandbox"}.`);
    return true;
  } catch (error) {
    console.error("SMTP verification failed. OTP emails will not be sent.", error.message || error);
    return false;
  }
};
