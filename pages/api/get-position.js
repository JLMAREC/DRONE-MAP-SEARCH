// pages/api/get-positions.js

import { getAllPositions } from './update-position';

export default async function handler(req, res) {
  // Vérification de la méthode HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Seules les requêtes GET sont acceptées'
    });
  }

  try {
    // Récupération de toutes les positions actives
    const positions = await getAllPositions();
    
    // Formatage et filtrage des positions
    const formattedPositions = positions
      .filter(position => {
        const age = Date.now() - new Date(position.timestamp).getTime();
        return age < 5 * 60 * 1000; // Filtrer les positions de plus de 5 minutes
      })
      .map(position => ({
        teamId: position.teamId,
        latitude: parseFloat(position.latitude),
        longitude: parseFloat(position.longitude),
        accuracy: position.accuracy ? parseFloat(position.accuracy) : null,
        timestamp: position.timestamp,
        lastUpdate: position.lastUpdate,
        age: Math.floor((Date.now() - new Date(position.lastUpdate).getTime()) / 1000), // âge en secondes
        status: (Date.now() - new Date(position.timestamp).getTime()) < 30000 ? 'active' : 'inactive'
      }));

    // Logs en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Positions actives récupérées (${formattedPositions.length}):`, 
        formattedPositions.map(p => ({
          teamId: p.teamId,
          status: p.status,
          age: `${Math.floor(p.age / 60)}min ${p.age % 60}s`
        }))
      );
    }

    // Ajout de métadonnées utiles
    const metadata = {
      timestamp: new Date().toISOString(),
      count: formattedPositions.length,
      activeCount: formattedPositions.filter(p => p.status === 'active').length
    };

    return res.status(200).json({
      success: true,
      message: `${formattedPositions.length} position(s) active(s) trouvée(s)`,
      data: formattedPositions,
      metadata
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des positions:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des positions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
}

// Endpoint spécifique pour une équipe
export async function getTeamPositionEndpoint(req, res) {
  const { teamId } = req.query;

  if (!teamId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'équipe requis'
    });
  }

  try {
    const position = await getTeamPosition(teamId);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position non trouvée pour cette équipe'
      });
    }

    // Vérifier si la position n'est pas expirée
    const age = Date.now() - new Date(position.timestamp).getTime();
    if (age > 5 * 60 * 1000) {
      return res.status(404).json({
        success: false,
        message: 'Position expirée pour cette équipe'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...position,
        age: Math.floor(age / 1000),
        status: age < 30000 ? 'active' : 'inactive'
      }
    });

  } catch (error) {
    console.error(`Erreur lors de la récupération de la position pour l'équipe ${teamId}:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la position',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
}