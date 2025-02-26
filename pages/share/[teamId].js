import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ShareLocation() {
  const [status, setStatus] = useState('Initialisation...');
  const router = useRouter();
  const { teamId } = router.query;

  useEffect(() => {
    if (!teamId) return;

    async function sendPosition(position) {
      try {
        console.log('Position à envoyer:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        const response = await fetch('/api/shared-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId,
            position: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Réponse API:', data);
          setStatus('Position partagée ✅');
        } else {
          console.error('Erreur API:', await response.text());
          setStatus('Erreur lors du partage ❌');
        }
      } catch (error) {
        console.error('Erreur envoi:', error);
        setStatus('Erreur de communication ❌');
      }
    }

    function startSharing() {
      if (!navigator.geolocation) {
        setStatus('Géolocalisation non supportée ❌');
        return;
      }

      setStatus('Vérification des permissions...');
      console.log('Démarrage partage position');

      navigator.permissions.query({ name: 'geolocation' }).then(function(permissionStatus) {
        console.log('État permission:', permissionStatus.state);
        
        if (permissionStatus.state === "denied") {
          setStatus('Accès position refusé ❌');
          return;
        }

        let watchId = null;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('==== POSITION OBTENUE ====');
            console.log('Position complète:', position);
            console.log('Latitude:', position.coords.latitude);
            console.log('Longitude:', position.coords.longitude);
            console.log('Précision:', position.coords.accuracy);
            console.log('Timestamp:', new Date(position.timestamp).toLocaleString());
            console.log('========================');

            setStatus('Position obtenue, envoi...');
            sendPosition(position);

            // Démarrer le suivi continu
            watchId = navigator.geolocation.watchPosition(
              (newPosition) => {
                console.log('Nouvelle position');
                sendPosition(newPosition);
              },
              (error) => {
                console.error('Erreur suivi:', error);
                setStatus('Erreur de suivi ❌');
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          },
          (error) => {
            console.error('Erreur position:', error);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setStatus('Autorisation refusée ❌');
                break;
              case error.POSITION_UNAVAILABLE:
                setStatus('Position non disponible ❌');
                break;
              case error.TIMEOUT:
                setStatus('Délai expiré ❌');
                break;
              default:
                setStatus('Erreur inconnue ❌');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );

        // Cleanup function
        return () => {
          if (watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
        };
      });
    }

    startSharing();
  }, [teamId]);

  return (
    <>
      <Head>
        <title>SDIS 56 - Position</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          <h1 className="text-xl font-bold mb-4 text-[#1a2742]">
            SDIS 56 - Position en direct
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              status.includes('✅') ? 'bg-green-500' : 
              status.includes('❌') ? 'bg-red-500' : 
              'bg-blue-500'
            }`}></div>
            <span>{status}</span>
          </div>

          <p className="text-sm text-gray-600">
            {status.includes('✅') 
              ? 'Position partagée en temps réel' 
              : 'Autorisation en cours...'}
          </p>
        </div>
      </div>
    </>
  );
}