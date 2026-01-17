import Card from "@/components/ui/Card";
import { Review } from "@/types";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return <div className="text-sm text-zinc-600">No reviews yet.</div>;

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <div className="text-zinc-500">{new Date(r.createdAt).toLocaleString()}</div>
          </div>

          <div className="text-sm">{r.text}</div>

          {r.ai?.summary && (
            <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
              <div className="font-semibold">AI summary</div>
              <div>{r.ai.summary}</div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
