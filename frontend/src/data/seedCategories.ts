import type { EntityType, Zone, SortOption } from "@/types";

export const categories: { type: EntityType; label: string; desc: string; icon: string }[] = [
  { type: "DORM", label: "Dorms", desc: "Halls, RCs, Houses", icon: "🏠" },
  { type: "CLASSROOM", label: "LTs / Classrooms", desc: "Lecture theatres & tutorial rooms", icon: "🎓" },
  { type: "PROFESSOR", label: "Professors", desc: "Teaching experience", icon: "👨‍🏫" },
  { type: "FOOD_PLACE", label: "Food", desc: "Canteens & cafes", icon: "🍜" },
  { type: "TOILET", label: "Toilets", desc: "Cleanliness + amenities", icon: "🚻" },
];

export const zones: { value: Zone; label: string }[] = [
  { value: "UTOWN", label: "UTown" },
  { value: "KENT_RIDGE", label: "Kent Ridge" },
  { value: "BIZ", label: "Business" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "OTHER", label: "Other" },
];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "TOP_RATED", label: "Top Rated" },
  { value: "MOST_REVIEWED", label: "Most Reviewed" },
  { value: "NEWEST", label: "Newest" },
];

export function getCategoryByType(type: EntityType) {
  return categories.find((c) => c.type === type);
}
