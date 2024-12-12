import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique des composants react-leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  { ssr: false }
);
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
);

// Fonctions utilitaires
function calculateArea(coordinates, L) {
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
  const mapRef = useRef(null);
  const [L, setL] = useState(null);
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    const initLeaflet = async () => {
      const L = await import('leaflet');
      require('leaflet/dist/leaflet.css');
      require('leaflet-draw/dist/leaflet.draw.css');

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      });

      const personIcon = new L.DivIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>`,
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

      const createLabelIcon = (text) => L.divIcon({
        className: 'custom-label',
        html: `
          <div class="bg-white px-4 py-2 rounded-md shadow-lg border-l-4 border-l-red-600">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
              <span class="text-[#1a2742] font-semibold whitespace-nowrap text-sm">
                ${text}
              </span>
            </div>
          </div>
        `,
        iconAnchor: [100, 30]
      });

      setL(L);
      setIcons({ personIcon, victimIcon, createLabelIcon });
    };

    initLeaflet();
  }, []);

  const getZoneStyle = (zone) => ({
    color: zone.color,
    weight: 2,
    opacity: 1,
    fillOpacity: zone.completed ? 0.3 : 0.4,
    fillColor: zone.color,
    dashArray: zone.completed ? '10, 10' : null
  });

  const formatCoordinates = (coords) => {
    if (!coords) return '';
    return `${coords[0].toFixed(6)}°N, ${coords[1].toFixed(6)}°E`;
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
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

  if (!L || !icons) {
    return <div>Chargement de la carte...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom || 11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {center && (
          <Marker position={center} icon={icons.personIcon}>
            <Tooltip>Ma position</Tooltip>
          </Marker>
        )}

        {victimLocation && (
          <>
            <Marker 
              position={victimLocation} 
              icon={icons.victimIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => onVictimLocationSet(e.target.getLatLng())
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

            {/* Zone prioritaire avec label */}
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
              icon={icons.createLabelIcon('Zone prioritaire de recherche • 500m')}
              interactive={false}
            />

            {/* Zone secondaire avec label */}
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
                  icon={icons.createLabelIcon(`Zone secondaire de recherche • ${(searchRadius/1000).toFixed(2)}km`)}
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