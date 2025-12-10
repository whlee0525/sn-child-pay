import { useState, useEffect, useRef } from 'react';
import Supercluster from 'supercluster';

export interface UseSuperclusterProps {
  points: any[];
  bounds: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  } | null;
  zoom: number;
  options?: Supercluster.Options<any, any>;
}

export function useSupercluster({ points, bounds, zoom, options }: UseSuperclusterProps) {
  const [clusters, setClusters] = useState<any[]>([]);
  const superclusterRef = useRef<Supercluster<any, any> | null>(null);

  // Initialize Supercluster once (or when data changes)
  useEffect(() => {
    if (!superclusterRef.current) {
        superclusterRef.current = new Supercluster({
            radius: 100, // Cluster radius in pixels (increased to strongly group nearby markers)
            maxZoom: 22, // Max zoom to cluster on (very high to keep clusters even at maximum zoom)
            ...options
        });
    }
    
    // Load points into Supercluster
    // Map our data format to GeoJSON Feature format required by Supercluster
    const pointsGeoJSON = points.map(point => ({
        type: 'Feature' as const,
        properties: { cluster: false, ...point },
        geometry: {
            type: 'Point' as const,
            coordinates: [point.l[1], point.l[0]] // [lng, lat]
        }
    }));

    superclusterRef.current.load(pointsGeoJSON);
  }, [points]); // Re-load if points data changes

  // Update clusters when bounds or zoom change
  useEffect(() => {
    if (!superclusterRef.current || !bounds) return;

    // Supercluster expects bounding box: [westLng, southLat, eastLng, northLat]
    const bbox = [
        bounds.sw.lng,
        bounds.sw.lat,
        bounds.ne.lng,
        bounds.ne.lat
    ] as [number, number, number, number];

    const clusters = superclusterRef.current.getClusters(bbox, zoom);
    setClusters(clusters);
    
  }, [points, bounds, zoom]);

  return { clusters, supercluster: superclusterRef.current };
}
