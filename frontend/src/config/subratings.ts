import type { EntityType } from "@/types";

/**
 * Subrating definition for review forms
 */
export type SubratingDefinition = {
  key: string;
  label: string;
  helperText?: string;
  /** Conditional display: (entity) => boolean */
  onlyIf?: (entity: { hasShower?: boolean }) => boolean;
};

/**
 * Single source of truth for subratings by entity type.
 * Each entity type has its own set of subratings that users can rate 1-5.
 */
export const SUBRATINGS_BY_TYPE: Record<EntityType, SubratingDefinition[]> = {
  DORM: [
    { key: "roomCondition", label: "Room Condition", helperText: "Quality and maintenance of room" },
    { key: "cleanliness", label: "Cleanliness", helperText: "Common areas and rooms" },
    { key: "facilities", label: "Facilities", helperText: "Gym, study rooms, pantry, etc." },
    { key: "community", label: "Community / Culture", helperText: "Social atmosphere and hall culture" },
    { key: "valueForMoney", label: "Value for Money", helperText: "Is it worth the cost?" },
  ],
  CLASSROOM: [
    { key: "comfort", label: "Seating Comfort", helperText: "Quality and legroom" },
    { key: "visibility", label: "Visibility", helperText: "Can you see the board clearly?" },
    { key: "audioClarity", label: "Audio Quality", helperText: "Microphone and speaker quality" },
    { key: "ventilation", label: "Ventilation / AC", helperText: "Air conditioning and comfort" },
    { key: "powerAndWifi", label: "Power Socket Availability", helperText: "Outlet availability" },
  ],
  PROFESSOR: [
    { key: "clarity", label: "Teaching Clarity", helperText: "Are explanations easy to understand?" },
    { key: "engagement", label: "Engagement", helperText: "How engaging are the lectures?" },
    { key: "approachability", label: "Approachability", helperText: "Availability and willingness to help" },
    { key: "fairness", label: "Fairness in Grading", helperText: "Fair grading and reasonable expectations" },
    { key: "organisation", label: "Organisation", helperText: "Is the course well-organized?" },
  ],
  FOOD_PLACE: [
    { key: "taste", label: "Taste", helperText: "How good is the food?" },
    { key: "valueForMoney", label: "Value for Money", helperText: "Is it worth the price?" },
    { key: "portionSize", label: "Portion Size", helperText: "Is it a reasonable serving?" },
    { key: "hygiene", label: "Hygiene", helperText: "Cleanliness of the stall and food" },
    { key: "waitingTime", label: "Waiting Time", helperText: "How long do you typically wait?" },
  ],
  TOILET: [
    { key: "cleanliness", label: "Cleanliness", helperText: "How clean is it?" },
    { key: "smell", label: "Odour", helperText: "Any unpleasant odors?" },
    { key: "maintenance", label: "Maintenance", helperText: "Leaks, broken locks, repairs" },
    { key: "privacy", label: "Privacy", helperText: "Door gaps, stall spacing" },
    { key: "accessibility", label: "Accessibility", helperText: "Accessible stall condition" },
  ],
};

/**
 * Get subrating keys for a given entity type (for type safety)
 */
export function getSubratingKeys(type: EntityType): string[] {
  return SUBRATINGS_BY_TYPE[type].map((s) => s.key);
}

/**
 * Get applicable subratings for an entity (respects onlyIf conditions)
 */
export function getApplicableSubratings(
  type: EntityType,
  entity?: { hasShower?: boolean }
): SubratingDefinition[] {
  return SUBRATINGS_BY_TYPE[type].filter(
    (s) => !s.onlyIf || (entity && s.onlyIf(entity))
  );
}
