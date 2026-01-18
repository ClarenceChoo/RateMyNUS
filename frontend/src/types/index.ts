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
  buildingInfo?: { campus?: string; buildingCode?: string };  // for classrooms
  avgRating?: number;
  ratingCount?: number;
  zone?: Zone;
  hasShower?: boolean;     // for toilets
  imageUrls?: string[];
};

export type Review = {
  id: string;                    // uuid from API
  entityId: string;
  rating: number;                // 1..5 overall rating
  text: string;                  // description from API
  createdAt: number;             // timestamp
  authorName?: string;           // optional display name (like when2meet)
  tags?: string[];               // array of tag strings
  voteCount?: number;            // upvote count
  moduleCode?: string;           // for professor reviews (e.g. "CS2030S")
  subratings?: Record<string, number | null>;  // subrating key -> value (1-5)
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
