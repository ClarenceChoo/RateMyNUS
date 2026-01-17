import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Review } from "@/types";
import { voteReview } from "@/features/reviews/reviewService";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votes, setVotes] = useState<Map<string, { helpfulCount: number; unhelpfulCount: number }>>(
    new Map()
  );

  async function handleVote(reviewId: string, voteType: "helpful" | "unhelpful") {
    if (votedIds.has(reviewId)) return;
    
    const result = await voteReview(reviewId, voteType);
    setVotedIds((prev) => new Set(prev).add(reviewId));
    setVotes((prev) => new Map(prev).set(reviewId, result));
  }

  if (reviews.length === 0) return <div className="text-sm text-zinc-600">No reviews yet.</div>;

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const voteData = votes.get(r.id);
        const helpfulCount = voteData?.helpfulCount ?? r.helpfulCount ?? 0;
        const hasVoted = votedIds.has(r.id);

        return (
          <Card key={r.id} className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                {r.anonymous && (
                  <span className="text-xs text-zinc-400">Anonymous</span>
                )}
              </div>
              <div className="text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Tags */}
            {r.tags && r.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm leading-relaxed">{r.text}</div>

            {r.ai?.summary && (
              <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
                <div className="font-semibold">AI summary</div>
                <div>{r.ai.summary}</div>
              </div>
            )}

            {/* Vote buttons */}
            <div className="flex items-center gap-4 border-t pt-3">
              <Button
                variant="ghost"
                onClick={() => handleVote(r.id, "helpful")}
                disabled={hasVoted}
                className="text-xs"
              >
                👍 Helpful {helpfulCount > 0 && `(${helpfulCount})`}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleVote(r.id, "unhelpful")}
                disabled={hasVoted}
                className="text-xs text-zinc-400"
              >
                👎
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
