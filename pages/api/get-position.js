// pages/api/get-positions.js

import { getAllPositions, getTeamPosition } from './update-position';

export default async function handler(req, res) {
  // Vérifier que c'est une requête GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Seules les requêtes GET sont acceptées'
    });
  }

  try {
    // Récupérer toutes les positions actives avec délai d'expiration de 5 minutes
    const positions = await getAllPositions();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes en millisecondes

    // Formater et filtrer les positions
    const formattedPositions = positions
      .filter(position => {
        const age = now - new Date(position.lastUpdate || position.timestamp).getTime();
        return age < fiveMinutes;
      })
      .map(position => {
        const age = now - new Date(position.lastUpdate || position.timestamp).getTime();
        return {
          teamId: position.teamId,
          latitude: parseFloat(position.latitude),
          longitude: parseFloat(position.longitude),
          accuracy: position.accuracy ? parseFloat(position.accuracy) : null,
          timestamp: position.timestamp,
          lastUpdate: position.lastUpdate || position.timestamp,
          age: Math.floor(age / 1000), // âge en secondes
          status: age < 30000 ? 'active' : 'inactive' // inactif après 30 secondes sans mise à jour
        };
      });

    // Logs en développement uniquement
    if (process.env.NODE_ENV === 'development') {
      console.log(`Positions actives récupérées (${formattedPositions.length}):`, 
        formattedPositions.map(p => ({
          teamId: p.teamId,
          status: p.status,
          age: `${Math.floor(p.age / 60)}min ${p.age % 60}s`
        }))
      );
    }

    return res.status(200).json({
      success: true,
      message: `${formattedPositions.length} position(s) active(s) trouvée(s)`,
      data: formattedPositions,
      metadata: {
        timestamp: new Date().toISOString(),
        count: formattedPositions.length
      }
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

// Endpoint pour récupérer une position spécifique
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
    const now = Date.now();

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position non trouvée pour cette équipe'
      });
    }

    // Vérifier si la position n'est pas expirée (5 minutes)
    const age = now - new Date(position.lastUpdate || position.timestamp).getTime();
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