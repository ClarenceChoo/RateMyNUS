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
    { key: "cleanliness", label: "Cleanliness", helperText: "How clean are common areas and rooms?" },
    { key: "facilities", label: "Facilities", helperText: "Quality of gym, study rooms, laundry, etc." },
    { key: "noiseLevel", label: "Noise Level", helperText: "Is it quiet enough for studying/sleeping?" },
    { key: "community", label: "Community", helperText: "Social atmosphere and hall culture" },
    { key: "valueForMoney", label: "Value for Money", helperText: "Is it worth the cost?" },
  ],
  CLASSROOM: [
    { key: "comfort", label: "Comfort", helperText: "Seating quality and legroom" },
    { key: "visibility", label: "Visibility", helperText: "Can you see the board/screen clearly?" },
    { key: "audioClarity", label: "Audio Clarity", helperText: "Microphone and speaker quality" },
    { key: "aircon", label: "Air Conditioning", helperText: "Temperature comfort" },
    { key: "powerAndWifi", label: "Power & WiFi", helperText: "Outlet availability and network quality" },
  ],
  PROFESSOR: [
    { key: "clarity", label: "Clarity", helperText: "Are explanations easy to understand?" },
    { key: "structureAndPace", label: "Structure & Pace", helperText: "Is the course well-organized?" },
    { key: "helpfulness", label: "Helpfulness", helperText: "Availability and willingness to help" },
    { key: "fairness", label: "Fairness", helperText: "Fair grading and reasonable expectations" },
    { key: "engagement", label: "Engagement", helperText: "How engaging are the lectures?" },
  ],
  FOOD_PLACE: [
    { key: "taste", label: "Taste", helperText: "How good is the food?" },
    { key: "valueForMoney", label: "Value for Money", helperText: "Is it worth the price?" },
    { key: "queueTime", label: "Queue Time", helperText: "How long do you typically wait?" },
    { key: "variety", label: "Variety", helperText: "Range of food options" },
    { key: "cleanliness", label: "Cleanliness", helperText: "Hygiene of the stall and seating" },
  ],
  TOILET: [
    { key: "cleanliness", label: "Cleanliness", helperText: "How clean is it overall?" },
    { key: "availability", label: "Availability", helperText: "Are stalls usually free?" },
    { key: "smell", label: "Smell", helperText: "Any unpleasant odors?" },
    { key: "supplies", label: "Supplies", helperText: "Soap, tissue, hand dryer availability" },
    {
      key: "showerUsability",
      label: "Shower Usability",
      helperText: "Water pressure, temperature, privacy",
      onlyIf: (entity) => entity.hasShower === true,
    },
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
