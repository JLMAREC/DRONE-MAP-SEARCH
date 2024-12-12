import ZoneCard from './ZoneCard';

export default function ZoneList({ 
  zones, 
  onZoneNameChange,
  onZoneColorChange,
  onZoneDelete,
  onZoneComplete,
  onZoneStartPointSet 
}) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Zones de recherche</h2>
      {zones.map(zone => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          onNameChange={onZoneNameChange}
          onColorChange={onZoneColorChange}
          onDelete={onZoneDelete}
          onComplete={onZoneComplete}
          onStartPointSet={onZoneStartPointSet}
        />
      ))}
    </div>
  );
}