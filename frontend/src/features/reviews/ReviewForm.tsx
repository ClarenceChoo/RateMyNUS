import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { RatingStars } from "@/components/RatingStars";
import { createReview } from "@/features/reviews/reviewService";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Inline quick review form. For detailed subratings, use the full WriteReview page.
 */
export default function ReviewForm({ entityId, onCreated }: { entityId: string; onCreated: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await createReview({
        entityId,
        rating,
        text: text.trim(),
        createdAt: Date.now(),
        authorId: user?.uid,
        anonymous: user?.isAnonymous ?? true,
        // TODO: For detailed subratings, direct users to WriteReview page
        subratings: {},
      });
      setText("");
      setRating(5);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Quick Review</div>
        <RatingStars value={rating} onChange={(v) => setRating(v ?? 5)} />
      </div>

      <Input
        placeholder="Keep it constructive. What’s good/bad?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting || !text.trim()}>
          {submitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </Card>
  );
}
