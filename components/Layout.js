import { useState } from 'react';

export default function Layout({ children }) {
  const handleShare = async () => {
    const phoneNumber = prompt("Entrez le numéro de téléphone du destinataire (ex: 0612345678):");
    if (!phoneNumber) return;

    const formattedNumber = phoneNumber.replace(/^0/, '33').replace(/\D/g, '');
    
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
    
    const coords = [47.6578, -2.7604]; // Exemple de coordonnées
    const address = await getAddress(coords[0], coords[1]);
    const baseUrl = window.location.origin;
    const mapUrl = `${baseUrl}/map-view`;
    const shareUrl = `${baseUrl}/share/team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const message = `🚨 *RECHERCHE DE VICTIME - SDIS 56*

📍 *DERNIÈRE POSITION*
${address}
Coordonnées GPS : ${coords[0]}, ${coords[1]}

⭕ *ZONES DE RECHERCHE*
 - Zone prioritaire : 500m
 - Zone élargie : 0km

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