import type { EntityType } from "@/types";

export const categories: { type: EntityType; label: string; desc: string }[] = [
  { type: "DORM", label: "Dorms", desc: "Halls, RCs, Houses" },
  { type: "CLASSROOM", label: "LTs / Classrooms", desc: "Lecture theatres & tutorial rooms" },
  { type: "PROFESSOR", label: "Professors", desc: "Teaching experience" },
  { type: "FOOD_PLACE", label: "Food", desc: "Canteens & cafes" },
  { type: "TOILET", label: "Toilets", desc: "Cleanliness + amenities" },
];
