import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { positionIcon, victimIcon, createLabelIcon, sharedPositionIcon, poiIcon, cynoIcon } from './icons';
import { useMap } from 'react-leaflet';
import DrawControl from './DrawControl';
import React from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const FeatureGroup = dynamic(() => import('react-leaflet').then((mod) => mod.FeatureGroup), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then((mod) => mod.useMapEvents), { ssr: false });

// Définition de l'icône téléphone
const phoneIcon = {
  html: `<div class="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full border-2 border-white shadow-lg">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  </div>`,
  className: 'phone-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !map.getBounds().contains(center)) {
      map.setView(center, zoom || 16); // Le recentrage ne se fait que si le point n'est pas visible
    }
  }, [center, map, zoom]);
  return null;
}

function MapClickHandler({ isAddingPoi, onPoiAdd, isAddingCyno, onCynoAdd, isAddingPhone, onPhoneAdd }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (isAddingPoi && onPoiAdd) {
        const { lat, lng } = e.latlng;
        onPoiAdd([lat, lng]);
      }
      if (isAddingCyno && onCynoAdd) {
        const { lat, lng } = e.latlng;
        onCynoAdd([lat, lng]);
      }
      if (isAddingPhone && onPhoneAdd) {
        const { lat, lng } = e.latlng;
        onPhoneAdd([lat, lng]);
      }
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, isAddingPoi, onPoiAdd, isAddingCyno, onCynoAdd, isAddingPhone, onPhoneAdd]);

  return null;
}

