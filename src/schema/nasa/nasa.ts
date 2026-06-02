import { getBuiltMesh } from '../../../.mesh/index';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (startDate: string, endDate: string) => `${startDate}_${endDate}`;

const getFromCache = (key: string): any | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setInCache = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const getNearEarthObjects = async (startDate: string, endDate: string) => {
  const cacheKey = getCacheKey(startDate, endDate);

  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`);
    return cached;
  }

  console.log(`Cache miss for ${cacheKey} — fetching from NASA API`);

  const mesh = await getBuiltMesh();

  const result = await mesh.execute(`
    query {
      nearEarthObjectFeed(start_date: "${startDate}", end_date: "${endDate}")
    }
  `, {});

  const raw = (result?.data as any)?.nearEarthObjectFeed;
  if (!raw) return null;

  const objects = Object.values(raw.near_earth_objects ?? {})
    .flat()
    .map((obj: any) => ({
      id: obj.id,
      name: obj.name,
      isPotentiallyHazardousAsteroid: obj.is_potentially_hazardous_asteroid,
      estimatedDiameterMinKm: obj.estimated_diameter?.kilometers?.estimated_diameter_min,
      estimatedDiameterMaxKm: obj.estimated_diameter?.kilometers?.estimated_diameter_max,
      closeApproachDate: obj.close_approach_data?.[0]?.close_approach_date,
      relativeVelocityKph: obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour,
      missDistanceKm: obj.close_approach_data?.[0]?.miss_distance?.kilometers,
    }));

  const response = {
    elementCount: raw.element_count,
    objects,
  };

  setInCache(cacheKey, response);
  return response;
};