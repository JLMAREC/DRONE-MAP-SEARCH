import { useState } from 'react';
import { useReverseGeocoding } from '../hooks/useReverseGeocoding';

export default function Layout({ children, victimLocation, zones = [] }) {
  const { address, loading } = useReverseGeocoding(
    victimLocation ? victimLocation[0] : null,
    victimLocation ? victimLocation[1] : null
  );

  const shortenUrl = async (longUrl) => {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (!response.ok) throw new Error('Erreur lors du raccourcissement de l\'URL');
      return await response.text();
    } catch (error) {
      console.error('Erreur lors du raccourcissement de l\'URL:', error);
      return longUrl;
    }
  };

  const handleShare = async () => {
    const phoneNumber = prompt("Entrez le numéro de téléphone du destinataire (ex: 0612345678):");
    if (!phoneNumber) return;

    let formattedNumber = phoneNumber.replace(/^0/, '33').replace(/\D/g, '');
    
    if (!formattedNumber.match(/^\d{11,12}$/)) {
      alert("Numéro de téléphone invalide");
      return;
    }

    const baseUrl = window.location.origin;
    const mapParams = new URLSearchParams();
    
    if (victimLocation) {
      mapParams.set('lat', victimLocation[0]);
      mapParams.set('lng', victimLocation[1]);
    }
    
    if (zones.length > 0) {
      const simplifiedZones = zones.map(zone => ({
        id: zone.id,
        coordinates: zone.coordinates,
        color: zone.color,
        completed: zone.completed,
        area: zone.area,
        name: zone.name
      }));
      mapParams.set('zones', JSON.stringify(simplifiedZones));
    }

    const mapUrl = `${baseUrl}/share/map?${mapParams.toString()}`;
    const shortUrl = await shortenUrl(mapUrl);
    
    const totalArea = zones.reduce((sum, zone) => sum + Number(zone.area), 0).toFixed(2);
    const completedZones = zones.filter(z => z.completed).length;

    const messageText = `🚨 *SDIS 56 - RECHERCHE VICTIME*

📍 *DERNIÈRE POSITION*
${loading ? '(Chargement de l\'adresse...)' : address || 'Adresse non disponible'}

🔍 *ZONES DE RECHERCHE*
- ${completedZones}/${zones.length} zones terminées
- Surface totale : ${totalArea} ha

🗺️ *VOIR LA CARTE*
👉 ${shortUrl}

💡 _SDIS 56 - Cellule Appui Drone_`;

    const params = new URLSearchParams({
      phone: formattedNumber,
      text: messageText
    });

    const whatsappUrl = `https://api.whatsapp.com/send?${params.toString()}`;

    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
      alert("Impossible d'ouvrir WhatsApp. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen h-screen">
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
            aria-label="Partager via WhatsApp"
            title="Partager via WhatsApp"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            <span>Partager via WhatsApp</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 relative h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}