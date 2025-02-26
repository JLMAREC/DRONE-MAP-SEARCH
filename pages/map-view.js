import dynamic from 'next/dynamic';

const MapViewComponent = dynamic(
  () => import('../components/MapViewComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2742] mx-auto"></div>
          <p className="mt-4 text-[#1a2742]">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);

// Assurez-vous que la page elle-même est aussi en dynamique
export default dynamic(() => Promise.resolve(MapView), {
  ssr: false
});

function MapView() {
  return <MapViewComponent />;
}