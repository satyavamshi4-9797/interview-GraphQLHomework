import { getBuiltMesh } from '../../../.mesh/index';

export const getNearEarthObjects = async (startDate: string, endDate: string) => {
  const mesh = await getBuiltMesh();
  
  const result = await mesh.execute(`
    query {
      nearEarthObjectFeed(start_date: "${startDate}", end_date: "${endDate}")
    }
  `, {});

  console.log('NASA result:', JSON.stringify(result, null, 2));

  const raw = (result?.data as any)?.nearEarthObjectFeed;
  console.log('raw:', JSON.stringify(raw, null, 2));
  
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

  return {
    elementCount: raw.element_count,
    objects,
  };
};