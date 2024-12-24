// pages/api/operation/[id].js

import { operations } from './create';

export default async function handler(req, res) {
  const { id } = req.query;
  console.log('Demande d\'opération reçue pour ID:', id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'opération manquant'
    });
  }

  try {
    // Récupérer l'opération
    const operation = operations.get(id);
    
    if (!operation) {
      console.log('Opération non trouvée:', id);
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée'
      });
    }

    // Vérifier et formater les données
    const formattedOperation = {
      id: operation.id,
      createdAt: operation.createdAt,
      updatedAt: new Date().toISOString(),
      
      // Formater la position de la victime
      victim: operation.victim ? (
        Array.isArray(operation.victim) ? operation.victim :
        [operation.victim.lat || operation.victim[0], operation.victim.lng || operation.victim[1]]
      ) : null,
      
      // Formater le rayon de recherche
      searchRadius: Number(operation.searchRadius) || 0,
      
      // Formater les zones
      zones: (operation.zones || []).map(zone => ({
        id: zone.id || `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: zone.name || 'Zone sans nom',
        coordinates: Array.isArray(zone.coordinates) ? zone.coordinates : [],
        area: zone.area || 0,
        color: zone.color || '#1a2742',
        completed: Boolean(zone.completed),
        type: zone.type || 'polygon'
      })).filter(zone => zone.coordinates && zone.coordinates.length > 0),
      
      // Formater les équipes
      teams: Array.from(operation.teams?.values() || []).map(team => ({
        teamId: team.teamId,
        latitude: parseFloat(team.latitude),
        longitude: parseFloat(team.longitude),
        accuracy: team.accuracy ? parseFloat(team.accuracy) : null,
        timestamp: team.timestamp,
        lastUpdate: team.lastUpdate || team.timestamp
      })).filter(team => team.latitude && team.longitude)
    };

    // Log pour debug
    console.log('Données formatées envoyées:', {
      id: formattedOperation.id,
      hasVictim: !!formattedOperation.victim,
      zonesCount: formattedOperation.zones.length,
      teamsCount: formattedOperation.teams.length,
      searchRadius: formattedOperation.searchRadius
    });

    return res.status(200).json({
      success: true,
      data: formattedOperation,
      metadata: {
        timestamp: new Date().toISOString(),
        zonesCount: formattedOperation.zones.length,
        teamsCount: formattedOperation.teams.length
      }
    });

  } catch (error) {
    console.error('Erreur lors du traitement de l\'opération:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du traitement de l\'opération',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
}

// Fonction utilitaire pour nettoyer les positions expirées
function cleanExpiredTeams(teams) {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return new Map(
    Array.from(teams.entries()).filter(([_, team]) => 
      new Date(team.timestamp).getTime() > fiveMinutesAgo
    )
  );
}

// Export pour utilisation dans d'autres fichiers
export { cleanExpiredTeams };