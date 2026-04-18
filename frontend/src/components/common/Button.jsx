import { cn } from "../../utils/helpers";

function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "border border-black bg-black text-white hover:bg-gold hover:border-gold",
    secondary: "border border-black bg-white text-black hover:bg-black hover:text-white",
    ghost: "border border-black/80 bg-transparent text-black hover:bg-panel",
    danger: "border border-black bg-black text-white hover:bg-gold hover:border-gold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-none px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60 border-rounded",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Button;
