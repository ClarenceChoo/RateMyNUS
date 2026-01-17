import { cn } from "@/lib/util";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

export default function Button({ className, variant = "solid", ...props }: Props) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "solid" && "bg-zinc-900 text-white hover:bg-zinc-800",
        variant === "ghost" && "bg-transparent hover:bg-zinc-100",
        className
      )}
      {...props}
    />
  );
}
