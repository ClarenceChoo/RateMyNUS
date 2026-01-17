export type EntityType = "DORM" | "CLASSROOM" | "PROFESSOR" | "FOOD_PLACE" | "TOILET";

export type Entity = {
  id: string;
  type: EntityType;
  name: string;
  subtitle?: string;       // e.g. "UTown", "COM2", "YIH"
  tags?: string[];         // e.g. ["clean", "quiet"]
  location?: { lat: number; lng: number };
  avgRating?: number;
  ratingCount?: number;
};

export type Review = {
  id: string;
  entityId: string;
  rating: number;          // 1..5
  text: string;
  createdAt: number;       // Date.now()
  authorId?: string;       // uid if logged in / anonymous auth
  anonymous: boolean;

  // Optional AI fields (you can add later)
  ai?: {
    focusLabel?: "PROF_FOCUSED" | "MODULE_FOCUSED" | "MIXED" | "UNKNOWN";
    summary?: string;
    aiRating?: number;
  };
};
