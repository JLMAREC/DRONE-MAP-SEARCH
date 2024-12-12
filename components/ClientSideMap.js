import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { positionIcon, victimIcon, createLabelIcon } from './icons';
import { useMap } from 'react-leaflet';
import DrawControl from './DrawControl';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const FeatureGroup = dynamic(() => import('react-leaflet').then((mod) => mod.FeatureGroup), { ssr: false });

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

const Legend = ({ zones }) => {
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
};

const MapControllerWrapper = ({ center, zoom }) => {
  const MapControllerWithNoSSR = dynamic(
    () => Promise.resolve(MapController),
    { ssr: false }
  );
  return <MapControllerWithNoSSR center={center} zoom={zoom} />;
};

export default function ClientSideMap({ 
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
  const [map, setMap] = useState(null);
  const [L, setL] = useState(null);
  const defaultCenter = [47.6578, -2.7604];

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

      setL(L);
    };

    initLeaflet();
  }, []);

  const getZoneStyle = (zone) => ({
    color: zone.color,
    weight: 2,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: zone.color,
    dashArray: zone.completed ? '10, 10' : null
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
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
    }
  }, []);

  if (!L) {
    return <div>Chargement de la carte...</div>;
  }

  const formatDistance = (distance) => {
    if (!distance) return '';
    return `${distance.toFixed(2)} km`;
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom || 11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg h-full"
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <DrawControl onZoneCreated={onZoneCreated} />
        
        {center && (
          <Marker 
            position={center} 
            icon={positionIcon}
          >
            <Tooltip>Ma position</Tooltip>
          </Marker>
        )}

        <MapControllerWrapper center={center} zoom={zoom} />

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
                {center && (
                  <div className="text-sm mt-1">
                    Distance: {formatDistance(L.latLng(center).distanceTo(L.latLng(victimLocation)) / 1000)}
                  </div>
                )}
              </Tooltip>
            </Marker>

            <Circle 
              center={victimLocation} 
              radius={500}
              pathOptions={{
                color: '#dc2626',
                weight: 2,
                fillOpacity: 0.05,
                fillColor: '#dc2626'
              }}
            />
            
            <Marker 
              position={[
                victimLocation[0] + (500/111320),
                victimLocation[1] - (75/111320)
              ]}
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
                    fillOpacity: 0.05,
                    dashArray: '10, 10'
                  }}
                />
                
                <Marker 
                  position={[
                    victimLocation[0] + (searchRadius/111320),
                    victimLocation[1] - (searchRadius/6/111320)
                  ]}
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