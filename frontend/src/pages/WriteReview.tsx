import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RatingStars } from "@/components/RatingStars";
import { getEntity } from "@/features/entities/entityService";
import { createReview } from "@/features/reviews/reviewService";
import { useAuth } from "@/providers/AuthProvider";
import { getApplicableSubratings } from "@/config/subratings";
import ModuleSelect from "@/features/modules/ModuleSelect";
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
  const [subratings, setSubratings] = useState<Record<string, number>>({});
  const [moduleCode, setModuleCode] = useState(""); // For professor reviews

  useEffect(() => {
    (async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const e = await getEntity(entityId);
        setEntity(e);
        // Initialize subratings to 0 (not rated yet)
        if (e) {
          const applicable = getApplicableSubratings(e.type, e);
          const initial: Record<string, number> = {};
          applicable.forEach((s) => { initial[s.key] = 0; });
          setSubratings(initial);
        }
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

  function updateSubrating(key: string, value: number | null) {
    // Convert null to 0
    setSubratings((prev) => ({ ...prev, [key]: value ?? 0 }));
  }

  async function handleSubmit() {
    // Only require overall rating - text is optional
    if (!entityId || rating === 0) {
      console.log("Validation failed: No overall rating selected");
      return;
    }
    
    setSubmitting(true);
    try {
      console.log("Submitting review...", { entityId, rating });
      await createReview({
        entityId,
        rating,
        text: text.trim(),
        tags: selectedTags,
        subratings,
        createdAt: Date.now(),
        authorId: user?.uid,
        anonymous,
        ...(entity?.type === "PROFESSOR" && moduleCode ? { moduleCode } : {}),
      });
      console.log("Review submitted successfully!");
      navigate(`/entity/${entityId}`);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
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
  const applicableSubratings = getApplicableSubratings(entity.type, entity);
  // Only require overall rating
  const isValid = rating > 0;

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
        {/* Overall Rating */}
        <div className="space-y-2">
          <label className="font-semibold">Overall Rating *</label>
          <div className="flex items-center gap-4">
            <RatingStars value={rating} onChange={(v) => setRating(v ?? 0)} />
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

        {/* Module Selection for Professors */}
        {entity.type === "PROFESSOR" && (
          <div className="space-y-2">
            <label className="font-semibold">Module Taken</label>
            <p className="text-sm text-zinc-500">Which module did you take with this professor?</p>
            <ModuleSelect
              value={moduleCode}
              onChange={setModuleCode}
              placeholder="Search for a module (e.g. CS1101S)"
            />
          </div>
        )}

        {/* Subratings */}
        {applicableSubratings.length > 0 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Rate Specific Aspects</label>
              <p className="text-sm text-zinc-500">Click stars to rate (unrated = 0 stars)</p>
            </div>
            <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
              {applicableSubratings.map((subrating) => (
                <div key={subrating.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{subrating.label}</div>
                    {subrating.helperText && (
                      <div className="text-xs text-zinc-400 truncate">{subrating.helperText}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars
                      value={subratings[subrating.key] || null}
                      onChange={(v) => updateSubrating(subrating.key, v)}
                      clearable
                      size="sm"
                    />
                    {subratings[subrating.key] === 0 && (
                      <span className="text-xs text-zinc-400">Not rated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
