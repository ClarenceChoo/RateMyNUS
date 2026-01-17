import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RatingStars } from "@/components/RatingStars";
import { createReview } from "@/features/reviews/reviewService";
import { getApplicableSubratings, type SubratingDefinition } from "@/config/subratings";
import { getTagsByType, type TagDefinition } from "@/config/tags";
import ModuleSelect from "@/features/modules/ModuleSelect";
import type { Entity, EntityType } from "@/types";

// ============================================================================
// Category-specific form configurations
// ============================================================================

type FormConfig = {
  title: string;
  icon: string;
  placeholder: string;
};

const FORM_CONFIG: Record<EntityType, FormConfig> = {
  DORM: {
    title: "Rate this Dorm",
    icon: "🏠",
    placeholder: "How's the living experience? Talk about room quality, facilities, social life, noise levels...",
  },
  CLASSROOM: {
    title: "Rate this Classroom",
    icon: "🏫",
    placeholder: "How's learning here? Discuss seating comfort, visibility, audio quality, air conditioning...",
  },
  PROFESSOR: {
    title: "Rate this Professor",
    icon: "👨‍🏫",
    placeholder: "Share your experience. How are their teaching style, clarity, helpfulness, grading fairness?",
  },
  FOOD_PLACE: {
    title: "Rate this Food Place",
    icon: "🍜",
    placeholder: "How's the food? Talk about taste, portion size, value, queue time, cleanliness...",
  },
  TOILET: {
    title: "Rate this Toilet",
    icon: "🚻",
    placeholder: "How's the experience? Discuss cleanliness, availability, supplies, smell...",
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
// Tag Selector Component
// ============================================================================

function TagSelector({
  tags,
  selectedTags,
  onTagToggle,
}: {
  tags: TagDefinition[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Tags (optional)</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagToggle(tag.id)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedTags.includes(tag.id)
                ? `${tag.color} ${tag.textColor} ring-2 ring-offset-1`
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
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
  const config = FORM_CONFIG[entity.type];
  const applicableSubratings = getApplicableSubratings(entity.type, entity);
  const applicableTags = getTagsByType(entity.type);

  // Form state
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [subratingValues, setSubratingValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    applicableSubratings.forEach((s) => { initial[s.key] = 0; });
    return initial;
  });

  function updateSubrating(key: string, value: number | null) {
    setSubratingValues((prev) => ({ ...prev, [key]: value ?? 0 }));
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      console.log("Validation failed: No overall rating selected");
      return;
    }
    
    setSubmitting(true);
    try {
      await createReview({
        entityId: entity.id,
        rating,
        text: text.trim(),
        subratings: subratingValues,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        createdAt: Date.now(),
        authorName: authorName.trim() || undefined,
        ...(entity.type === "PROFESSOR" && moduleCode ? { moduleCode } : {}),
      });
      
      // Reset form
      setRating(0);
      setText("");
      setAuthorName("");
      setModuleCode("");
      setSelectedTags([]);
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

  const isValid = rating > 0;

  return (
    <Card className={compact ? "space-y-3" : "space-y-4"}>
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-bold">{config.icon} {config.title}</h3>
        <p className="text-sm text-zinc-500">{entity.name}</p>
      </div>

      {/* Overall Rating */}
      <div className="flex items-center justify-between">
        <span className="font-semibold">Overall Rating *</span>
        <RatingStars value={rating} onChange={(v) => setRating(v ?? 0)} />
      </div>

      {/* Module Selection for Professors */}
      {entity.type === "PROFESSOR" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Module Taken</label>
          <ModuleSelect
            value={moduleCode}
            onChange={setModuleCode}
            placeholder="Search for a module (e.g. CS1101S)"
          />
        </div>
      )}

      {/* Subratings */}
      {applicableSubratings.length > 0 && (
        <div className="space-y-1 rounded-lg bg-zinc-50 p-4">
          <div className="text-sm font-semibold mb-2">Rate Specific Aspects (optional)</div>
          {applicableSubratings.map((s) => (
            <SubratingInput
              key={s.key}
              subrating={s}
              value={subratingValues[s.key]}
              onChange={(v) => updateSubrating(s.key, v)}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      <TagSelector 
        tags={applicableTags} 
        selectedTags={selectedTags} 
        onTagToggle={toggleTag} 
      />

      {/* Review Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Review (optional)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={config.placeholder}
          rows={4}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      {/* Optional Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Name (optional)</label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Leave blank to post anonymously"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
        />
        <p className="text-xs text-zinc-500">
          {authorName.trim() ? `Posting as "${authorName.trim()}"` : "Posting anonymously"}
        </p>
      </div>

      {/* Submit */}
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
