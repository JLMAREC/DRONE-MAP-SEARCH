import { useState } from 'react';

export default function Layout({ children, victimLocation, zones, searchRadius }) {
  const handleShare = async () => {
    const phoneNumber = prompt("Entrez le numéro de téléphone du destinataire (ex: 0612345678):");
    if (!phoneNumber) return;

    const formattedNumber = phoneNumber.replace(/^0/, '33').replace(/\D/g, '');
    
    // Création des URLs avec les paramètres
    const baseUrl = window.location.origin;
    const mapData = encodeURIComponent(JSON.stringify({
      victim: victimLocation,
      searchRadius: searchRadius,
      zones: zones
    }));
    
    const mapUrl = `${baseUrl}/map-view?data=${mapData}`;
    const shareUrl = `${baseUrl}/share/team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Obtenir l'adresse depuis les coordonnées
    const getAddress = async (lat, lon) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        return data.display_name;
      } catch (error) {
        console.error('Erreur de géocodage:', error);
        return `${lat}, ${lon}`;
      }
    };

    const address = victimLocation ? await getAddress(victimLocation[0], victimLocation[1]) : 'Non définie';

    const message = `🚨 *RECHERCHE DE VICTIME - SDIS 56*

📍 *DERNIÈRE POSITION*
${address}
${victimLocation ? `Coordonnées GPS : ${victimLocation[0]}, ${victimLocation[1]}` : ''}

⭕ *ZONES DE RECHERCHE*
 - Zone prioritaire : 500m
 - Zone élargie : ${searchRadius/1000}km

🔗 *LIENS UTILES*

📱 Carte en direct :
${mapUrl}

📍 Partager votre position :
${shareUrl}

_SDIS 56 - Cellule Appui Drone_`;

    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#1a2742] text-white py-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src="/logo_sdis.png" alt="Logo SDIS" className="h-28" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Cellule Appui Drone</h1>
              <p className="text-base opacity-90">Service Départemental d'Incendie et de Secours du Morbihan</p>
            </div>
          </div>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            Partager via WhatsApp
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ShareLocation() {
  const router = useRouter();
  const { teamId } = router.query;
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) return;

    if ("geolocation" in navigator) {
      setIsSharing(true);
      
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Stocker la position dans localStorage pour le développement local
            localStorage.setItem('team_position', JSON.stringify({
              teamId,
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            }));

            // Envoyer la position au PC
            const response = await fetch('/api/update-position', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                teamId,
                latitude,
                longitude,
                timestamp: new Date().toISOString()
              })
            });

            if (!response.ok) {
              throw new Error('Erreur lors de la mise à jour de la position');
            }
          } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de mise à jour de la position');
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsSharing(false);
          setError('Erreur de géolocalisation');
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
      setError('Géolocalisation non supportée');
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
            <div className="flex items-center gap-2 justify-center text-green-700">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Position en cours de partage</span>
            </div>
            <p className="mt-4 text-sm text-green-600 text-center">
              Gardez cette page ouverte pour continuer le partage
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-center">
              {error || "Une erreur est survenue"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}