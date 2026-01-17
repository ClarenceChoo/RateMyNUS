import type { Entity, Review, ImportedProfReview, EntityType, Zone } from "@/types";

// Deterministic mock entities
export const mockEntities: Entity[] = [
  // DORMS
  { id: "dorm-1", type: "DORM", name: "Tembusu College", subtitle: "UTown", zone: "UTOWN", tags: ["quiet", "study-friendly"], avgRating: 4.2, ratingCount: 156, location: { lat: 1.3056, lng: 103.7736 } },
  { id: "dorm-2", type: "DORM", name: "CAPT", subtitle: "UTown", zone: "UTOWN", tags: ["community", "active"], avgRating: 4.0, ratingCount: 98, location: { lat: 1.3058, lng: 103.7738 } },
  { id: "dorm-3", type: "DORM", name: "RC4", subtitle: "UTown", zone: "UTOWN", tags: ["systems-thinking"], avgRating: 3.9, ratingCount: 87, location: { lat: 1.3054, lng: 103.7734 } },
  { id: "dorm-4", type: "DORM", name: "Eusoff Hall", subtitle: "Kent Ridge", zone: "KENT_RIDGE", tags: ["sports", "vibrant"], avgRating: 4.3, ratingCount: 203, location: { lat: 1.2936, lng: 103.7704 } },
  { id: "dorm-5", type: "DORM", name: "Sheares Hall", subtitle: "Kent Ridge", zone: "KENT_RIDGE", tags: ["dance", "culture"], avgRating: 4.1, ratingCount: 178, location: { lat: 1.2912, lng: 103.7752 } },
  { id: "dorm-6", type: "DORM", name: "PGP House", subtitle: "Kent Ridge", zone: "KENT_RIDGE", tags: ["budget", "quiet"], avgRating: 3.5, ratingCount: 245, location: { lat: 1.2908, lng: 103.7808 } },

  // CLASSROOMS
  { id: "class-1", type: "CLASSROOM", name: "LT27", subtitle: "Faculty of Science", zone: "KENT_RIDGE", tags: ["large", "good-audio"], avgRating: 3.8, ratingCount: 67 },
  { id: "class-2", type: "CLASSROOM", name: "COM1-0212", subtitle: "School of Computing", zone: "KENT_RIDGE", tags: ["well-equipped", "cold"], avgRating: 4.1, ratingCount: 89 },
  { id: "class-3", type: "CLASSROOM", name: "LT19", subtitle: "FASS", zone: "KENT_RIDGE", tags: ["spacious"], avgRating: 3.6, ratingCount: 54 },
  { id: "class-4", type: "CLASSROOM", name: "E3-06-15", subtitle: "Engineering", zone: "ENGINEERING", tags: ["projector", "outlets"], avgRating: 4.0, ratingCount: 45 },
  { id: "class-5", type: "CLASSROOM", name: "ERC SR1", subtitle: "UTown", zone: "UTOWN", tags: ["modern", "small"], avgRating: 4.4, ratingCount: 32 },

  // PROFESSORS
  { id: "prof-1", type: "PROFESSOR", name: "Prof. Aaron Tan", subtitle: "School of Computing", zone: "KENT_RIDGE", tags: ["engaging", "tough-grader"], avgRating: 4.5, ratingCount: 312 },
  { id: "prof-2", type: "PROFESSOR", name: "Prof. Ben Leong", subtitle: "School of Computing", zone: "KENT_RIDGE", tags: ["legendary", "challenging"], avgRating: 4.8, ratingCount: 567 },
  { id: "prof-3", type: "PROFESSOR", name: "Dr. Sarah Chen", subtitle: "Business School", zone: "BIZ", tags: ["approachable", "practical"], avgRating: 4.2, ratingCount: 189 },
  { id: "prof-4", type: "PROFESSOR", name: "Prof. Michael Lim", subtitle: "Medicine", zone: "MEDICINE", tags: ["knowledgeable", "strict"], avgRating: 3.9, ratingCount: 98 },
  { id: "prof-5", type: "PROFESSOR", name: "Dr. Priya Sharma", subtitle: "Engineering", zone: "ENGINEERING", tags: ["helpful", "organized"], avgRating: 4.3, ratingCount: 156 },

  // FOOD PLACES
  { id: "food-1", type: "FOOD_PLACE", name: "Techno Edge", subtitle: "Engineering", zone: "ENGINEERING", tags: ["variety", "crowded"], avgRating: 3.7, ratingCount: 423 },
  { id: "food-2", type: "FOOD_PLACE", name: "The Deck", subtitle: "FASS", zone: "KENT_RIDGE", tags: ["cheap", "long-queue"], avgRating: 3.5, ratingCount: 512 },
  { id: "food-3", type: "FOOD_PLACE", name: "Fine Food", subtitle: "Science", zone: "KENT_RIDGE", tags: ["fast", "value"], avgRating: 3.8, ratingCount: 287 },
  { id: "food-4", type: "FOOD_PLACE", name: "UTown Koufu", subtitle: "UTown", zone: "UTOWN", tags: ["24h", "convenient"], avgRating: 3.6, ratingCount: 634 },
  { id: "food-5", type: "FOOD_PLACE", name: "Flavours @ UTown", subtitle: "UTown", zone: "UTOWN", tags: ["halal", "variety"], avgRating: 4.0, ratingCount: 345 },

  // TOILETS
  { id: "toilet-1", type: "TOILET", name: "COM2 L1 Male", subtitle: "School of Computing", zone: "KENT_RIDGE", tags: ["clean", "quiet"], avgRating: 4.2, ratingCount: 78, hasShower: false },
  { id: "toilet-2", type: "TOILET", name: "UTown Gym Toilet", subtitle: "UTown", zone: "UTOWN", tags: ["shower", "spacious"], avgRating: 4.5, ratingCount: 112, hasShower: true },
  { id: "toilet-3", type: "TOILET", name: "Central Library B1", subtitle: "CLB", zone: "KENT_RIDGE", tags: ["hidden-gem", "clean"], avgRating: 4.6, ratingCount: 45, hasShower: false },
  { id: "toilet-4", type: "TOILET", name: "Biz2 L3 Shower", subtitle: "Business", zone: "BIZ", tags: ["shower", "private"], avgRating: 4.1, ratingCount: 67, hasShower: true },
  { id: "toilet-5", type: "TOILET", name: "Engineering EA L2", subtitle: "Engineering", zone: "ENGINEERING", tags: ["accessible"], avgRating: 3.4, ratingCount: 34, hasShower: false },
];

