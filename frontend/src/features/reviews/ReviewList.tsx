import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Review, EntityType } from "@/types";
import { voteReview } from "@/features/reviews/reviewService";
import { SUBRATINGS_BY_TYPE } from "@/config/subratings";

// Mini subrating bar component
function SubratingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 truncate text-zinc-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full transition-all ${value === 0 ? "bg-zinc-300" : "bg-yellow-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-4 text-right font-medium ${value === 0 ? "text-zinc-400" : "text-zinc-600"}`}>
        {value}
      </span>
    </div>
  );
}

type ReviewListProps = {
  reviews: Review[];
  entityType?: EntityType;
};

export default function ReviewList({ reviews, entityType }: ReviewListProps) {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votes, setVotes] = useState<Map<string, number>>(new Map());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function handleVote(reviewId: string, currentCount: number, entityId?: string) {
    if (votedIds.has(reviewId)) return;
    
    // Optimistically update UI immediately (+1)
    setVotedIds((prev) => new Set(prev).add(reviewId));
    setVotes((prev) => new Map(prev).set(reviewId, currentCount + 1));
    
    // Fire API call in background (no await needed)
    voteReview(reviewId, entityId);
  }

  function toggleExpanded(reviewId: string) {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  }

  if (reviews.length === 0) return <div className="text-sm text-zinc-600">No reviews yet.</div>;

  // Get subrating definitions for this entity type
  const subratingDefs = entityType ? SUBRATINGS_BY_TYPE[entityType] : [];

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const voteCount = votes.get(r.id) ?? r.voteCount ?? 0;
        const hasVoted = votedIds.has(r.id);
        const isExpanded = expandedIds.has(r.id);
        const hasSubratings = r.subratings && Object.keys(r.subratings).length > 0;

        return (
          <Card key={r.id} className="space-y-3">
            {/* Header: Overall rating, author name, date */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span className="font-medium text-zinc-700">{r.rating}/5</span>
                <span className="text-xs text-zinc-400">
                  {r.authorName || "Anonymous"}
                </span>
              </div>
              <div className="text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Subratings preview - show compact version */}
            {hasSubratings && subratingDefs.length > 0 && (
              <div className="space-y-1.5">
                {/* Show first 3 subratings or all if expanded */}
                {(isExpanded ? subratingDefs : subratingDefs.slice(0, 3)).map((def) => {
                  const value = r.subratings?.[def.key] ?? 0;
                  return (
                    <SubratingBar key={def.key} label={def.label} value={value} />
                  );
                })}
                
                {/* Show more/less toggle if more than 3 subratings */}
                {subratingDefs.length > 3 && (
                  <button
                    onClick={() => toggleExpanded(r.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isExpanded ? "Show less" : `+${subratingDefs.length - 3} more ratings`}
                  </button>
                )}
              </div>
            )}

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

            {/* Review text */}
            <div className="text-sm leading-relaxed">{r.text}</div>

            {/* Vote button */}
            <div className="flex items-center border-t pt-3">
              <Button
                variant="ghost"
                onClick={() => handleVote(r.id, voteCount, r.entityId)}
                disabled={hasVoted}
                className="text-xs"
              >
                👍 Helpful {voteCount > 0 && `(${voteCount})`}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
