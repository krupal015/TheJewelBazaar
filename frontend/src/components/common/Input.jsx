import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-none border border-black/90 bg-white px-4 py-3 text-black outline-none transition",
          "placeholder:text-smoke focus:bg-panel",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-black">{error}</span> : null}
    </label>
  );
});

export default Input;