// Deterministic mock reviews
export const mockReviews: Review[] = [
  { id: "rev-1", entityId: "prof-1", rating: 5, text: "Best CS1010 prof! Makes programming fun and accessible.", createdAt: Date.now() - 86400000, anonymous: true, tags: ["engaging"], helpfulCount: 23, unhelpfulCount: 2 },
  { id: "rev-2", entityId: "prof-1", rating: 4, text: "Tough grader but you'll learn a lot. Office hours are very helpful.", createdAt: Date.now() - 172800000, anonymous: false, authorId: "user-1", tags: ["helpful"], helpfulCount: 15, unhelpfulCount: 1 },
  { id: "rev-3", entityId: "prof-2", rating: 5, text: "Legendary. CS2040S was life-changing.", createdAt: Date.now() - 259200000, anonymous: true, helpfulCount: 89, unhelpfulCount: 3 },
  { id: "rev-4", entityId: "dorm-1", rating: 4, text: "Great community, quiet during exam period. Food is decent.", createdAt: Date.now() - 345600000, anonymous: true, tags: ["community"], helpfulCount: 12, unhelpfulCount: 0 },
  { id: "rev-5", entityId: "food-1", rating: 3, text: "Crowded at peak hours but good variety. The mala is solid.", createdAt: Date.now() - 432000000, anonymous: true, helpfulCount: 8, unhelpfulCount: 2 },
  { id: "rev-6", entityId: "toilet-3", rating: 5, text: "Hidden gem! Always clean and rarely crowded.", createdAt: Date.now() - 518400000, anonymous: true, tags: ["hidden-gem"], helpfulCount: 34, unhelpfulCount: 0 },
  { id: "rev-7", entityId: "class-2", rating: 4, text: "Good projector and outlets everywhere. AC is freezing though.", createdAt: Date.now() - 604800000, anonymous: true, helpfulCount: 5, unhelpfulCount: 1 },
];

// AI-extracted professor reviews (mock)
export const mockImportedProfReviews: ImportedProfReview[] = [
  { id: "ai-1", profEntityId: "prof-1", sourceModuleCode: "CS1010", summary: "Students praised the clear explanations and well-structured lectures. Many found the pace appropriate for beginners.", confidence: "HIGH", inferredRating: 4, helpfulCount: 12, markedIrrelevant: false, extractedAt: Date.now() - 86400000 * 30 },
  { id: "ai-2", profEntityId: "prof-1", sourceModuleCode: "CS2030S", summary: "Mixed feedback on workload. Some felt assignments were too challenging, others appreciated the rigor.", confidence: "MEDIUM", inferredRating: 3, helpfulCount: 8, markedIrrelevant: false, extractedAt: Date.now() - 86400000 * 60 },
  { id: "ai-3", profEntityId: "prof-2", sourceModuleCode: "CS2040S", summary: "Overwhelmingly positive feedback. Students describe the teaching as transformative and highly engaging.", confidence: "HIGH", inferredRating: 5, helpfulCount: 45, markedIrrelevant: false, extractedAt: Date.now() - 86400000 * 45 },
  { id: "ai-4", profEntityId: "prof-2", sourceModuleCode: "CS3230", summary: "Challenging material but well-taught. Office hours were particularly helpful.", confidence: "MEDIUM", helpfulCount: 23, markedIrrelevant: false, extractedAt: Date.now() - 86400000 * 90 },
  { id: "ai-5", profEntityId: "prof-3", sourceModuleCode: "BT1101", summary: "Practical examples from industry. Some students wanted more theoretical depth.", confidence: "LOW", inferredRating: 4, helpfulCount: 6, markedIrrelevant: false, extractedAt: Date.now() - 86400000 * 20 },
];

// In-memory bookmarks (per-session mock)
export const mockBookmarks: Set<string> = new Set(["prof-1", "food-1"]);

// Helper to simulate network delay
export function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get entities by type with optional filters
export function filterEntities(
  type: EntityType,
  filters?: { search?: string; zone?: Zone; hasShower?: boolean; sort?: string }
): Entity[] {
  let result = mockEntities.filter((e) => e.type === type);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters?.zone) {
    result = result.filter((e) => e.zone === filters.zone);
  }

  if (filters?.hasShower !== undefined && type === "TOILET") {
    result = result.filter((e) => e.hasShower === filters.hasShower);
  }

  // Sort
  if (filters?.sort === "TOP_RATED") {
    result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  } else if (filters?.sort === "MOST_REVIEWED") {
    result.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
  } else if (filters?.sort === "NEWEST") {
    // Mock: reverse order as proxy for "newest"
    result.reverse();
  }

  return result;
}

// Get top rated across all types (for home page)
export function getTopRatedThisWeek(limit: number = 6): Entity[] {
  return [...mockEntities]
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, limit);
}
