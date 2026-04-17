import { CheckCircle2, CircleDot, Clock3, XCircle } from "lucide-react";
import { cn } from "../../utils/helpers";
import { getTrackingIndex, trackingSteps } from "../../utils/tracking";

function TrackingTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        <div className="flex items-center gap-3">
          <XCircle />
          <div>
            <p className="font-semibold">Order cancelled</p>
            <p className="text-sm text-rose-100/80">This order will not move through the delivery timeline.</p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = getTrackingIndex(status);

  return (
    <div className="space-y-5">
      {trackingSteps.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border",
                  complete && "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
                  active && "border-gold/60 bg-gold/10 text-gold",
                  !complete && !active && "border-white/10 bg-white/5 text-smoke",
                )}
              >
                {complete ? <CheckCircle2 size={20} /> : active ? <CircleDot size={20} /> : <Clock3 size={20} />}
              </div>
              {index !== trackingSteps.length - 1 ? <div className="mt-2 h-14 w-px bg-white/10" /> : null}
            </div>
            <div className="pb-6">
              <p className={cn("text-lg font-semibold", active ? "text-pearl" : "text-pearl/80")}>{step.label}</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-smoke">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TrackingTimeline;
