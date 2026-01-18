import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createEntity, clearEntityCache } from "@/features/entities/entityService";
import type { EntityType } from "@/types";

// ============================================================================
// Entity Type Configuration
// ============================================================================

type EntityTypeConfig = {
  type: EntityType;
  label: string;
  icon: string;
  placeholder: string;
  tagsPlaceholder: string;
};

const ENTITY_TYPES: EntityTypeConfig[] = [
  {
    type: "PROFESSOR",
    label: "Professor",
    icon: "👨‍🏫",
    placeholder: "e.g., Dr. John Tan",
    tagsPlaceholder: "e.g., CS2030S, CS2040S",
  },
  {
    type: "DORM",
    label: "Dorm / Hall",
    icon: "🏠",
    placeholder: "e.g., Tembusu College",
    tagsPlaceholder: "e.g., UTown, Single Room",
  },
  {
    type: "CLASSROOM",
    label: "Classroom / LT",
    icon: "🏫",
    placeholder: "e.g., LT27",
    tagsPlaceholder: "e.g., COM1, Large",
  },
  {
    type: "FOOD_PLACE",
    label: "Food Place",
    icon: "🍜",
    placeholder: "e.g., The Deck",
    tagsPlaceholder: "e.g., Western, Halal",
  },
  {
    type: "TOILET",
    label: "Toilet",
    icon: "🚻",
    placeholder: "e.g., COM2 Level 2 Toilet",
    tagsPlaceholder: "e.g., COM2, Level 2",
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function CreateEntityForm() {
  const navigate = useNavigate();
  
  // Form state
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedConfig = ENTITY_TYPES.find((t) => t.type === selectedType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedType || !name.trim()) {
      setError("Please select a type and enter a name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Parse tags from comma-separated input
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Build location if provided
      const location =
        latitude && longitude
          ? {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }
          : undefined;

      const entityId = await createEntity({
        name: name.trim(),
        type: selectedType,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        location,
      });

      // Clear cache so the new entity appears in lists
      clearEntityCache();
      
      setSuccess(true);
      
      // Navigate to the new entity page after a short delay
      setTimeout(() => {
        navigate(`/entity/${entityId}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create entity:", err);
      setError(err instanceof Error ? err.message : "Failed to create entity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedType(null);
    setName("");
    setDescription("");
    setTagsInput("");
    setLatitude("");
    setLongitude("");
    setError(null);
    setSuccess(false);
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold mb-2">Entity Created!</h2>
        <p className="text-zinc-500 mb-4">Redirecting to the entity page...</p>
        <Button variant="ghost" onClick={resetForm}>
          Create Another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Create New Entity</h2>

      {/* Step 1: Select Entity Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          What would you like to add?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ENTITY_TYPES.map((config) => (
            <button
              key={config.type}
              type="button"
              onClick={() => setSelectedType(config.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition cursor-pointer ${
                selectedType === config.type
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <span className="text-2xl">{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Entity Details Form */}
      {selectedType && selectedConfig && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder={selectedConfig.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              placeholder={`Brief description of this ${selectedConfig.label.toLowerCase()}...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags <span className="text-zinc-400 text-xs">(comma-separated)</span>
            </label>
            <Input
              type="text"
              placeholder={selectedConfig.tagsPlaceholder}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Location (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Location <span className="text-zinc-400 text-xs">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="any"
                placeholder="Latitude (e.g., 1.2947)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                type="number"
                step="any"
                placeholder="Longitude (e.g., 103.7734)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              NUS is approximately at 1.2966° N, 103.7764° E
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedType(null)}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1"
            >
              {submitting ? "Creating..." : `Create ${selectedConfig.label}`}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
