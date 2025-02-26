import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

export default function DrawControl({ onZoneCreated }) {
  const map = useMap();

  const calculateArea = (coords) => {
    const latlngs = coords.map(coord => ({ lat: coord[0], lng: coord[1] }));
    const area = L.GeometryUtil.geodesicArea(latlngs);
    return (area / 10000).toFixed(2);
  };

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e1e4e8',
            message: 'La zone ne peut pas se croiser'
          },
          shapeOptions: {
            color: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2
          }
        }
      },
      edit: false
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.clearLayers();
      const layer = e.layer;
      drawnItems.addLayer(layer);

      if (onZoneCreated) {
        const coordinates = layer.getLatLngs()[0].map(coord => [coord.lat, coord.lng]);
        const area = calculateArea(coordinates);
        
        onZoneCreated({
          id: Date.now(),
          type: 'polygon',
          coordinates,
          area,
          color: '#3B82F6',
          name: `Zone ${new Date().toLocaleTimeString()}`,
          layer: layer
        });
      }
    });

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
      map.removeLayer(drawnItems);
    };
  }, [map, onZoneCreated]);

  return null;
}