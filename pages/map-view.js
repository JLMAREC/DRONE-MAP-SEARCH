import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('../components/ClientSideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Chargement de la carte...</div>
    </div>
  )
});

export default function MapView() {
  const router = useRouter();
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Récupérer les données depuis l'URL
    const { data } = router.query;
    if (!data) return;

    try {
      // Décodage des données
      const decodedData = JSON.parse(decodeURIComponent(atob(data)));
      setMapData(decodedData);
    } catch (err) {
      console.error('Erreur de décodage:', err);
      setError('Impossible de charger les données de la carte');
    }
  }, [router.query]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
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