import { cn } from "@/lib/utils";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border p-4", className)} {...props} />;
}
