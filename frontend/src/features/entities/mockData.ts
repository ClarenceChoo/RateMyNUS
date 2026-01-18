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
  {
    id: "rev-1",
    entityId: "prof-1",
    rating: 5,
    text: "Best CS1010 prof! Makes programming fun and accessible.",
    createdAt: Date.now() - 86400000,
    
    tags: ["engaging"],
    voteCount: 23,
    
    subratings: { clarity: 5, structureAndPace: 4, helpfulness: 5, fairness: 4, engagement: 5 },
  },
  {
    id: "rev-2",
    entityId: "prof-1",
    rating: 4,
    text: "Tough grader but you'll learn a lot. Office hours are very helpful.",
    createdAt: Date.now() - 172800000,
    
    authorName: "Alex T.",
    tags: ["helpful"],
    voteCount: 15,
    
    subratings: { clarity: 4, structureAndPace: 4, helpfulness: 5, fairness: 3, engagement: 4 },
  },
  {
    id: "rev-3",
    entityId: "prof-2",
    rating: 5,
    text: "Legendary. CS2040S was life-changing.",
    createdAt: Date.now() - 259200000,
    
    voteCount: 89,
    
    subratings: { clarity: 5, structureAndPace: 5, helpfulness: 5, fairness: 5, engagement: 5 },
  },
  {
    id: "rev-4",
    entityId: "dorm-1",
    rating: 4,
    text: "Great community, quiet during exam period. Food is decent.",
    createdAt: Date.now() - 345600000,
    
    tags: ["community"],
    voteCount: 12,
    
    subratings: { cleanliness: 4, facilities: 4, noiseLevel: 5, community: 5, valueForMoney: 3 },
  },
  {
    id: "rev-5",
    entityId: "food-1",
    rating: 3,
    text: "Crowded at peak hours but good variety. The mala is solid.",
    createdAt: Date.now() - 432000000,
    
    voteCount: 8,
    
    subratings: { taste: 4, valueForMoney: 3, queueTime: 2, variety: 4, cleanliness: 3 },
  },
  {
    id: "rev-6",
    entityId: "toilet-3",
    rating: 5,
    text: "Hidden gem! Always clean and rarely crowded.",
    createdAt: Date.now() - 518400000,
    
    tags: ["hidden-gem"],
    voteCount: 34,
    
    subratings: { cleanliness: 5, availability: 5, smell: 5, supplies: 4 },
  },
  {
    id: "rev-7",
    entityId: "class-2",
    rating: 4,
    text: "Good projector and outlets everywhere. AC is freezing though.",
    createdAt: Date.now() - 604800000,
    
    voteCount: 5,
    
    subratings: { comfort: 3, visibility: 5, audioClarity: 4, aircon: 2, powerAndWifi: 5 },
  },
  {
    id: "rev-8",
    entityId: "toilet-2",
    rating: 4,
    text: "Spacious and clean, shower is great after gym sessions.",
    createdAt: Date.now() - 691200000,
    
    voteCount: 18,
    
    subratings: { cleanliness: 4, availability: 3, smell: 4, supplies: 4, showerUsability: 5 },
  },
  {
    id: "rev-9",
    entityId: "dorm-4",
    rating: 5,
    text: "Sports culture is amazing here. Made so many friends through hall activities.",
    createdAt: Date.now() - 777600000,
    
    authorName: "Jordan L.",
    voteCount: 22,
    
    subratings: { cleanliness: 4, facilities: 5, noiseLevel: 3, community: 5, valueForMoney: 4 },
  },
  {
    id: "rev-10",
    entityId: "food-4",
    rating: 4,
    text: "24h is a lifesaver during finals. Decent variety.",
    createdAt: Date.now() - 864000000,
    
    voteCount: 15,
    
    subratings: { taste: 3, valueForMoney: 4, queueTime: 4, variety: 4, cleanliness: 3 },
  },
  // Additional reviews to cover all categories
  {
    id: "rev-11",
    entityId: "dorm-2",
    rating: 4,
    text: "CAPT has a great community. The IGs are engaging and there's always something happening.",
    createdAt: Date.now() - 950400000,
    
    voteCount: 10,
    
    subratings: { cleanliness: 4, facilities: 4, noiseLevel: 3, community: 5, valueForMoney: 4 },
  },
  {
    id: "rev-12",
    entityId: "dorm-3",
    rating: 3,
    text: "RC4 is alright. Systems thinking theme is interesting but not for everyone.",
    createdAt: Date.now() - 1036800000,
    
    authorName: "Sam K.",
    voteCount: 6,
    
    subratings: { cleanliness: 3, facilities: 3, noiseLevel: 4, community: 4, valueForMoney: 3 },
  },
  {
    id: "rev-13",
    entityId: "dorm-5",
    rating: 5,
    text: "Sheares culture is unmatched! Dance Night is legendary.",
    createdAt: Date.now() - 1123200000,
    
    voteCount: 28,
    
    subratings: { cleanliness: 4, facilities: 5, noiseLevel: 2, community: 5, valueForMoney: 4 },
  },
  {
    id: "rev-14",
    entityId: "dorm-6",
    rating: 3,
    text: "PGP is basic but cheap. Good if you just need a place to sleep.",
    createdAt: Date.now() - 1209600000,
    
    voteCount: 14,
    
    subratings: { cleanliness: 3, facilities: 2, noiseLevel: 4, community: 2, valueForMoney: 5 },
  },
  {
    id: "rev-15",
    entityId: "class-1",
    rating: 4,
    text: "LT27 is huge and the audio system is good. Gets cold though.",
    createdAt: Date.now() - 1296000000,
    
    voteCount: 7,
    
    subratings: { comfort: 3, visibility: 4, audioClarity: 5, aircon: 2, powerAndWifi: 3 },
  },
  {
    id: "rev-16",
    entityId: "class-3",
    rating: 3,
    text: "LT19 is okay. Spacious but the projector is outdated.",
    createdAt: Date.now() - 1382400000,
    
    voteCount: 4,
    
    subratings: { comfort: 4, visibility: 3, audioClarity: 3, aircon: 4, powerAndWifi: 2 },
  },
  {
    id: "rev-17",
    entityId: "class-4",
    rating: 4,
    text: "E3 rooms are well-maintained. Good for tutorials.",
    createdAt: Date.now() - 1468800000,
    
    authorName: "Chris W.",
    voteCount: 5,
    
    subratings: { comfort: 4, visibility: 4, audioClarity: 4, aircon: 4, powerAndWifi: 5 },
  },
  {
    id: "rev-18",
    entityId: "class-5",
    rating: 5,
    text: "ERC seminar rooms are the best! Modern and cozy.",
    createdAt: Date.now() - 1555200000,
    
    voteCount: 11,
    
    subratings: { comfort: 5, visibility: 5, audioClarity: 5, aircon: 4, powerAndWifi: 5 },
  },
  {
    id: "rev-19",
    entityId: "prof-3",
    rating: 4,
    text: "Dr. Chen brings real business cases to class. Very practical.",
    createdAt: Date.now() - 1641600000,
    
    voteCount: 9,
    
    subratings: { clarity: 4, structureAndPace: 4, helpfulness: 5, fairness: 4, engagement: 4 },
  },
  {
    id: "rev-20",
    entityId: "prof-4",
    rating: 3,
    text: "Prof Lim knows his stuff but can be intimidating. Fair grader though.",
    createdAt: Date.now() - 1728000000,
    
    authorName: "Riley M.",
    voteCount: 12,
    
    subratings: { clarity: 3, structureAndPace: 3, helpfulness: 3, fairness: 4, engagement: 2 },
  },
  {
    id: "rev-21",
    entityId: "prof-5",
    rating: 5,
    text: "Dr. Sharma is super helpful. Always replies to emails quickly.",
    createdAt: Date.now() - 1814400000,
    
    voteCount: 16,
    
    subratings: { clarity: 5, structureAndPace: 4, helpfulness: 5, fairness: 5, engagement: 4 },
  },
  {
    id: "rev-22",
    entityId: "food-2",
    rating: 3,
    text: "The Deck is cheap but the queue is insane during lunch.",
    createdAt: Date.now() - 1900800000,
    
    voteCount: 20,
    
    subratings: { taste: 3, valueForMoney: 5, queueTime: 1, variety: 4, cleanliness: 3 },
  },
  {
    id: "rev-23",
    entityId: "food-3",
    rating: 4,
    text: "Fine Food is underrated. Quick service and decent prices.",
    createdAt: Date.now() - 1987200000,
    
    voteCount: 8,
    
    subratings: { taste: 4, valueForMoney: 4, queueTime: 5, variety: 3, cleanliness: 4 },
  },
  {
    id: "rev-24",
    entityId: "food-5",
    rating: 4,
    text: "Flavours has good halal options. A bit pricier than other canteens.",
    createdAt: Date.now() - 2073600000,
    authorName: "Anonymous",
    voteCount: 13,
    subratings: { taste: 4, valueForMoney: 3, queueTime: 4, variety: 5, cleanliness: 4 },
  },
  {
    id: "rev-25",
    entityId: "toilet-1",
    rating: 4,
    text: "COM2 toilets are well-maintained. Rarely crowded.",
    createdAt: Date.now() - 2160000000,
    
    voteCount: 9,
    
    subratings: { cleanliness: 4, availability: 5, smell: 4, supplies: 4 },
  },
  {
    id: "rev-26",
    entityId: "toilet-4",
    rating: 4,
    text: "Biz shower is decent. Good water pressure.",
    createdAt: Date.now() - 2246400000,
    
    voteCount: 11,
    
    subratings: { cleanliness: 4, availability: 3, smell: 4, supplies: 3, showerUsability: 4 },
  },
  {
    id: "rev-27",
    entityId: "toilet-5",
    rating: 3,
    text: "EA toilet is okay. Sometimes runs out of soap.",
    createdAt: Date.now() - 2332800000,
    
    voteCount: 5,
    
    subratings: { cleanliness: 3, availability: 4, smell: 3, supplies: 2 },
  },
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
