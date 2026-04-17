import Mailgen from "mailgen";
import { getEmailDeliveryMode, isMailtrapSandbox, mailTransporter } from "../config/mailer.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "The Jewel Bazzar",
    link: env.clientUrl,
  },
});

export const sendMail = async ({ to, subject, intro, action, outro }) => {
  const mailBody = {
    body: {
      intro,
      action,
      outro,
    },
  };
  const html = mailGenerator.generate(mailBody);
  const text = mailGenerator.generatePlaintext(mailBody);

  const deliveryMode = getEmailDeliveryMode();

  // In debug/dev mode, skip actual email sending — OTP is returned in the API response.
  if (env.exposeDebugOtp) {
    return { deliveryMode: deliveryMode === "disabled" ? "debug" : deliveryMode };
  }

  if (deliveryMode === "disabled") {
    throw new ApiError(503, "Email delivery is not configured. Add real SMTP settings in backend/.env.");
  }

  if (deliveryMode === "mailtrap-sandbox") {
    throw new ApiError(
      503,
      "Real OTP email is not configured. The app is still using Mailtrap sandbox in backend/.env, which cannot send OTPs to a real inbox.",
    );
  }

  await mailTransporter.sendMail({
    from: env.emailFrom,
    to,
    replyTo: env.emailFrom,
    subject,
    text,
    html,
  });

  return { deliveryMode };
};

export const sendRegistrationOtpEmail = async ({ email, name, otp }) =>
  sendMail({
    to: email,
    subject: "Verify your email address",
    intro: `Hello ${name}, use this verification code to complete your registration.`,
    action: {
      instructions: "Enter the OTP below on the verification screen.",
      button: {
        color: "#b7791f",
        text: otp,
        link: env.clientUrl,
      },
    },
    outro: "If you did not request this, you can safely ignore this email.",
  });

export const sendForgotPasswordOtpEmail = async ({ email, name, otp }) =>
  sendMail({
    to: email,
    subject: "Reset your password",
    intro: `Hello ${name}, use this OTP to reset your password.`,
    action: {
      instructions: "Enter the OTP below on the reset password screen.",
      button: {
        color: "#b7791f",
        text: otp,
        link: env.clientUrl,
      },
    },
    outro: "If you did not request this, you can safely ignore this email.",
  });

export const shouldExposeDebugOtp = () => env.exposeDebugOtp;

export const getOtpDeliveryNotice = () => {
  if (isMailtrapSandbox()) {
    return env.exposeDebugOtp
      ? "Mailtrap sandbox is configured, so OTP emails will not arrive in a real inbox."
      : "";
  }

  return "OTP email sent successfully.";
};
