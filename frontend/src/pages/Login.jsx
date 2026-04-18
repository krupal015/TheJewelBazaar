import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthStore } from "../store/store";

const loginSchema = z.object({
  email: z.coerce.string().trim().email("Enter a valid email"),
  password: z.coerce.string().min(8, "Password must be at least 8 characters"),
});

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const submitAuth = useAuthStore((state) => state.submitAuth);
  const resetError = useAuthStore((state) => state.resetError);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const passwordResetSuccess = location.state?.passwordResetSuccess;
  const registrationVerifiedSuccess = location.state?.registrationVerifiedSuccess;
  const redirectPath = location.state?.from?.pathname || (user?.role === "ADMIN" ? "/admin/dashboard" : "/");
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
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

  const onSubmit = async (values) => {
    try {
      const user = await submitAuth("login", values);
      const nextPath = location.state?.from?.pathname || (user.role === "ADMIN" ? "/admin/dashboard" : "/");
      navigate(nextPath, { replace: true });
    } catch {
      // Error already shown in store state.
    }
  };

  return (
    <section className="container-shell py-14">
      <div className="grid border border-black bg-white lg:grid-cols-2">
        <div className="hidden min-h-[680px] border-r border-black lg:block">
          <img
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=80"
            alt="Login visual"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Welcome Back</p>
          <h1 className="mt-4 font-display text-6xl leading-none">Login to your account</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-smoke">
            Access your cart, checkout, order history, and tracking updates from one clean dashboard.
          </p>

          <form onSubmit={handleSubmit((values) => onSubmit(values))} className="mt-10 space-y-5">
            <Input type="email" label="Email" placeholder="you@example.com" error={formState.errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="Enter your password" error={formState.errors.password?.message} {...register("password")} />

            {error ? <p className="border border-black bg-panel px-4 py-3 text-sm">{error}</p> : null}
            {registrationVerifiedSuccess ? (
              <p className="border border-black bg-white px-4 py-3 text-sm">{registrationVerifiedSuccess}</p>
            ) : null}
            {passwordResetSuccess ? <p className="border border-black bg-white px-4 py-3 text-sm">{passwordResetSuccess}</p> : null}

            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={loading} className="gap-2 !rounded-full px-7 whitespace-nowrap">
                <Mail size={16} />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-smoke">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="font-semibold text-black underline underline-offset-4">
              Reset it here
            </Link>
          </p>

          <p className="mt-4 text-sm text-smoke">
            New here? <Link to="/register" className="font-semibold text-black underline underline-offset-4">Create your account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