const Legend = ({ zones, pois = [], cynoMarks = [], phoneLocations = [] }) => {
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
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <span className="text-sm">Marquages Cyno{cynoMarks.length > 0 ? ` (${cynoMarks.length})` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-sm">Géoloc. téléphonique{phoneLocations.length > 0 ? ` (${phoneLocations.length})` : ''}</span>
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
  victimTimestamp,
  // Props pour les POIs
  pois = [],
  isAddingPoi = false,
  onPoiAdd,
  onPoiDelete,
  onPoiUpdate,
  // Props pour les marquages Cyno
  cynoMarks = [],
  isAddingCyno = false,
  onCynoAdd,
  onCynoDelete,
  onCynoUpdate,
  // Props pour la géolocalisation téléphonique
  phoneLocations = [],
  isAddingPhone = false,
  onPhoneAdd,
  onPhoneDelete,
  onPhoneUpdate
}) {
  const [map, setMap] = useState(null);
  const [L, setL] = useState(null);
  const [sharedPositions, setSharedPositions] = useState([]);
  const defaultCenter = [47.6578, -2.7604];

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/shared-positions');
        if (response.ok) {
          const data = await response.json();
          setSharedPositions(data);
        }
      } catch (error) {
        console.error('Erreur fetch positions:', error);
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
        }
        .map-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
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
        .leaflet-control-container {
          position: absolute;
          z-index: 1000;
        }
        .poi-marker, .cyno-marker, .phone-marker {
          z-index: 1000 !important;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  const getZoneStyle = (zone) => ({
    color: zone.color,
    weight: 2,
    opacity: 1,
    fillOpacity: zone.completed ? 0.3 : 0.4,
    fillColor: zone.color,
    dashArray: zone.completed ? null : '10, 10'
  });

  const formatDistance = (distance) => {
    if (!distance) return '';
    return `${(distance / 1000).toFixed(2)} km`;
  };

  if (!L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2742] mx-auto"></div>
          <p className="mt-4 text-[#1a2742]">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom || 11}
        className="rounded-lg shadow-lg"
        whenCreated={setMap}
      >
        <MapClickHandler 
          isAddingPoi={isAddingPoi} 
          onPoiAdd={onPoiAdd}
          isAddingCyno={isAddingCyno}
          onCynoAdd={onCynoAdd}
          isAddingPhone={isAddingPhone}
          onPhoneAdd={onPhoneAdd}
        />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <DrawControl onZoneCreated={onZoneCreated} />
        
        {center && (
          <Marker position={center} icon={positionIcon}>
            <Tooltip>Position du PC</Tooltip>
          </Marker>
        )}

        {sharedPositions.map((pos) => (
          <Marker 
            key={pos.teamId}
            position={[pos.position.lat, pos.position.lng]}
            icon={sharedPositionIcon}
          >
            <Tooltip>
              <div className="font-semibold">Équipe {pos.teamId}</div>
              <div className="text-sm">
                Précision: {pos.position.accuracy?.toFixed(0)}m
                </div>
             <div className="text-xs text-gray-500">
               Mise à jour: {new Date(pos.timestamp).toLocaleTimeString()}
             </div>
           </Tooltip>
         </Marker>
       ))}

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
                   Distance: {formatDistance(L.latLng(center).distanceTo(L.latLng(victimLocation)))}
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
               fillOpacity: 0.1,
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
                   fillOpacity: 0.1,
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

       {/* Points d'intérêt */}
       {pois.map((poi) => (
         <Marker
           key={poi.id}
           position={poi.position}
           icon={poiIcon}
           draggable={true}
           eventHandlers={{
             dragend: (e) => {
               const newLatLng = e.target.getLatLng();
               onPoiUpdate(poi.id, { position: [newLatLng.lat, newLatLng.lng] });
             }
           }}
         >
           <Tooltip>
             <div className="font-medium text-gray-900">
               {poi.comment || 'Point d\'intérêt'}
             </div>
           </Tooltip>
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

       {/* Marquages Cyno */}
       {cynoMarks.map((mark) => (
         <Marker
           key={mark.id}
           position={mark.position}
           icon={cynoIcon}
           draggable={true}
           eventHandlers={{
             dragend: (e) => {
               const newLatLng = e.target.getLatLng();
               onCynoUpdate(mark.id, { position: [newLatLng.lat, newLatLng.lng] });
             }
           }}
         >
           <Tooltip>
             <div className="font-medium text-gray-900">
               {mark.comment || 'Marquage cyno'}
             </div>
           </Tooltip>
           <Popup>
             <div className="flex flex-col gap-2 p-2 min-w-[200px]">
               <textarea
                 value={mark.comment || ''}
                 onChange={(e) => onCynoUpdate(mark.id, { comment: e.target.value })}
                 className="w-full p-2 border rounded"
                 placeholder="Ajouter un commentaire..."
                 rows="3"
               />
               <button
                 onClick={() => onCynoDelete(mark.id)}
                 className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
               >
                 Supprimer
               </button>
             </div>
           </Popup>
         </Marker>
       ))}

       {/* Antennes téléphoniques */}
       {phoneLocations.map((phone) => (
         <React.Fragment key={phone.id}>
           <Marker
             position={phone.position}
             icon={new L.divIcon(phoneIcon)}
             draggable={true}
             eventHandlers={{
               dragend: (e) => {
                 const newLatLng = e.target.getLatLng();
                 onPhoneUpdate(phone.id, { position: [newLatLng.lat, newLatLng.lng] });
               }
             }}
           >
             <Tooltip>
               <div className="font-medium text-gray-900">
                 {phone.comment || 'Antenne téléphonique'}
               </div>
               <div className="text-sm text-gray-600">
                 Rayon : {phone.radius}m
               </div>
             </Tooltip>
             <Popup>
               <div className="flex flex-col gap-2 p-2 min-w-[200px]">
                 <textarea
                   value={phone.comment || ''}
                   onChange={(e) => onPhoneUpdate(phone.id, { comment: e.target.value })}
                   className="w-full p-2 border rounded"
                   placeholder="Ajouter un commentaire..."
                   rows="3"
                 />
                 <div className="flex items-center gap-2">
                   <label className="text-sm text-gray-600">Rayon :</label>
                   <input
                     type="number"
                     min="100"
                     step="100"
                     value={phone.radius}
                     onChange={(e) => onPhoneUpdate(phone.id, { 
                       radius: parseInt(e.target.value, 10) 
                     })}
                     className="flex-1 p-2 border rounded"
                   />
                   <span className="text-sm text-gray-600">m</span>
                 </div>
                 <button
                   onClick={() => onPhoneDelete(phone.id)}
                   className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                 >
                   Supprimer
                 </button>
               </div>
             </Popup>
           </Marker>
           <Circle 
             center={phone.position}
             radius={phone.radius}
             pathOptions={{
               color: '#8B5CF6',
               weight: 2,
               fillOpacity: 0.1,
               fillColor: '#8B5CF6',
               dashArray: '5, 5'
             }}
           />
         </React.Fragment>
       ))}
     </MapContainer>
     
     <Legend 
       zones={zones} 
       pois={pois} 
       cynoMarks={cynoMarks}
       phoneLocations={phoneLocations}
     />
   </div>
 );
}