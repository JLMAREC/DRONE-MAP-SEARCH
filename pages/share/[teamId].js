import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ShareLocation() {
  const router = useRouter();
  const { teamId } = router.query;
  const [status, setStatus] = useState('waiting'); // waiting, tracking, error
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!teamId) return;

    if ("geolocation" in navigator) {
      setStatus('tracking');
      
      // Suivre la position en continu
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            teamId: teamId
          };
          setPosition(newPosition);
          setStatus('tracking');
          
          // Ici vous pourrez ajouter la logique pour envoyer la position au PC
          console.log("Position mise à jour:", newPosition);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setStatus('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Nettoyer le watch quand le composant est démonté
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setStatus('error');
    }
  }, [teamId]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-xl font-bold text-[#1a2742] mb-4">
              Partage de Position SDIS 56
            </h1>

            {status === 'waiting' && (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2742] mx-auto"></div>
                <p className="mt-2">Initialisation...</p>
              </div>
            )}

            {status === 'tracking' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Position en cours de partage</span>
                  </div>
                </div>

                {position && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Dernière mise à jour : {new Date(position.timestamp).toLocaleTimeString()}</p>
                    <p>Précision : ±{Math.round(position.accuracy)}m</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Gardez cette page ouverte pour continuer le partage de position.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  Impossible d'activer la géolocalisation. Vérifiez que vous avez autorisé l'accès à votre position.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}