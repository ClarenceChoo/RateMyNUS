/**
 * NUSMods API integration for fetching module data
 * Data is cached in localStorage to avoid repeated API calls
 */

const NUSMODS_API_BASE = "https://api.nusmods.com/v2";
const CACHE_KEY = "nusmods_modules";
const CACHE_EXPIRY_KEY = "nusmods_modules_expiry";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export type NusModule = {
  moduleCode: string;
  title: string;
  semesters: number[];
};

/**
 * Get the current academic year in NUSMods format (e.g., "2025-2026")
 * Academic year starts in August, so Jan-Jul is previous year
 */
function getCurrentAcadYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // If Jan-Jul, academic year started previous year
  // If Aug-Dec, academic year started this year
  if (month < 7) {
    return `${year - 1}-${year}`;
  }
  return `${year}-${year + 1}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(): boolean {
  try {
    const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiryStr) return false;
    
    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

/**
 * Get modules from cache
 */
function getFromCache(): NusModule[] | null {
  try {
    if (!isCacheValid()) return null;
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    return JSON.parse(cached) as NusModule[];
  } catch {
    return null;
  }
}

/**
 * Save modules to cache
 */
function saveToCache(modules: NusModule[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(modules));
    localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION_MS));
  } catch (error) {
    console.warn("Failed to cache NUSMods data:", error);
  }
}

/**
 * Fetch all modules from NUSMods API
 * Uses cache if available and not expired
 */
export async function fetchAllModules(): Promise<NusModule[]> {
  // Check cache first
  const cached = getFromCache();
  if (cached) {
    console.log(`📚 NUSMods: Using cached data (${cached.length} modules)`);
    return cached;
  }

  // Fetch from API
  const acadYear = getCurrentAcadYear();
  const url = `${NUSMODS_API_BASE}/${acadYear}/moduleList.json`;

  console.log(`📚 NUSMods: Fetching from ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const modules: NusModule[] = await response.json();
    console.log(`📚 NUSMods: Fetched ${modules.length} modules`);

    // Cache the result
    saveToCache(modules);

    return modules;
  } catch (error) {
    console.error("Failed to fetch NUSMods data:", error);
    
    // Return empty array on failure
    return [];
  }
}

/**
 * Search modules by code or title
 * Returns up to `limit` results
 */
export function searchModules(
  modules: NusModule[],
  query: string,
  limit = 50
): NusModule[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  
  // Prioritize exact code matches, then code starts with, then title contains
  const exactCode: NusModule[] = [];
  const startsWithCode: NusModule[] = [];
  const containsQuery: NusModule[] = [];

  for (const mod of modules) {
    const code = mod.moduleCode.toLowerCase();
    const title = mod.title.toLowerCase();

    if (code === q) {
      exactCode.push(mod);
    } else if (code.startsWith(q)) {
      startsWithCode.push(mod);
    } else if (code.includes(q) || title.includes(q)) {
      containsQuery.push(mod);
    }
  }

  return [...exactCode, ...startsWithCode, ...containsQuery].slice(0, limit);
}

/**
 * Get popular CS/IS modules for quick selection
 */
export function getPopularModules(modules: NusModule[]): NusModule[] {
  const popularCodes = [
    "CS1010", "CS1010S", "CS1010X", "CS1010E",
    "CS1231", "CS1231S",
    "CS2030", "CS2030S",
    "CS2040", "CS2040S",
    "CS2100", "CS2101", "CS2102", "CS2103", "CS2103T",
    "CS2105", "CS2106",
    "CS3203", "CS3216", "CS3217", "CS3230",
    "IS1108", "IS2101", "IS2102", "IS2103",
    "MA1521", "MA1522", "MA2001",
    "ST2334",
  ];

  return modules.filter((m) => popularCodes.includes(m.moduleCode));
}

/**
 * Clear the module cache
 */
export function clearModuleCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
  console.log("📚 NUSMods: Cache cleared");
}
