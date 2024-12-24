import { operations } from '../operation/create';

export default async function handler(req, res) {
  // Pour récupérer toutes les positions (GET)
  if (req.method === 'GET') {
    const { operationId } = req.query;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'opération requis'
      });
    }

    try {
      const operation = operations.get(operationId);
      if (!operation) {
        return res.status(404).json({
          success: false,
          message: 'Opération non trouvée'
        });
      }

      // Convertir les positions en tableau
      const positions = Array.from(operation.teams.values())
        .map(team => ({
          ...team,
          age: Date.now() - new Date(team.timestamp).getTime()
        }))
        .filter(team => team.age < 5 * 60 * 1000); // Garder uniquement les positions de moins de 5 minutes

      return res.status(200).json({
        success: true,
        data: positions
      });
    } catch (error) {
      console.error('Erreur récupération positions:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Pour mettre à jour une position (POST)
  if (req.method === 'POST') {
    try {
      const { operationId, teamId, latitude, longitude, accuracy, timestamp } = req.body;

      if (!operationId || !teamId || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Données manquantes'
        });
      }

      const operation = operations.get(operationId);
      if (!operation) {
        return res.status(404).json({
          success: false,
          message: 'Opération non trouvée'
        });
      }

      // Mettre à jour la position de l'équipe
      operation.teams.set(teamId, {
        teamId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        timestamp: timestamp || new Date().toISOString()
      });

      console.log(`Position mise à jour pour équipe ${teamId} dans opération ${operationId}`);

      return res.status(200).json({
        success: true,
        message: 'Position mise à jour'
      });

    } catch (error) {
      console.error('Erreur mise à jour position:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  // Pour toute autre méthode HTTP
  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}