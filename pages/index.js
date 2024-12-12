import { useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import SearchAddress from '../components/SearchAddress';
import SearchCircleCalculator from '../components/SearchCircleCalculator';

const MapWithNoSSR = dynamic(() => import('../components/ClientSideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Chargement de la carte...</div>
    </div>
  )
});

export default function Home() {
  const [showZoneList, setShowZoneList] = useState(true);
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(11);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isVictimInfoOpen, setIsVictimInfoOpen] = useState(false);
  const [zoneColor, setZoneColor] = useState('#1a2742');
  const [victimLocation, setVictimLocation] = useState(null);
  const [victimTimestamp, setVictimTimestamp] = useState(null);

  const handleLocateMe = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(15);
          setLoading(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible de vous localiser. Vérifiez vos paramètres de géolocalisation.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handleSetVictimLocation = (coordinates) => {
    const [lat, lng] = Array.isArray(coordinates) ? coordinates : [coordinates.lat, coordinates.lng];
    setVictimLocation([lat, lng]);
    setVictimTimestamp(new Date());
    setIsVictimInfoOpen(false);
  };

  const handleAddressSelect = (coordinates) => {
    setCenter(coordinates);
    setZoom(16);
  };

  const handleZoneCreated = (newZone) => {
    setZones(prev => [...prev, {
      ...newZone,
      id: Date.now(),
      name: `Zone ${new Date().toLocaleTimeString()}`,
      color: zoneColor
    }]);
  };

  const handleZoneNameChange = (zoneId, newName) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, name: newName } : zone
    ));
  };

  const handleZoneColorChange = (zoneId, newColor) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, color: newColor } : zone
    ));
  };

  const handleZoneDelete = (zoneId) => {
    setZones(prev => prev.filter(zone => zone.id !== zoneId));
  };

  const handleZoneComplete = (zoneId) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { 
        ...zone, 
        completed: true, 
        completedAt: new Date() 
      } : zone
    ));
  };
  return (
    <Layout>
      <div className="flex w-full h-full overflow-hidden">
        {showZoneList && (
          <div className="w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                <SearchAddress onAddressSelect={handleAddressSelect} />
                
                <button
                  onClick={handleLocateMe}
                  disabled={loading}
                  className="w-full bg-[#1a2742] text-white py-3 px-4 rounded-lg hover:bg-[#243150] disabled:opacity-50 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {loading ? 'Localisation...' : 'Me localiser'}
                </button>

                <button
                  onClick={() => setIsVictimInfoOpen(!isVictimInfoOpen)}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Définir position victime
                  </span>
                  <svg 
                    className={`w-5 h-5 transform transition-transform duration-200 ${isVictimInfoOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`transition-all duration-300 overflow-hidden ${
                  isVictimInfoOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                    <button
                      onClick={() => {
                        if (center) {
                          handleSetVictimLocation(center);
                        } else {
                          alert('Veuillez d\'abord définir une position sur la carte.');
                        }
                      }}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Utiliser la position actuelle
                    </button>

                    {victimLocation && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h3 className="text-red-700 font-semibold mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          Position de la victime
                        </h3>
                        <div className="text-sm space-y-1">
                          {victimTimestamp && (
                            <p>Définie le: {victimTimestamp.toLocaleString('fr-FR')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                  className="w-full bg-[#1a2742] text-white py-3 px-4 rounded-lg hover:bg-[#243150] transition-all duration-200 flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculateur zone recherche
                  </span>
                  <svg 
                    className={`w-5 h-5 transform transition-transform duration-200 ${isCalculatorOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className={`transition-all duration-300 overflow-hidden ${
                isCalculatorOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <SearchCircleCalculator 
                    onRadiusCalculated={setSearchRadius}
                    victimLocation={victimLocation}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="bg-white rounded-lg shadow-lg p-6">
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => handleZoneNameChange(zone.id, e.target.value)}
                      className="w-full p-3 mb-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
                    />
                    
                    <div className="flex items-center p-4 mb-4 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">
                        Surface: {zone.area} hectares
                      </span>
                    </div>

                    <div className="flex items-center mb-4">
                      <label className="text-sm text-gray-600 mr-2">Couleur :</label>
                      <input
                        type="color"
                        value={zone.color}
                        onChange={(e) => handleZoneColorChange(zone.id, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      {!zone.completed ? (
                        <button
                          onClick={() => handleZoneComplete(zone.id)}
                          className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Marquer comme terminée
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">
                            Terminée le {new Date(zone.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleZoneDelete(zone.id)}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative h-full flex flex-col">
          <button 
            onClick={() => setShowZoneList(!showZoneList)}
            className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center w-8 h-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className="flex-1 relative w-full h-full">
            <MapWithNoSSR 
              center={center}
              zoom={zoom}
              zones={zones}
              onZoneCreated={handleZoneCreated}
              searchRadius={searchRadius}
              victimLocation={victimLocation}
              onVictimLocationSet={handleSetVictimLocation}
              victimTimestamp={victimTimestamp}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}