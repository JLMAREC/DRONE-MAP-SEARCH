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

export default function OperationView() {
  const router = useRouter();
  const { id } = router.query;
  const [operationData, setOperationData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOperation = async () => {
      try {
        setIsLoading(true);
        console.log("Récupération des données pour opération:", id);

        const response = await fetch(`/api/operation/${id}`);
        const data = await response.json();
        
        console.log("Données reçues de l'API:", data);

        if (!data.success) {
          throw new Error(data.message || 'Erreur lors de la récupération des données');
        }

        // Vérification et formatage des données
        const formattedData = {
          ...data.data,
          victim: Array.isArray(data.data.victim) 
            ? data.data.victim 
            : [data.data.victim.lat, data.data.victim.lng],
          zones: (data.data.zones || []).map(zone => ({
            ...zone,
            coordinates: Array.isArray(zone.coordinates) ? zone.coordinates : [],
            color: zone.color || '#1a2742',
            completed: Boolean(zone.completed)
          })).filter(zone => zone.coordinates.length > 0)
        };

        console.log("Données formatées:", {
          hasVictim: !!formattedData.victim,
          victimPosition: formattedData.victim,
          zonesCount: formattedData.zones.length,
          zonesDetails: formattedData.zones.map(z => ({
            id: z.id,
            pointCount: z.coordinates.length
          }))
        });

        setOperationData(formattedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperation();
    
    // Actualisation toutes les 5 secondes
    const interval = setInterval(fetchOperation, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !operationData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Chargement des données...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <MapWithNoSSR 
        viewOnly={true}
        victimLocation={operationData.victim}
        searchRadius={operationData.searchRadius}
        zones={operationData.zones}
        teams={operationData.teams}
      />
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow-lg">
        <p className="text-sm text-gray-600">
          Opération: <span className="font-bold">{id}</span>
        </p>
        <p className="text-xs text-gray-500">
          Mise à jour: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}