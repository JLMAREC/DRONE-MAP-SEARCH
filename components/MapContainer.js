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
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
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
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
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

// Composant Legend
const Legend = ({ zones, pois = [] }) => {
  const calculateTotalArea = (zones) => {
    if (!zones || zones.length === 0) return "0.00";
    return zones.reduce((total, zone) => total + parseFloat(zone.area), 0).toFixed(2);
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md z-[9999]">
      <h4 className="text-[#1a2742] font-bold mb-3">Types de zones</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded relative">
            <div className="absolute inset-0 bg-[#1a2742] opacity-30"></div>
            <div 
              className="absolute inset-0 rounded" 
              style={{
                border: '2px dashed #1a2742',
                borderSpacing: '5px'
              }}
            ></div>
          </div>
          <span className="text-sm">Zone en cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-[#1a2742]"></div>
          <span className="text-sm">Zone terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="text-sm">Points d'intérêt{pois.length > 0 ? ` (${pois.length})` : ''}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Surface totale : {calculateTotalArea(zones)} ha
        </div>
      </div>
    </div>
  );
};

// Composant pour gérer les événements de la carte
function MapClickHandler({ isAddingPoi, onPoiAdd }) {
  useMapEvents({
    click(e) {
      console.log('Map clicked, isAddingPoi:', isAddingPoi); // Debug
      if (isAddingPoi && onPoiAdd) {
        const { lat, lng } = e.latlng;
        console.log('Adding POI at:', lat, lng); // Debug
        onPoiAdd([lat, lng]);
      }
    },
  });
  return null;
}

// Composant Principal
export default function MapContainerComponent({
  center, 
  zoom,
  zones = [], 
  onZoneCreated,
  searchRadius = 0,
  zoneColor = '#1a2742',
  victimLocation,
  onVictimLocationSet,
  victimTimestamp,
  // Nouvelles props pour les POIs
  pois = [],
  isAddingPoi = false,
  onPoiAdd,
  onPoiDelete,
  onPoiUpdate
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

      const poiIcon = new L.DivIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </div>`,
        className: 'poi-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
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
      setIcons({ personIcon, victimIcon, poiIcon, createLabelIcon });
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
      .poi-marker {
        z-index: 1000 !important;
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
        <MapClickHandler isAddingPoi={isAddingPoi} onPoiAdd={onPoiAdd} />
        
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

        {/* Points d'intérêt */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.position}
            icon={icons.poiIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const newLatLng = e.target.getLatLng();
                onPoiUpdate(poi.id, { position: [newLatLng.lat, newLatLng.lng] });
              }
            }}
          >
            <Popup>
              <div className="flex flex-col gap-2 p-2 min-w-[200px]">
                <textarea
                  value={poi.comment || ''}
                  onChange={(e) => onPoiUpdate(poi.id, { comment: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ajouter un commentaire..."
                  rows="3"
                />
                <button
                  onClick={() => onPoiDelete(poi.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <Legend zones={zones} pois={pois} />
    </div>
  );
}