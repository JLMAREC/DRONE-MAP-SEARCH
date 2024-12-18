import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ShareLocation() {
  const router = useRouter();
  const { teamId } = router.query;
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);

  useEffect(() => {
    if (!teamId) return;

    if ("geolocation" in navigator) {
      setIsSharing(true);
      setError(null);

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const locationData = {
            teamId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          setLastPosition(locationData);

          try {
            // Stocker en local pour le développement et comme backup
            localStorage.setItem('team_position', JSON.stringify(locationData));

            // Envoyer au serveur
            const response = await fetch('/api/update-position', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(locationData)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Erreur lors de la mise à jour de la position');
            }

          } catch (error) {
            console.error('Erreur de partage de position:', error);
            setError('Erreur de connexion au serveur. Vos positions sont sauvegardées localement.');
          }
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Accès à la localisation refusé. Veuillez l\'autoriser dans vos paramètres.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position indisponible. Vérifiez votre GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
              break;
            default:
              errorMessage = 'Erreur de géolocalisation inconnue.';
          }
          console.error('Erreur de géolocalisation:', error);
          setError(errorMessage);
          setIsSharing(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        setIsSharing(false);
      };
    } else {
      setError('La géolocalisation n\'est pas supportée par votre appareil');
      setIsSharing(false);
    }
  }, [teamId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a2742]">
            SDIS 56 - Cellule Appui Drone
          </h1>
          <p className="text-gray-600 mt-2">Partage de Position</p>
        </div>

        {isSharing ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Position en cours de partage</span>
            </div>
            <div className="mt-4 text-sm text-green-600 text-center">
              {lastPosition && (
                <p className="mb-2">
                  Dernière position : 
                  <br />
                  {lastPosition.latitude.toFixed(6)}°N, {lastPosition.longitude.toFixed(6)}°E
                  <br />
                  Précision : ±{Math.round(lastPosition.accuracy)}m
                </p>
              )}
              <p>Votre position est transmise au PC</p>
              <p className="mt-2 font-medium">
                Gardez cette page ouverte pour continuer le partage
              </p>
            </div>
            {error && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Erreur de partage</span>
            </div>
            <p className="mt-2 text-sm text-red-600 text-center">
              {error || "Une erreur est survenue lors du partage de position"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}