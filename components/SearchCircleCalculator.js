import { useState } from 'react';

export default function SearchCircleCalculator({ onRadiusCalculated, victimLocation }) {
  const [baseSpeed, setBaseSpeed] = useState('4');
  const [disappearanceTime, setDisappearanceTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [terrain, setTerrain] = useState('normal');
  const [visibility, setVisibility] = useState('good');
  const [victimState, setVictimState] = useState('normal');

  const calculateAdjustedSpeed = () => {
    let speed = parseFloat(baseSpeed);
    
    const terrainFactors = {
      normal: 1,      
      denivele: 0.75, 
      foret: 0.65     
    };

    const visibilityFactors = {
      good: 1,
      night_lamp: 0.65,
      night_dark: 0.3,
      fog: 0.55,
      rain: 0.75
    };

    const victimFactors = {
      normal: 1,     
      blesse: 0.7,   
      panique: 0.85  
    };

    speed *= terrainFactors[terrain];
    speed *= visibilityFactors[visibility];
    speed *= victimFactors[victimState];

    if (!disappearanceTime || !currentTime) {
      return { speed: 0, radius: 0 };
    }

    const disappearance = new Date(`2024-01-01T${disappearanceTime}`);
    const current = new Date(`2024-01-01T${currentTime}`);
    const hoursElapsed = (current - disappearance) / (1000 * 60 * 60);

    if (hoursElapsed <= 0) {
      alert('L\'heure actuelle doit être après l\'heure de disparition');
      return { speed: 0, radius: 0 };
    }

    if (hoursElapsed > 24) {
      speed *= 0.3;
    } else if (hoursElapsed > 6) {
      speed *= 0.6;
    } else if (hoursElapsed > 3) {
      speed *= 0.8;
    }

    const radius = speed * hoursElapsed * 1000;
    return { speed, radius };
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!victimLocation) {
      alert('Veuillez d\'abord définir la position de la victime');
      return;
    }
    const result = calculateAdjustedSpeed();
    onRadiusCalculated(result.radius);
  };

  return (
    <div className="space-y-4">
      {!victimLocation && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg">
          ⚠️ Définissez d'abord la position de la victime pour activer le calculateur
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vitesse de base</label>
          <select 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
            value={baseSpeed}
            onChange={(e) => setBaseSpeed(e.target.value)}
            disabled={!victimLocation}
          >
            <option value="2">Lente (2 km/h)</option>
            <option value="4">Moyenne (4 km/h)</option>
            <option value="6">Rapide (6 km/h)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure disparition</label>
            <input
              type="time"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
              value={disappearanceTime}
              onChange={(e) => setDisappearanceTime(e.target.value)}
              required
              disabled={!victimLocation}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure actuelle</label>
            <input
              type="time"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
              required
              disabled={!victimLocation}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terrain</label>
          <select 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
            value={terrain}
            onChange={(e) => setTerrain(e.target.value)}
            disabled={!victimLocation}
          >
            <option value="normal">Normal</option>
            <option value="denivele">Dénivelé</option>
            <option value="foret">Forêt</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibilité</label>
          <select 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={!victimLocation}
          >
            <option value="good">Bonne</option>
            <option value="night_lamp">Nuit avec lampe</option>
            <option value="night_dark">Nuit sans lampe</option>
            <option value="fog">Brouillard</option>
            <option value="rain">Pluie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">État victime</label>
          <select 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
            value={victimState}
            onChange={(e) => setVictimState(e.target.value)}
            disabled={!victimLocation}
          >
            <option value="normal">Normal</option>
            <option value="blesse">Blessé</option>
            <option value="panique">Panique</option>
          </select>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4">
        <button
          onClick={handleCalculate}
          className={`w-full py-2 px-4 rounded-md transition-colors ${
            victimLocation 
              ? 'bg-[#1a2742] text-white hover:bg-[#243150]'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
          disabled={!victimLocation}
        >
          Calculer le rayon de recherche
        </button>
      </div>
    </div>
  );
}