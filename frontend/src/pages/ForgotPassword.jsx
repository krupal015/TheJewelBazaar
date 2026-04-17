import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthStore } from "../store/store";

const emailSchema = z.object({
  email: z.coerce.string().trim().email("Enter a valid email"),
});

const resetPasswordSchema = z
  .object({
    password: z.coerce.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.coerce.string().min(8, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ForgotPassword() {
  const navigate = useNavigate();
  const startForgotPassword = useAuthStore((state) => state.startForgotPassword);
  const verifyForgotPasswordOtp = useAuthStore((state) => state.verifyForgotPasswordOtp);
  const resendForgotPasswordOtp = useAuthStore((state) => state.resendForgotPasswordOtp);
  const resetForgotPassword = useAuthStore((state) => state.resetForgotPassword);
  const resetError = useAuthStore((state) => state.resetError);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const formatOtpMessage = (response, fallback) => {
    const parts = [response?.message || fallback, response?.deliveryNotice];

    if (response?.debugOtp) {
      parts.push(`OTP: ${response.debugOtp}`);
    }

    return parts.filter(Boolean).join(" ");
  };
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: emailFormState,
    setValue: setEmailValue,
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    resetError();
    return () => resetError();
  }, [resetError]);

  return (
    <section className="container-shell py-14">
      <div className="grid border border-black bg-white lg:grid-cols-2">
        <div className="p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Account Recovery</p>
          <h1 className="mt-4 font-display text-6xl leading-none">
            {step === "email" ? "Reset your password" : step === "otp" ? "Verify reset OTP" : "Create a new password"}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-smoke">
            {step === "email"
              ? "Enter your email and we will send a 6-digit OTP so you can securely reset your password."
              : step === "otp"
                ? `We sent a 6-digit OTP to ${email}. Enter it below to continue.`
                : `Create a new password for ${email}.`}
          </p>

          {step === "email" ? (
            <form
              onSubmit={handleEmailSubmit(async (values) => {
                try {
                  setInfoMessage("");
                  const normalizedEmail = values.email.trim().toLowerCase();
                  const response = await startForgotPassword({ email: normalizedEmail });
                  setEmail(normalizedEmail);
                  setOtp("");
                  setStep("otp");
                  setInfoMessage(formatOtpMessage(response, "Password reset OTP sent successfully."));
                } catch {
                  // Error already shown from store.
                }
              })}
              className="mt-10 space-y-5"
            >
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={emailFormState.errors.email?.message}
                {...registerEmail("email")}
              />

              {error ? <p className="border border-black bg-panel px-4 py-3 text-sm">{error}</p> : null}
              {infoMessage ? <p className="border border-black bg-white px-4 py-3 text-sm">{infoMessage}</p> : null}

              <Button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <div className="mt-10 space-y-5">
              <Input label="Email" value={email} disabled readOnly />
              <Input
                label="Reset OTP"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />

              {error ? <p className="border border-black bg-panel px-4 py-3 text-sm">{error}</p> : null}
              {infoMessage ? <p className="border border-black bg-white px-4 py-3 text-sm">{infoMessage}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={loading || otp.trim().length !== 6}
                  onClick={async () => {
                    try {
                      setInfoMessage("");
                      await verifyForgotPasswordOtp({ email, otp });
                      resetPasswordForm();
                      setStep("reset");
                      setInfoMessage("OTP verified. Create your new password.");
                    } catch {
                      // Error already shown from store.
                    }
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setInfoMessage("");
                      const response = await resendForgotPasswordOtp({ email });
                      setInfoMessage(
                        formatOtpMessage(response, `A new password reset OTP was sent to ${email}.`),
                      );
                    } catch {
                      // Error already shown from store.
                    }
                  }}
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setInfoMessage("");
                    setEmail("");
                    setEmailValue("email", "");
                    resetError();
                  }}
                >
                  Change Email
                </Button>
              </div>
            </div>
          ) : null}

          {step === "reset" ? (
            <form
              onSubmit={handlePasswordSubmit(async ({ password }) => {
                try {
                  setInfoMessage("");
                  await resetForgotPassword({ email, otp, password });
                  navigate("/login", {
                    replace: true,
                    state: {
                      passwordResetSuccess: "Password updated successfully. Please login with your new password.",
                    },
                  });
                } catch {
                  // Error already shown from store.
                }
              })}
              className="mt-10 space-y-5"
            >
              <Input label="Email" value={email} disabled readOnly />
              <Input label="Verified OTP" value={otp} disabled readOnly />
              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                error={passwordFormState.errors.password?.message}
                {...registerPassword("password")}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat your new password"
                error={passwordFormState.errors.confirmPassword?.message}
                {...registerPassword("confirmPassword")}
              />

              {error ? <p className="border border-black bg-panel px-4 py-3 text-sm">{error}</p> : null}
              {infoMessage ? <p className="border border-black bg-white px-4 py-3 text-sm">{infoMessage}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => {
                    setStep("otp");
                    setInfoMessage("");
                    resetError();
                  }}
                >
                  Back To OTP
                </Button>
              </div>
            </form>
          ) : null}

          <p className="mt-8 text-sm text-smoke">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-black underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </div>

        <div className="hidden min-h-[680px] border-l border-black lg:block">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80"
            alt="Password recovery visual"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
