import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RatingStars } from "@/components/RatingStars";
import { createReview } from "@/features/reviews/reviewService";
import { useAuth } from "@/providers/AuthProvider";
import { getApplicableSubratings, type SubratingDefinition } from "@/config/subratings";
import type { Entity, EntityType } from "@/types";

// ============================================================================
// Category-specific form configurations
// ============================================================================

type FormConfig = {
  title: string;
  icon: string;
  placeholder: string;
  minChars: number;
};

const FORM_CONFIG: Record<EntityType, FormConfig> = {
  DORM: {
    title: "Rate this Dorm",
    icon: "🏠",
    placeholder: "How's the living experience? Talk about room quality, facilities, social life, noise levels...",
    minChars: 20,
  },
  CLASSROOM: {
    title: "Rate this Classroom",
    icon: "🏫",
    placeholder: "How's learning here? Discuss seating comfort, visibility, audio quality, air conditioning...",
    minChars: 15,
  },
  PROFESSOR: {
    title: "Rate this Professor",
    icon: "👨‍🏫",
    placeholder: "Share your experience. How are their teaching style, clarity, helpfulness, grading fairness?",
    minChars: 30,
  },
  FOOD_PLACE: {
    title: "Rate this Food Place",
    icon: "🍜",
    placeholder: "How's the food? Talk about taste, portion size, value, queue time, cleanliness...",
    minChars: 15,
  },
  TOILET: {
    title: "Rate this Toilet",
    icon: "🚻",
    placeholder: "How's the experience? Discuss cleanliness, availability, supplies, smell...",
    minChars: 10,
  },
};

// ============================================================================
// Subrating Input Component
// ============================================================================

function SubratingInput({
  subrating,
  value,
  onChange,
}: {
  subrating: SubratingDefinition;
  value: number;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{subrating.label}</div>
        {subrating.helperText && (
          <div className="text-xs text-zinc-400 truncate">{subrating.helperText}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingStars value={value || null} onChange={onChange} clearable size="sm" />
        {value === 0 && <span className="text-xs text-zinc-400">Not rated</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Individual Category Forms
// ============================================================================

type CategoryFormProps = {
  entity: Entity;
  config: FormConfig;
  subratings: SubratingDefinition[];
  subratingValues: Record<string, number>;
  onSubratingChange: (key: string, value: number | null) => void;
  rating: number;
  onRatingChange: (v: number) => void;
  text: string;
  onTextChange: (v: string) => void;
  anonymous: boolean;
  onAnonymousChange: (v: boolean) => void;
};

function DormForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange } = props;
  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Dorm-specific subratings */}
      <div className="rounded-lg bg-amber-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-amber-800 mb-2">Rate Your Living Experience</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Review Text */}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
      />
    </div>
  );
}

function ClassroomForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange } = props;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      <div className="rounded-lg bg-blue-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-blue-800 mb-2">Rate Learning Environment</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function ProfessorForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange } = props;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      <div className="rounded-lg bg-purple-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-purple-800 mb-2">Rate Teaching Quality</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Professor-specific: Module field */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">📚 Module taken:</span>
        <input
          type="text"
          placeholder="e.g. CS2030S"
          className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
      />
    </div>
  );
}

function FoodPlaceForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange } = props;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      <div className="rounded-lg bg-orange-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-orange-800 mb-2">Rate Your Meal</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Food-specific: Dish recommendation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">🍽️ Dish ordered:</span>
        <input
          type="text"
          placeholder="e.g. Chicken Rice"
          className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
      />
    </div>
  );
}

function ToiletForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange } = props;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      <div className="rounded-lg bg-teal-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-teal-800 mb-2">Rate Toilet Quality</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Toilet-specific: Best time to visit */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">🕐 Best time to visit:</span>
        <select className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-200">
          <option value="">Select...</option>
          <option value="morning">Morning (before 10am)</option>
          <option value="midday">Midday (10am-2pm)</option>
          <option value="afternoon">Afternoon (2pm-6pm)</option>
          <option value="evening">Evening (after 6pm)</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
      />
    </div>
  );
}

// ============================================================================
// Main ReviewForm Component
// ============================================================================

type ReviewFormProps = {
  entity: Entity;
  onCreated: () => void;
  /** Compact mode for inline forms */
  compact?: boolean;
};

export default function ReviewForm({ entity, onCreated, compact = false }: ReviewFormProps) {
  const { user } = useAuth();
  const config = FORM_CONFIG[entity.type];
  const applicableSubratings = getApplicableSubratings(entity.type, entity);

  // Form state - subratings default to 0 (not null)
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subratingValues, setSubratingValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    applicableSubratings.forEach((s) => { initial[s.key] = 0; });
    return initial;
  });

  function updateSubrating(key: string, value: number | null) {
    // Convert null to 0
    setSubratingValues((prev) => ({ ...prev, [key]: value ?? 0 }));
  }

  async function handleSubmit() {
    // Only require overall rating - text is optional
    if (rating === 0) {
      console.log("Validation failed: No overall rating selected");
      return;
    }
    
    setSubmitting(true);
    try {
      console.log("Submitting review...", { entityId: entity.id, rating });
      await createReview({
        entityId: entity.id,
        rating,
        text: text.trim(),
        subratings: subratingValues,
        createdAt: Date.now(),
        authorId: user?.uid,
        anonymous,
      });
      
      console.log("Review submitted successfully!");
      
      // Reset form
      setRating(0);
      setText("");
      setSubratingValues(() => {
        const reset: Record<string, number> = {};
        applicableSubratings.forEach((s) => { reset[s.key] = 0; });
        return reset;
      });
      
      onCreated();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const formProps: CategoryFormProps = {
    entity,
    config,
    subratings: applicableSubratings,
    subratingValues,
    onSubratingChange: updateSubrating,
    rating,
    onRatingChange: setRating,
    text,
    onTextChange: setText,
    anonymous,
    onAnonymousChange: setAnonymous,
  };

  // Only require overall rating
  const isValid = rating > 0;

  // Render the appropriate form based on entity type
  function renderCategoryForm() {
    switch (entity.type) {
      case "DORM":
        return <DormForm {...formProps} />;
      case "CLASSROOM":
        return <ClassroomForm {...formProps} />;
      case "PROFESSOR":
        return <ProfessorForm {...formProps} />;
      case "FOOD_PLACE":
        return <FoodPlaceForm {...formProps} />;
      case "TOILET":
        return <ToiletForm {...formProps} />;
      default:
        return null;
    }
  }

  return (
    <Card className={compact ? "space-y-3" : "space-y-4"}>
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-bold">{config.title}</h3>
        <p className="text-sm text-zinc-500">{entity.name}</p>
      </div>

      {/* Category-specific form */}
      {renderCategoryForm()}

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
        <div>
          <div className="text-sm font-medium">Post Anonymously</div>
          <div className="text-xs text-zinc-500">
            {anonymous ? "Your identity is hidden" : "Your name may be visible"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAnonymous(!anonymous)}
          className={`relative h-5 w-9 rounded-full transition ${
            anonymous ? "bg-zinc-900" : "bg-zinc-300"
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
              anonymous ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Validation hint & Submit */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-zinc-400">
          {rating === 0 ? "⚠️ Select an overall rating to submit" : "✓ Ready to submit"}
        </div>
        <Button onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? "Posting..." : "Submit Review"}
        </Button>
      </div>
    </Card>
  );
}
