import type { EntityType } from "@/types";

export type TagDefinition = {
  id: string;
  label: string;
  icon: string;
  color: string; // bg color class
  textColor: string; // text color class
};

/**
 * Tags by entity type
 */
export const TAGS_BY_TYPE: Record<EntityType, TagDefinition[]> = {
  TOILET: [
    { id: "hidden-gem", label: "Hidden gem", icon: "🚽", color: "bg-green-100", textColor: "text-green-700" },
    { id: "avoid-at-all-costs", label: "Avoid at all costs", icon: "🚫", color: "bg-red-100", textColor: "text-red-700" },
    { id: "very-clean", label: "Very clean", icon: "🧼", color: "bg-blue-100", textColor: "text-blue-700" },
    { id: "poorly-maintained", label: "Poorly maintained", icon: "🛠️", color: "bg-orange-100", textColor: "text-orange-700" },
  ],
  FOOD_PLACE: [
    { id: "worth-the-queue", label: "Worth the queue", icon: "🔥", color: "bg-red-100", textColor: "text-red-700" },
    { id: "overpriced", label: "Overpriced", icon: "💸", color: "bg-yellow-100", textColor: "text-yellow-700" },
    { id: "healthy-ish", label: "Healthy-ish", icon: "🥗", color: "bg-green-100", textColor: "text-green-700" },
    { id: "comfort-food", label: "Comfort food", icon: "🍛", color: "bg-orange-100", textColor: "text-orange-700" },
    { id: "inconsistent-quality", label: "Inconsistent quality", icon: "🧂", color: "bg-gray-100", textColor: "text-gray-700" },
  ],
  PROFESSOR: [
    { id: "clear-explanations", label: "Clear explanations", icon: "🎯", color: "bg-blue-100", textColor: "text-blue-700" },
    { id: "hard-to-follow", label: "Hard to follow", icon: "💤", color: "bg-gray-100", textColor: "text-gray-700" },
    { id: "heavy-workload", label: "Heavy workload", icon: "📚", color: "bg-purple-100", textColor: "text-purple-700" },
    { id: "very-approachable", label: "Very approachable", icon: "🤝", color: "bg-green-100", textColor: "text-green-700" },
    { id: "theory-heavy", label: "Theory-heavy", icon: "🧪", color: "bg-indigo-100", textColor: "text-indigo-700" },
    { id: "practical-heavy", label: "Practical-heavy", icon: "🧪", color: "bg-cyan-100", textColor: "text-cyan-700" },
  ],
  DORM: [
    { id: "very-happening", label: "Very happening", icon: "🎉", color: "bg-pink-100", textColor: "text-pink-700" },
    { id: "good-for-studying", label: "Good for studying", icon: "📖", color: "bg-indigo-100", textColor: "text-indigo-700" },
    { id: "quiet-and-chill", label: "Quiet & chill", icon: "🧘", color: "bg-cyan-100", textColor: "text-cyan-700" },
    { id: "far-from-everything", label: "Far from everything", icon: "🏃", color: "bg-orange-100", textColor: "text-orange-700" },
    { id: "strong-community", label: "Strong community", icon: "🤝", color: "bg-green-100", textColor: "text-green-700" },
  ],
  CLASSROOM: [
    { id: "power-sockets-everywhere", label: "Power sockets everywhere", icon: "🔌", color: "bg-yellow-100", textColor: "text-yellow-700" },
    { id: "freezing-cold", label: "Freezing cold", icon: "🧊", color: "bg-blue-100", textColor: "text-blue-700" },
    { id: "mic-issues", label: "Mic issues", icon: "🔊", color: "bg-red-100", textColor: "text-red-700" },
    { id: "bad-sightlines", label: "Bad sightlines", icon: "👀", color: "bg-gray-100", textColor: "text-gray-700" },
    { id: "uncomfortable-seats", label: "Uncomfortable seats", icon: "💺", color: "bg-orange-100", textColor: "text-orange-700" },
  ],
};

/**
 * Get tags for a given entity type
 */
export function getTagsByType(type: EntityType): TagDefinition[] {
  return TAGS_BY_TYPE[type] || [];
}

/**
 * Get a specific tag by type and id
 */
export function getTagById(type: EntityType, tagId: string): TagDefinition | undefined {
  return TAGS_BY_TYPE[type]?.find((t) => t.id === tagId);
}
