// pages/map-view/[data].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('../../components/ClientSideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Chargement de la carte...</div>
    </div>
  )
});

export default function MapView() {
  const router = useRouter();
  const { data } = router.query;
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) return;

    try {
      console.log('Données encodées reçues:', data);
      
      // Décodage en plusieurs étapes
      const decodedFromBase64 = atob(data);
      console.log('Après décodage base64:', decodedFromBase64);
      
      const decodedFromURI = decodeURIComponent(decodedFromBase64);
      console.log('Après décodage URI:', decodedFromURI);
      
      const parsedData = JSON.parse(decodedFromURI);
      console.log('Données finales parsées:', parsedData);

      // Validation des données nécessaires
      if (!parsedData.victim) {
        throw new Error('Position de la victime manquante');
      }

      setMapData(parsedData);
    } catch (err) {
      console.error('Erreur lors du décodage des données:', err);
      setError(`Impossible de charger les données de la carte: ${err.message}`);
    }
  }, [data]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <div className="mt-4 text-sm text-gray-500">
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({ query: router.query }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <MapWithNoSSR 
        viewOnly={true}
        victimLocation={mapData.victim}
        searchRadius={mapData.searchRadius}
        zones={mapData.zones}
      />
    </div>
  );
}