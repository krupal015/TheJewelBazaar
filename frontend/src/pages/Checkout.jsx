import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { isStripeReady } from "../services/paymentService";
import { useCartStore, useOrderStore } from "../store/store";
import { formatCurrency, getApiMessage } from "../utils/helpers";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone is required"),
  line1: z.string().min(3, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const cartSummary = useCartStore((state) => state.cartSummary);
  const totals = cartSummary();
  const resetCart = useCartStore((state) => state.resetCart);
  const createOrder = useOrderStore((state) => state.createOrder);
  const verifyPayment = useOrderStore((state) => state.verifyPayment);
  const [submitting, setSubmitting] = useState(false);
  const [paymentState, setPaymentState] = useState(null);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  if (!items.length) {
    return (
      <section className="container-shell py-20 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <Link to="/cart" className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-base">
          Back to cart
        </Link>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="glass-panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Checkout</p>
          <h1 className="mt-4 font-display text-4xl">Shipping and payment</h1>
          <p className="mt-4 text-sm leading-7 text-smoke">
            This flow is connected to your backend order creation endpoint. If you add your Stripe publishable key,
            the same page is ready for live payment UI.
          </p>

          <form
            className="mt-10 grid gap-5 sm:grid-cols-2"
            onSubmit={handleSubmit(async (values) => {
              setSubmitting(true);
              setError("");
              try {
                const response = await createOrder({ shippingAddress: values });
                setPaymentState(response);
              } catch (err) {
                setError(getApiMessage(err, "Unable to create order"));
              } finally {
                setSubmitting(false);
              }
            })}
          >
            <div className="sm:col-span-2">
              <Input label="Full name" error={formState.errors.fullName?.message} {...register("fullName")} />
            </div>
            <Input label="Phone" error={formState.errors.phone?.message} {...register("phone")} />
            <Input label="Country" error={formState.errors.country?.message} {...register("country")} />
            <div className="sm:col-span-2">
              <Input label="Address line 1" error={formState.errors.line1?.message} {...register("line1")} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Address line 2" error={formState.errors.line2?.message} {...register("line2")} />
            </div>
            <Input label="City" error={formState.errors.city?.message} {...register("city")} />
            <Input label="State" error={formState.errors.state?.message} {...register("state")} />
            <Input label="Postal code" error={formState.errors.postalCode?.message} {...register("postalCode")} />

            {error ? (
              <p className="sm:col-span-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm">
                {error}
              </p>
            ) : null}

            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating order..." : "Create order"}
              </Button>

              {paymentState ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await verifyPayment(paymentState.order._id, {
                        paymentIntentId: paymentState.payment.paymentIntentId,
                      });
                      resetCart();
                      navigate(`/tracking/${paymentState.order._id}`);
                    } catch (err) {
                      setError(getApiMessage(err, "Payment verification failed"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Verify payment
                </Button>
              ) : null}
            </div>
          </form>

          {paymentState ? (
            <div className="mt-8 rounded-[28px] border border-gold/30 bg-gold/10 p-5 text-sm text-smoke">
              <p className="font-semibold text-pearl">Order created: {paymentState.order._id}</p>
              <p className="mt-2">Payment intent: {paymentState.payment.paymentIntentId}</p>
              <p className="mt-3">
                {isStripeReady
                  ? "Stripe key detected. You can now enhance this section with Elements for card capture."
                  : "Add `VITE_STRIPE_PUBLISHABLE_KEY` to enable live card collection. The backend payment flow is already wired."}
              </p>
            </div>
          ) : null}
        </div>

        <aside className="glass-panel h-fit p-6">
          <h2 className="font-display text-3xl">Payment summary</h2>
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm text-smoke">
                <span>
                  {item.product?.name} x {item.quantity}
                </span>
                <span className="text-pearl">
                  {formatCurrency((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-6 text-sm text-smoke">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-pearl">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Shipping</span>
              <span className="text-pearl">{formatCurrency(totals.shipping)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Tax</span>
              <span className="text-pearl">{formatCurrency(totals.tax)}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-smoke">Total</span>
              <span className="text-2xl font-semibold text-gold">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
