// pages/api/update-position.js

// Stockage temporaire des positions (dans un vrai déploiement, utilisez une base de données)
let positions = new Map();

export default async function handler(req, res) {
  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Seules les requêtes POST sont acceptées'
    });
  }

  try {
    // Récupérer les données de position
    const { teamId, latitude, longitude, timestamp } = JSON.parse(req.body);

    // Vérifier que toutes les données nécessaires sont présentes
    if (!teamId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes : teamId, latitude et longitude sont requis'
      });
    }

    // Stocker la position
    positions.set(teamId, {
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    });

    // Log pour debug
    console.log(`Position mise à jour pour l'équipe ${teamId}:`, {
      latitude,
      longitude,
      timestamp
    });

    // Renvoyer un succès
    return res.status(200).json({
      success: true,
      message: 'Position mise à jour avec succès',
      data: {
        teamId,
        latitude,
        longitude,
        timestamp
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la position',
      error: error.message
    });
  }
}

// API pour récupérer la position d'une équipe
export async function getTeamPosition(teamId) {
  return positions.get(teamId);
}

// API pour récupérer toutes les positions
export async function getAllPositions() {
  return Array.from(positions.entries()).map(([teamId, data]) => ({
    teamId,
    ...data
  }));
}