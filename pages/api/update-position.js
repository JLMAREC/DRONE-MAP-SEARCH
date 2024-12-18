// pages/api/update-position.js

// Stockage temporaire des positions avec une durée de vie
const positions = new Map();
const POSITION_LIFETIME = 5 * 60 * 1000; // 5 minutes en millisecondes

// Nettoyer les positions expirées
const cleanExpiredPositions = () => {
  const now = Date.now();
  for (const [teamId, data] of positions.entries()) {
    if (now - new Date(data.lastUpdate).getTime() > POSITION_LIFETIME) {
      positions.delete(teamId);
    }
  }
};

// Validation des coordonnées
const isValidCoordinate = (coord) => {
  return typeof coord === 'number' && !isNaN(coord);
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
    // Nettoyage périodique des positions expirées
    cleanExpiredPositions();

    // Parsing et validation des données
    const { teamId, latitude, longitude, accuracy, timestamp } = JSON.parse(req.body);

    // Validation des données reçues
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'équipe manquant'
      });
    }

    if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Coordonnées invalides'
      });
    }

    // Formatage des données de position
    const positionData = {
      teamId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: timestamp || new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    // Mise à jour de la position
    positions.set(teamId, positionData);

    // Log de debug en développement
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
      data: positionData
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
  const position = positions.get(teamId);
  
  if (!position) return null;
  
  // Vérifier si la position n'est pas expirée
  if (Date.now() - new Date(position.lastUpdate).getTime() > POSITION_LIFETIME) {
    positions.delete(teamId);
    return null;
  }
  
  return position;
}

// Fonction pour récupérer toutes les positions actives
export async function getAllPositions() {
  cleanExpiredPositions();
  return Array.from(positions.entries())
    .map(([teamId, data]) => ({
      teamId,
      ...data,
      age: Date.now() - new Date(data.lastUpdate).getTime()
    }))
    .filter(position => position.age <= POSITION_LIFETIME);
}