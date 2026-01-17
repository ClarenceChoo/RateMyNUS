import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RatingStars } from "@/components/RatingStars";
import { getEntity } from "@/features/entities/entityService";
import { createReview } from "@/features/reviews/reviewService";
import { useAuth } from "@/providers/AuthProvider";
import type { Entity } from "@/types";

const SUGGESTED_TAGS: Record<string, string[]> = {
  DORM: ["quiet", "clean", "friendly", "study-friendly", "active", "good-food"],
  CLASSROOM: ["good-audio", "spacious", "cold", "well-equipped", "outlets"],
  PROFESSOR: ["engaging", "helpful", "tough-grader", "organized", "approachable"],
  FOOD_PLACE: ["cheap", "fast", "variety", "crowded", "halal", "vegetarian"],
  TOILET: ["clean", "quiet", "hidden-gem", "accessible", "shower"],
};

export default function WriteReview() {
  const { id: entityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(true);

  useEffect(() => {
    (async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const e = await getEntity(entityId);
        setEntity(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [entityId]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!entityId || rating === 0 || !text.trim()) return;
    
    setSubmitting(true);
    try {
      await createReview({
        entityId,
        rating,
        text: text.trim(),
        tags: selectedTags,
        createdAt: Date.now(),
        authorId: user?.uid,
        anonymous,
      });
      navigate(`/entity/${entityId}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="py-8 text-center text-zinc-500">Loading...</div>;
  if (!entity) return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-bold">Entity not found</h1>
      <Link to="/" className="mt-4 text-blue-600 hover:underline">Go back home</Link>
    </div>
  );

  const suggestedTags = SUGGESTED_TAGS[entity.type] ?? [];
  const isValid = rating > 0 && text.trim().length >= 10;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link to={`/entity/${entityId}`} className="text-sm text-zinc-500 hover:underline">
          ← Back to {entity.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Write a Review</h1>
        <p className="text-zinc-600">for {entity.name}</p>
      </div>

      <Card className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <label className="font-semibold">Overall Rating *</label>
          <div className="flex items-center gap-4">
            <RatingStars value={rating} onChange={setRating} />
            <span className="text-sm text-zinc-500">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="font-semibold">Tags (optional)</label>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  selectedTags.includes(tag)
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="font-semibold">Your Review *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience. What was good? What could be improved? Be specific and helpful..."
            rows={5}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
          <div className="text-right text-xs text-zinc-400">
            {text.length} characters (min 10)
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
          <div>
            <div className="font-medium">Post Anonymously</div>
            <div className="text-sm text-zinc-500">
              {anonymous ? "Your identity will be hidden" : "Your name may be visible"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnonymous(!anonymous)}
            className={`relative h-6 w-11 rounded-full transition ${
              anonymous ? "bg-zinc-900" : "bg-zinc-300"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                anonymous ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Link to={`/entity/${entityId}`}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
