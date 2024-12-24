import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle } from 'lucide-react';

export default function Layout({ 
  children, 
  victimLocation, 
  zones = [], 
  searchRadius,
  onError,
  minimal = false
}) {
  const [baseUrl, setBaseUrl] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!victimLocation) {
        throw new Error("Veuillez définir une position de victime");
      }

      console.log("Création de l'opération...");
      console.log("Zones reçues:", zones);
      
      // Créer un code d'opération unique
      const operationId = `OP-${new Date().getTime().toString(36).toUpperCase()}`;
      console.log("ID opération créé:", operationId);
      
      // Préparation des données avec validation et transformation des zones
      const operationData = {
        id: operationId,
        victim: {
          lat: victimLocation[0],
          lng: victimLocation[1],
          coordinates: victimLocation // garder aussi le format original
        },
        searchRadius: searchRadius || 0,
        zones: zones.map(zone => ({
          id: zone.id || `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: zone.name || 'Zone sans nom',
          coordinates: Array.isArray(zone.coordinates) ? zone.coordinates : [],
          area: zone.area || 0,
          color: zone.color || '#1a2742',
          completed: Boolean(zone.completed),
          type: zone.type || 'polygon',
          timestamp: zone.timestamp || new Date().toISOString()
        })).filter(zone => zone.coordinates.length > 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Log détaillé pour debug
      console.log("Données complètes de l'opération:", {
        id: operationData.id,
        victimPosition: operationData.victim,
        searchRadius: operationData.searchRadius,
        zonesCount: operationData.zones.length,
        zonesDetails: operationData.zones.map(z => ({
          id: z.id,
          name: z.name,
          pointCount: z.coordinates.length,
          area: z.area
        }))
      });

      // Sauvegarder les données
      const response = await fetch('/api/operation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operationData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erreur API:", errorData);
        throw new Error('Erreur lors de la création de l\'opération');
      }

      const shareUrl = `${baseUrl}/operation/${operationId}`;
      const teamUrl = `${baseUrl}/team/${operationId}`;

      console.log("URLs générées:", { shareUrl, teamUrl });

      setShareData({
        operationId,
        shareUrl,
        teamUrl
      });
      setIsShareModalOpen(true);

    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (minimal) {
    return <main className="flex-1 flex overflow-hidden">{children}</main>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#1a2742] text-white py-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src="/logo_sdis.png" alt="Logo SDIS" className="h-28" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Cellule Appui Drone</h1>
              <p className="text-base opacity-90">
                Service Départemental d'Incendie et de Secours du Morbihan
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleShare}
              disabled={isLoading}
              className={`flex items-center gap-2 ${
                isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
              } text-white px-4 py-2 rounded-lg transition-colors`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Partager l'opération
                </>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>

      {isShareModalOpen && shareData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Partager l'opération</h2>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={shareData.teamUrl} size={200} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Code de l'opération :</p>
                <p className="text-2xl font-bold text-center my-2">{shareData.operationId}</p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Liens de partage :</p>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">Vue carte :</p>
                  <p className="text-xs break-all">{shareData.shareUrl}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">Partage position :</p>
                  <p className="text-xs break-all">{shareData.teamUrl}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}