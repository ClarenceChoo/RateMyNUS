import type { Entity, EntityType, EntityFilters, Paginated, Zone } from "@/types";
import { env } from "@/config/env";
import { mockBookmarks, delay } from "./mockData";

// ============================================================================
// API Types
// ============================================================================

// API response type from backend - flexible to handle different entity types
type ApiEntity = {
  id: string;
  name: string;
  description?: string;
  type: string;
  location?: string | { latitude?: number; longitude?: number; campus?: string; building_code?: string; address?: string };
  tags?: string[];
  avgRating?: number;
  ratingCount?: number;
  reviewSummary?: string;
  createdAt?: string;
  zone?: string;
  building?: string;
  capacity?: number;
  floor?: number;
  features?: Record<string, boolean>;
};

// Request type for creating a new entity
export type CreateEntityRequest = {
  name: string;
  type: EntityType;
  description?: string;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
};

// ============================================================================
// Type Mapping Functions
// ============================================================================

// Convert API entity type to frontend EntityType
function mapApiType(apiType: string): EntityType {
  const typeMap: Record<string, EntityType> = {
    // Food places
    "Canteen": "FOOD_PLACE",
    "Food": "FOOD_PLACE",
    "FOOD_PLACE": "FOOD_PLACE",
    // Dorms
    "Dorm": "DORM",
    "DORM": "DORM",
    // Classrooms (includes various room types)
    "Classroom": "CLASSROOM",
    "CLASSROOM": "CLASSROOM",
    "Tutorial Room": "CLASSROOM",
    "Lecture Theatre": "CLASSROOM",
    "Seminar Room": "CLASSROOM",
    "Auditorium": "CLASSROOM",
    // Professors
    "Professor": "PROFESSOR",
    "PROFESSOR": "PROFESSOR",
    // Toilets
    "Toilet": "TOILET",
    "TOILET": "TOILET",
  };
  return typeMap[apiType] ?? "FOOD_PLACE";
}

// Convert API zone to frontend Zone
function mapApiZone(zone?: string): Zone | undefined {
  if (!zone) return undefined;
  const zoneMap: Record<string, Zone> = {
    "UTown": "UTOWN",
    "UTOWN": "UTOWN",
    "Kent Ridge": "KENT_RIDGE",
    "KENT_RIDGE": "KENT_RIDGE",
    "Business": "BIZ",
    "BIZ": "BIZ",
    "Engineering": "ENGINEERING",
    "ENGINEERING": "ENGINEERING",
    "Medicine": "MEDICINE",
    "MEDICINE": "MEDICINE",
    "Science": "OTHER",
    "Other": "OTHER",
    "OTHER": "OTHER",
  };
  return zoneMap[zone] ?? "OTHER";
}

// Convert API entity to frontend Entity
function mapApiEntity(apiEntity: ApiEntity): Entity {
  const entity: Entity = {
    id: apiEntity.id,
    type: mapApiType(apiEntity.type),
    name: apiEntity.name,
    subtitle: apiEntity.description,
    tags: apiEntity.tags,
    avgRating: apiEntity.avgRating ?? 0,
    ratingCount: apiEntity.ratingCount ?? 0,
    zone: mapApiZone(apiEntity.zone),
    reviewSummary: apiEntity.reviewSummary,
  };

  // Parse location - can be string "lat lng" or object with latitude/longitude
  if (apiEntity.location) {
    if (typeof apiEntity.location === "string") {
      const parts = apiEntity.location.split(" ").map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        entity.location = { lat: parts[0], lng: parts[1] };
      }
    } else if (typeof apiEntity.location === "object") {
      // Handle { latitude, longitude } format from API
      const loc = apiEntity.location;
      if (loc.latitude !== undefined && loc.longitude !== undefined) {
        entity.location = { lat: loc.latitude, lng: loc.longitude };
      }
      // Handle { campus, building_code } format for classrooms
      if (loc.campus || loc.building_code) {
        entity.buildingInfo = {
          campus: loc.campus,
          buildingCode: loc.building_code,
        };
      }
    }
  }

  return entity;
}

// LocalStorage keys
const CACHE_KEY = "ratemynus_entities";
const CACHE_TS_KEY = "ratemynus_entities_ts";

// In-memory cache (faster than localStorage for same session)
let cachedEntities: Entity[] | null = null;

// Clear cache on page load/refresh
localStorage.removeItem(CACHE_KEY);
localStorage.removeItem(CACHE_TS_KEY);

// Load from localStorage on init
function loadFromLocalStorage(): Entity[] | null {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to load entities from localStorage:", e);
  }
  return null;
}

