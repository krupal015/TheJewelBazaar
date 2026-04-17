import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import TrackingTimeline from "../components/tracking/TrackingTimeline";
import { useOrderStore } from "../store/store";
import { formatCurrency, getApiMessage } from "../utils/helpers";

function Tracking() {
  const { orderId } = useParams();
  const fetchOrder = useOrderStore((state) => state.fetchOrder);
  const selectedOrder = useOrderStore((state) => state.selectedOrder);
  const loading = useOrderStore((state) => state.loading);
  const [trackingId, setTrackingId] = useState(orderId || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId).catch((err) => setError(getApiMessage(err, "Unable to fetch tracking")));
    }
  }, [fetchOrder, orderId]);

  return (
    <section className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="glass-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Delivery Tracking</p>
          <h1 className="mt-4 font-display text-4xl">Track every stage</h1>
          <p className="mt-4 text-sm leading-7 text-smoke">
            Enter your order ID to view its current delivery state and a premium stepper timeline.
          </p>

          <div className="mt-8 space-y-4">
            <Input label="Tracking ID" value={trackingId} onChange={(event) => setTrackingId(event.target.value)} />
            <Button
              className="gap-2"
              onClick={async () => {
                setError("");
                try {
                  await fetchOrder(trackingId);
                } catch (err) {
                  setError(getApiMessage(err, "Tracking ID not found"));
                }
              }}
            >
              <Search size={16} />
              Track order
            </Button>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm">{error}</p>
          ) : null}
        </div>

        <div className="glass-panel p-8">
          {loading ? (
            <div className="text-smoke">Loading tracking details...</div>
          ) : selectedOrder ? (
            <>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-smoke">Current status</p>
                  <h2 className="mt-3 font-display text-4xl capitalize text-gold">{selectedOrder.orderStatus}</h2>
                  <p className="mt-2 text-sm text-smoke">
                    Order total {formatCurrency(selectedOrder.totalPrice)} • {selectedOrder.items.length} items
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-smoke">
                  Tracking ID: <span className="text-pearl">{selectedOrder._id}</span>
                </div>
              </div>

              <div className="mt-8">
                <TrackingTimeline status={selectedOrder.orderStatus} />
              </div>
            </>
          ) : (
            <div className="text-smoke">Enter an order ID to begin tracking.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Tracking;
