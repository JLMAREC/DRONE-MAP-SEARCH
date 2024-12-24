// pages/api/update-position.js

// Stockage temporaire des positions
const positions = new Map();
const POSITION_LIFETIME = 5 * 60 * 1000; // 5 minutes en millisecondes

// Validation des coordonnées
const isValidCoordinate = (coord) => {
  return typeof coord === 'number' && !isNaN(coord) && isFinite(coord);
};

// Nettoyage des positions expirées
const cleanExpiredPositions = () => {
  const now = Date.now();
  for (const [teamId, data] of positions.entries()) {
    const positionAge = now - new Date(data.timestamp).getTime();
    if (positionAge > POSITION_LIFETIME) {
      console.log(`Position expirée supprimée pour l'équipe ${teamId}`);
      positions.delete(teamId);
    }
  }
};

export default async function handler(req, res) {
  // Vérification de la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Seules les requêtes POST sont acceptées'
    });
  }

  try {
    // Nettoyage périodique
    cleanExpiredPositions();

    // Parsing du body si nécessaire
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { teamId, latitude, longitude, accuracy, timestamp } = body;

    // Validation des données
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant d\'équipe manquant'
      });
    }

    if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Coordonnées invalides',
        details: { latitude, longitude }
      });
    }

    // Création de l'objet position
    const positionData = {
      teamId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: timestamp || new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    // Stockage de la position
    positions.set(teamId, positionData);

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Position mise à jour pour l'équipe ${teamId}:`, {
        latitude: positionData.latitude,
        longitude: positionData.longitude,
        accuracy: positionData.accuracy,
        timestamp: positionData.timestamp
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Position mise à jour avec succès',
      data: {
        ...positionData,
        activeTeams: positions.size
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la position',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
}

// Fonction pour récupérer la position d'une équipe
export async function getTeamPosition(teamId) {
  cleanExpiredPositions();
  return positions.get(teamId);
}

// Fonction pour récupérer toutes les positions actives
export async function getAllPositions() {
  cleanExpiredPositions();
  const now = Date.now();
  return Array.from(positions.values())
    .map(position => ({
      ...position,
      age: now - new Date(position.timestamp).getTime()
    }))
    .sort((a, b) => a.age - b.age);
}