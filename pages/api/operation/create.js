// Base de données temporaire (remplacer par une vraie DB en production)
const operations = new Map();

// Configuration
const OPERATION_LIFETIME = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
const TEAM_POSITION_LIFETIME = 5 * 60 * 1000;   // 5 minutes en millisecondes

// Nettoyer les opérations expirées
const cleanExpiredOperations = () => {
  const now = Date.now();
  for (const [id, operation] of operations.entries()) {
    if (now - new Date(operation.createdAt).getTime() > OPERATION_LIFETIME) {
      console.log(`Nettoyage de l'opération expirée: ${id}`);
      operations.delete(id);
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Seules les requêtes POST sont acceptées' 
    });
  }

  try {
    cleanExpiredOperations();

    const operationData = req.body;
    console.log('Données reçues:', operationData);
    
    // Validation des données
    if (!operationData.id || !operationData.victim) {
      return res.status(400).json({
        success: false,
        message: 'Données d\'opération invalides: ID et position victime requis'
      });
    }

    // Formatage des données
    const formattedOperation = {
      id: operationData.id,
      victim: Array.isArray(operationData.victim) 
        ? operationData.victim 
        : [operationData.victim.lat, operationData.victim.lng],
      searchRadius: Number(operationData.searchRadius) || 0,
      zones: (operationData.zones || []).map(zone => ({
        id: zone.id || `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: zone.name || 'Zone sans nom',
        coordinates: Array.isArray(zone.coordinates) ? zone.coordinates : [],
        area: parseFloat(zone.area) || 0,
        color: zone.color || '#1a2742',
        completed: Boolean(zone.completed),
        type: zone.type || 'polygon',
        timestamp: zone.timestamp || new Date().toISOString()
      })).filter(zone => zone.coordinates.length > 0),
      teams: new Map(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Log des données formatées
    console.log('Opération formatée:', {
      id: formattedOperation.id,
      victimPosition: formattedOperation.victim,
      zonesCount: formattedOperation.zones.length,
      searchRadius: formattedOperation.searchRadius
    });

    // Stocker l'opération
    operations.set(formattedOperation.id, formattedOperation);

    // Réponse avec les données minimales
    return res.status(200).json({
      success: true,
      data: {
        id: formattedOperation.id,
        createdAt: formattedOperation.createdAt,
        metadata: {
          zonesCount: formattedOperation.zones.length,
          hasVictimPosition: Boolean(formattedOperation.victim)
        }
      }
    });

  } catch (error) {
    console.error('Erreur création opération:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'opération',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
}

// Export pour utilisation dans d'autres fichiers
export { operations };

// Fonctions utilitaires
export function getOperation(id) {
  return operations.get(id);
}

export function deleteOperation(id) {
  return operations.delete(id);
}

export function updateOperation(id, data) {
  if (!operations.has(id)) return false;
  
  const operation = operations.get(id);
  operations.set(id, {
    ...operation,
    ...data,
    updatedAt: new Date().toISOString()
  });
  
  return true;
}

// Fonction pour nettoyer les positions d'équipe expirées d'une opération
export function cleanExpiredTeamPositions(operationId) {
  const operation = operations.get(operationId);
  if (!operation) return false;

  const now = Date.now();
  const teams = new Map(
    Array.from(operation.teams.entries())
      .filter(([_, team]) => 
        now - new Date(team.timestamp).getTime() < TEAM_POSITION_LIFETIME
      )
  );

  operation.teams = teams;
  operations.set(operationId, {
    ...operation,
    updatedAt: new Date().toISOString()
  });

  return true;
}