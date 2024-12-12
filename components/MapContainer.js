import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Tooltip, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

if (typeof window !== 'undefined') {
  require('leaflet-draw');
  require('leaflet-draw/dist/leaflet.draw.css');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

const positionIcon = new L.DivIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        class="w-5 h-5 text-white" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      </svg>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const victimIcon = new L.DivIcon({
  html: `<div class="flex items-center justify-center w-12 h-12">
    <div class="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-60"></div>
    <div class="absolute flex items-center justify-center w-12 h-12 bg-red-600 rounded-full border-2 border-white shadow-lg">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 0v0z" />
      </svg>
    </div>
  </div>`,
  className: 'victim-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48]
});

function calculateArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return "0.00";
  const latlngs = coordinates.map(coord => ({ lat: coord[0], lng: coord[1] }));
  const areaInSquareMeters = L.GeometryUtil.geodesicArea(latlngs);
  return (areaInSquareMeters / 10000).toFixed(2);
}

function calculateDistance(point1, point2) {
  if (!point1 || !point2) return null;
  const lat1 = point1[0];
  const lon1 = point1[1];
  const lat2 = point2[0];
  const lon2 = point2[1];
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(2);
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

function DrawControl({ onZoneCreated, defaultColor = '#1a2742' }) {
  const map = useMap();
  const drawRef = useRef(null);
  const isCreatingRef = useRef(false);

  useEffect(() => {
    if (!map || !L.Control.Draw) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e4e8',
            message: 'La zone ne peut pas se croiser'
          },
          shapeOptions: {
            color: defaultColor,
            fillOpacity: 0.4,
            weight: 2
          }
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: false
      }
    });

    map.addControl(drawControl);

    const onCreate = (e) => {
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;

      if (e.layerType === 'polygon') {
        const layer = e.layer;
        const coordinates = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
        
        onZoneCreated({
          coordinates,
          color: defaultColor,
          area: calculateArea(coordinates)
        });

        if (drawRef.current) {
          drawRef.current.clearLayers();
        }
      }

      setTimeout(() => {
        isCreatingRef.current = false;
      }, 100);
    };

    map.on(L.Draw.Event.CREATED, onCreate);

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED, onCreate);
    };
  }, [map, onZoneCreated, defaultColor]);

  return null;
}

const Legend = React.memo(({ zones }) => {
  const calculateTotalArea = (zones) => {
    if (!zones || zones.length === 0) return "0.00";
    return zones.reduce((total, zone) => total + parseFloat(zone.area), 0).toFixed(2);
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md z-[1000]">
      <h4 className="text-[#1a2742] font-bold mb-3">Types de zones</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-[#1a2742] bg-[#1a2742] opacity-30"></div>
          <span className="text-sm">Zone en cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-[#1a2742] bg-white border-dashed"></div>
          <span className="text-sm">Zone terminée</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Surface totale : {calculateTotalArea(zones)} ha
        </div>
      </div>
    </div>
  );
});

Legend.displayName = 'Legend';

function formatCoordinates(coords) {
  if (!coords) return '';
  return `${coords[0].toFixed(6)}°N, ${coords[1].toFixed(6)}°E`;
}

function createLabelIcon(text) {
  return L.divIcon({
    className: 'custom-label',
    html: `
      <div class="bg-white px-4 py-2 rounded-md shadow-lg border-l-4 border-l-red-600">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="text-[#1a2742] font-semibold whitespace-nowrap text-sm">
            ${text}
          </span>
        </div>
      </div>
    `,
    iconAnchor: [100, 30]
  });
}

export default function MapContainerComponent({ 
  center, 
  zoom,
  zones = [], 
  onZoneCreated,
  searchRadius = 0,
  zoneColor = '#1a2742',
  victimLocation,
  onVictimLocationSet,
  victimTimestamp
}) {
  const defaultCenter = [47.6578, -2.7604];

  const getZoneStyle = useCallback((zone) => ({
    color: zone.color,
    weight: 2,
    opacity: 1,
    fillOpacity: zone.completed ? 0.3 : 0.4,
    fillColor: zone.color,
    dashArray: zone.completed ? '10, 10' : null
  }), []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ping {
        0% { transform: scale(1); opacity: 1; }
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      .animate-ping {
        animation: ping 8s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      .victim-icon {
        z-index: 1000 !important;
      }
      .custom-label {
        background: none !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom || 11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <MapController center={center} zoom={zoom} />
        <DrawControl onZoneCreated={onZoneCreated} defaultColor={zoneColor} />

        {center && (
          <Marker position={center} icon={positionIcon}>
            <Tooltip>Ma position</Tooltip>
          </Marker>
        )}

        {victimLocation && (
          <>
            <Marker 
              position={victimLocation} 
              icon={victimIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => onVictimLocationSet([e.target.getLatLng().lat, e.target.getLatLng().lng])
              }}
            >
              <Tooltip>
                <div className="font-semibold text-red-600">Dernière position connue</div>
                <div className="text-sm mt-1">
                  <div>Coordonnées: {formatCoordinates(victimLocation)}</div>
                  {center && (
                    <div>Distance: {calculateDistance(center, victimLocation)} km</div>
                  )}
                </div>
              </Tooltip>
            </Marker>

            <Circle 
              center={victimLocation} 
              radius={500}
              pathOptions={{
                color: '#dc2626',
                weight: 2,
                fillOpacity: 0.1,
                fillColor: '#dc2626'
              }}
            />
            <Marker 
              position={[victimLocation[0] + 0.003, victimLocation[1]]}
              icon={createLabelIcon('Zone prioritaire de recherche • 500m')}
              interactive={false}
            />

            {searchRadius > 500 && (
              <>
                <Circle 
                  center={victimLocation} 
                  radius={searchRadius}
                  pathOptions={{
                    color: '#dc2626',
                    fillColor: '#dc2626',
                    fillOpacity: 0.1,
                    dashArray: '10, 10'
                  }}
                />
                <Marker 
                  position={[victimLocation[0] + (searchRadius/111320) - 0.001, victimLocation[1]]}
                  icon={createLabelIcon(`Zone secondaire de recherche • ${(searchRadius/1000).toFixed(2)}km`)}
                  interactive={false}
                />
              </>
            )}
          </>
        )}

        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={getZoneStyle(zone)}
          >
            <Tooltip permanent direction="center">
              <div>
                {zone.name}
                <div className="text-sm text-gray-600">
                  {zone.area} ha
                </div>
              </div>
            </Tooltip>
          </Polygon>
        ))}
      </MapContainer>
      
      <Legend zones={zones} />
    </div>
  );
}