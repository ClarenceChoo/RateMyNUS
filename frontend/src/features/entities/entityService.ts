import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db, hasRealFirebaseConfig } from "@/lib/firebase";
import type { Entity, EntityType, EntityFilters, Paginated } from "@/types";
import { mockEntities, mockBookmarks, delay, filterEntities, getTopRatedThisWeek } from "./mockData";

// Helper: Try Firebase first, fall back to mock on failure
async function tryFirebaseOrMock<T>(
  firebaseFn: () => Promise<T>,
  mockFn: () => Promise<T>
): Promise<T> {
  if (!hasRealFirebaseConfig) {
    return mockFn();
  }
  try {
    return await firebaseFn();
  } catch (error) {
    console.warn("Firebase call failed, using mock data:", error);
    return mockFn();
  }
}

export async function getEntity(entityId: string): Promise<Entity | null> {
  return tryFirebaseOrMock(
    async () => {
      const snap = await getDoc(doc(db, "entities", entityId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Entity, "id">) };
    },
    async () => {
      await delay(200);
      return mockEntities.find((e) => e.id === entityId) ?? null;
    }
  );
}

export async function listEntitiesByType(type: EntityType, take = 30): Promise<Entity[]> {
  return tryFirebaseOrMock(
    async () => {
      const q = query(collection(db, "entities"), where("type", "==", type), limit(take));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entity, "id">) }));
    },
    async () => {
      await delay(200);
      return mockEntities.filter((e) => e.type === type).slice(0, take);
    }
  );
}

// New: List entities with filters and pagination
export async function listEntities(params: {
  type: EntityType;
  filters?: EntityFilters;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Entity>> {
  await delay(250);
  const { type, filters, page = 1, pageSize = 12 } = params;
  
  const allFiltered = filterEntities(type, {
    search: filters?.search,
    zone: filters?.zone,
    hasShower: filters?.hasShower,
    sort: filters?.sort,
  });
  
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

// New: Get top rated entities for home page
export async function getTopRated(limit = 6): Promise<Entity[]> {
  await delay(200);
  return getTopRatedThisWeek(limit);
}

// New: Search across all entity types
export async function searchEntities(query: string, limit = 10): Promise<Entity[]> {
  await delay(200);
  const q = query.toLowerCase();
  return mockEntities
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, limit);
}

// New: Bookmark management
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
