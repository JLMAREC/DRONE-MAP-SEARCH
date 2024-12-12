import { saveAs } from 'file-saver';
import * as turf from '@turf/turf';

export function exportGPX(zones) {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  ${zones.map(zone => `
    <trk>
      <name>${zone.name}</name>
      <trkseg>
        ${zone.coordinates.map(coord => 
          `<trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`
        ).join('\n')}
      </trkseg>
    </trk>
  `).join('\n')}
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  saveAs(blob, 'zones_drone.gpx');
}

export function exportGeoJSON(zones) {
  const geoJSON = {
    type: 'FeatureCollection',
    features: zones.map(zone => ({
      type: 'Feature',
      properties: {
        name: zone.name,
        area: zone.area,
        color: zone.color
      },
      geometry: {
        type: 'Polygon',
        coordinates: [zone.coordinates.map(coord => [coord[1], coord[0]])]
      }
    }))
  };

  const blob = new Blob([JSON.stringify(geoJSON, null, 2)], 
    { type: 'application/json' });
  saveAs(blob, 'zones_drone.geojson');
}

export function calculatePerimeter(coordinates) {
  if (!coordinates || coordinates.length < 3) return "0.00";
  try {
    const line = turf.lineString(coordinates.map(coord => [coord[1], coord[0]]));
    const perimeter = turf.length(line, { units: 'kilometers' });
    return perimeter.toFixed(2);
  } catch (error) {
    console.error('Error calculating perimeter:', error);
    return "0.00";
  }
}

export function calculateOrientation(coordinates) {
  if (!coordinates || coordinates.length < 2) return "N/A";
  
  try {
    const bounds = coordinates.reduce((acc, coord) => ({
      minLat: Math.min(acc.minLat, coord[0]),
      maxLat: Math.max(acc.maxLat, coord[0]),
      minLng: Math.min(acc.minLng, coord[1]),
      maxLng: Math.max(acc.maxLng, coord[1])
    }), {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity
    });

    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;
    
    return latDiff > lngDiff ? 'Nord-Sud' : 'Est-Ouest';
  } catch (error) {
    console.error('Error calculating orientation:', error);
    return "N/A";
  }
}