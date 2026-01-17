import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ImportedProfReview } from "@/types";
import { voteImportedReview, markImportedReviewIrrelevant } from "@/features/reviews/reviewService";

type Props = {
  reviews: ImportedProfReview[];
  onUpdate?: () => void;
};

function ConfidenceBadge({ confidence }: { confidence: "HIGH" | "MEDIUM" | "LOW" }) {
  const colors = {
    HIGH: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[confidence]}`}>
      {confidence}
    </span>
  );
}

export default function ImportedReviewList({ reviews, onUpdate }: Props) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  async function handleVote(reviewId: string) {
    if (votedIds.has(reviewId)) return;
    await voteImportedReview(reviewId, "helpful");
    setVotedIds((prev) => new Set(prev).add(reviewId));
    onUpdate?.();
  }

  async function handleMarkIrrelevant(reviewId: string) {
    await markImportedReviewIrrelevant(reviewId);
    setHiddenIds((prev) => new Set(prev).add(reviewId));
    onUpdate?.();
  }

  const visibleReviews = reviews.filter((r) => !hiddenIds.has(r.id));

  if (visibleReviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold">AI-Extracted from Module Feedback</div>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          AI-derived
        </span>
      </div>
      
      <p className="text-sm text-zinc-500">
        These summaries are automatically extracted from official module feedback surveys. 
        Confidence indicates how reliably the feedback relates to this professor.
      </p>

      <div className="space-y-3">
        {visibleReviews.map((review) => (
          <Card key={review.id} className="space-y-3 border-blue-100 bg-blue-50/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-mono font-medium">
                {review.sourceModuleCode}
              </span>
              <ConfidenceBadge confidence={review.confidence} />
              {review.inferredRating && (
                <span className="text-sm">
                  {"★".repeat(review.inferredRating)}
                  {"☆".repeat(5 - review.inferredRating)}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed">{review.summary}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => handleVote(review.id)}
                  disabled={votedIds.has(review.id)}
                  className="text-xs"
                >
                  👍 Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleMarkIrrelevant(review.id)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Mark as irrelevant
                </Button>
              </div>
              <div className="text-xs text-zinc-400">
                Extracted {new Date(review.extractedAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
