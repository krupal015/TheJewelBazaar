import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthStore } from "../store/store";

const registerSchema = z
  .object({
    name: z.coerce.string().trim().min(2, "Name is required"),
    email: z.coerce.string().trim().email("Enter a valid email"),
    password: z.coerce.string().min(8, "Password must be at least 8 characters"),
  });

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const startRegistration = useAuthStore((state) => state.startRegistration);
  const verifyRegistrationOtp = useAuthStore((state) => state.verifyRegistrationOtp);
  const resendRegistrationOtp = useAuthStore((state) => state.resendRegistrationOtp);
  const resetError = useAuthStore((state) => state.resetError);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("details");
  const [infoMessage, setInfoMessage] = useState("");
  const formatOtpMessage = (response, fallback) => {
    const parts = [response?.message || fallback, response?.deliveryNotice];

    if (response?.debugOtp) {
      parts.push(`OTP: ${response.debugOtp}`);
    }

    return parts.filter(Boolean).join(" ");
  };
  const redirectPath = location.state?.from?.pathname || (user?.role === "ADMIN" ? "/admin/dashboard" : "/");
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    resetError();
    return () => resetError();
  }, [resetError]);

  useEffect(() => {
    if (!user) {
      return;
    }

    navigate(redirectPath, { replace: true });
  }, [navigate, redirectPath, user]);

  return (
    <section className="container-shell py-14">
      <div className="grid border border-black bg-white lg:grid-cols-2">
        <div className="p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Join The Bazaar</p>
          <h1 className="mt-4 font-display text-6xl leading-none">
            {step === "details" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-smoke">
            {step === "details"
              ? "Register once to save your cart, complete checkout faster, and keep every order in one place."
              : `We sent a 6-digit OTP to ${verificationEmail}. Enter it below to verify your email, then login to continue.`}
          </p>

          {step === "details" ? (
            <form
              onSubmit={handleSubmit(async (values) => {
                try {
                  setInfoMessage("");
                  const response = await startRegistration(values);
                  setVerificationEmail(values.email.trim().toLowerCase());
                  setOtp("");
                  setStep("verify");
                  setInfoMessage(formatOtpMessage(response, "Verification OTP sent successfully."));
                } catch {
                  // Error already shown from store.
                }
              })}
              className="mt-10 grid gap-5 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <Input label="Full name" placeholder="Krupal Patel" error={formState.errors.name?.message} {...register("name")} />
              </div>
              <div className="sm:col-span-2">
                <Input type="email" label="Email" placeholder="you@example.com" error={formState.errors.email?.message} {...register("email")} />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  error={formState.errors.password?.message}
                  {...register("password")}
                />
              </div>

              {error ? <p className="sm:col-span-2 border border-black bg-panel px-4 py-3 text-sm">{error}</p> : null}
              {infoMessage ? <p className="sm:col-span-2 border border-black bg-white px-4 py-3 text-sm">{infoMessage}</p> : null}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send Verification OTP"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-10 space-y-5">
              <Input
                label="Registered email"
                value={verificationEmail}
                disabled
                readOnly
              />
              <Input
                label="Verification OTP"
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
                      const response = await verifyRegistrationOtp({
                        email: verificationEmail,
                        otp,
                      });
                      navigate("/login", {
                        replace: true,
                        state: {
                          registrationVerifiedSuccess: "Email verified successfully. Please login to continue.",
                        },
                      });
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
                      const response = await resendRegistrationOtp({ email: verificationEmail });
                      setInfoMessage(
                        formatOtpMessage(response, `A new verification OTP was sent to ${verificationEmail}.`),
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
                    setStep("details");
                    setOtp("");
                    setInfoMessage("");
                    resetError();
                  }}
                >
                  Change Email
                </Button>
              </div>
            </div>
          )}

          <p className="mt-8 text-sm text-smoke">
            Already have an account? <Link to="/login" className="font-semibold text-black underline underline-offset-4">Login</Link>
          </p>
        </div>

        <div className="hidden min-h-[680px] border-l border-black lg:block">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80"
            alt="Register visual"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default Register;
