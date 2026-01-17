export type EntityType = "DORM" | "CLASSROOM" | "PROFESSOR" | "FOOD_PLACE" | "TOILET";

export type Zone = "UTOWN" | "KENT_RIDGE" | "BIZ" | "ENGINEERING" | "MEDICINE" | "OTHER";

export type SortOption = "TOP_RATED" | "MOST_REVIEWED" | "NEWEST";

export type Entity = {
  id: string;
  type: EntityType;
  name: string;
  subtitle?: string;       // e.g. "UTown", "COM2", "YIH"
  tags?: string[];         // e.g. ["clean", "quiet"]
  location?: { lat: number; lng: number };
  avgRating?: number;
  ratingCount?: number;
  zone?: Zone;
  hasShower?: boolean;     // for toilets
  imageUrls?: string[];
};

export type Review = {
  id: string;
  entityId: string;
  rating: number;          // 1..5 overall rating
  text: string;
  createdAt: number;       // Date.now()
  authorId?: string;       // uid if logged in / anonymous auth
  anonymous: boolean;
  tags?: string[];
  helpfulCount?: number;
  unhelpfulCount?: number;

  /**
   * Module code for professor reviews (e.g. "CS2030S")
   */
  moduleCode?: string;

  /**
   * Subratings for specific aspects (1-5 each, null if skipped).
   * Keys depend on entity type - see SUBRATINGS_BY_TYPE config.
   */
  subratings?: Record<string, number | null>;

  // Optional AI fields (you can add later)
  ai?: {
    focusLabel?: "PROF_FOCUSED" | "MODULE_FOCUSED" | "MIXED" | "UNKNOWN";
    summary?: string;
    aiRating?: number;
  };
};

export type ImportedProfReview = {
  id: string;
  profEntityId: string;
  sourceModuleCode: string;
  summary: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  inferredRating?: number;      // 1-5, optional
  helpfulCount: number;
  markedIrrelevant: boolean;
  extractedAt: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type EntityFilters = {
  search?: string;
  sort?: SortOption;
  zone?: Zone;
  hasShower?: boolean;       // toilet-only filter
};

export type Bookmark = {
  entityId: string;
  createdAt: number;
};
