import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

export default function Button({ className, variant = "solid", disabled, ...props }: Props) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "solid" && "bg-zinc-900 text-white hover:bg-zinc-800",
        variant === "ghost" && "bg-transparent hover:bg-zinc-100",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