// Save to localStorage
function saveToLocalStorage(entities: Entity[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entities));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to save entities to localStorage:", e);
  }
}

// Clear the entity cache - call this after creating a review
export function clearEntityCache() {
  cachedEntities = null;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TS_KEY);
}

// Force refresh from API (for manual refresh buttons)
export async function forceRefreshEntities(): Promise<Entity[]> {
  clearEntityCache();
  return fetchAllEntities();
}

// Fetch all entities from API (uses localStorage cache)
async function fetchAllEntities(): Promise<Entity[]> {
  // Check in-memory cache first
  if (cachedEntities && cachedEntities.length > 0) {
    return cachedEntities;
  }

  // Check localStorage cache
  const localData = loadFromLocalStorage();
  if (localData && localData.length > 0) {
    cachedEntities = localData;
    return cachedEntities;
  }

  // Fetch from API only if no cache exists
  try {
    const response = await fetch(env.api.getEntities);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    // Handle both array and object with entities property
    let entities: ApiEntity[];
    if (Array.isArray(data)) {
      entities = data;
    } else if (data && typeof data === "object" && Array.isArray(data.entities)) {
      entities = data.entities;
    } else if (data && typeof data === "object" && Array.isArray(data.data)) {
      entities = data.data;
    } else {
      console.error("Unexpected API response format:", data);
      throw new Error("Unexpected API response format");
    }
    
    cachedEntities = entities.map(mapApiEntity);
    saveToLocalStorage(cachedEntities);
    return cachedEntities;
  } catch (error) {
    console.error("Failed to fetch entities from API:", error);
    // Return cached data if available, even if stale
    if (cachedEntities) {
      return cachedEntities;
    }
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

export async function getEntity(entityId: string): Promise<Entity | null> {
  const entities = await fetchAllEntities();
  return entities.find((e) => e.id === entityId) ?? null;
}

export async function listEntitiesByType(type: EntityType, take = 30): Promise<Entity[]> {
  const entities = await fetchAllEntities();
  return entities.filter((e) => e.type === type).slice(0, take);
}

// Helper to filter entities locally
function filterEntitiesLocal(
  entities: Entity[],
  type: EntityType,
  filters?: EntityFilters
): Entity[] {
  let result = entities.filter((e) => e.type === type);

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

  if (filters?.hasShower !== undefined) {
    result = result.filter((e) => e.hasShower === filters.hasShower);
  }

  // Sort
  if (filters?.sort === "TOP_RATED") {
    result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  } else if (filters?.sort === "MOST_REVIEWED") {
    result.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
  }

  return result;
}

// List entities with filters and pagination
export async function listEntities(params: {
  type: EntityType;
  filters?: EntityFilters;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Entity>> {
  const { type, filters, page = 1, pageSize = 12 } = params;
  
  const allEntities = await fetchAllEntities();
  const allFiltered = filterEntitiesLocal(allEntities, type, filters);
  
  const start = (page - 1) * pageSize;
  const items = allFiltered.slice(start, start + pageSize);
  
  return {
    items,
    total: allFiltered.length,
    page,
    pageSize,
    hasMore: start + pageSize < allFiltered.length,
  };
}

// Get top rated entities for home page
export async function getTopRated(topLimit = 6): Promise<Entity[]> {
  const entities = await fetchAllEntities();
  return [...entities]
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, topLimit);
}

// Search across all entity types
export async function searchEntities(searchQuery: string, searchLimit = 10): Promise<Entity[]> {
  const entities = await fetchAllEntities();
  const q = searchQuery.toLowerCase();
  return entities
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, searchLimit);
}

// ============================================================================
// Create Entity
// ============================================================================

export async function createEntity(request: CreateEntityRequest): Promise<string> {
  const response = await fetch(env.api.createEntity, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create entity: ${response.status}`);
  }

  const data = await response.json();
  
  // Clear cache so the new entity appears
  clearEntityCache();
  
  // Return the new entity ID
  return data.id || data.entityId;
}

// Bookmark management (local only for now)
export async function toggleBookmark(entityId: string): Promise<boolean> {
  await delay(100);
  if (mockBookmarks.has(entityId)) {
    mockBookmarks.delete(entityId);
    return false;
  } else {
    mockBookmarks.add(entityId);
    return true;
  }
}

export async function listBookmarks(): Promise<Entity[]> {
  await delay(200);
  return mockEntities.filter((e) => mockBookmarks.has(e.id));
}

export async function isBookmarked(entityId: string): Promise<boolean> {
  await delay(50);
  return mockBookmarks.has(entityId);
}
