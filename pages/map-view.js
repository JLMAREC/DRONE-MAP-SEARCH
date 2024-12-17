import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('../components/ClientSideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Chargement de la carte...</div>
    </div>
  )
});

export default function MapView() {
  return (
    <div className="h-screen w-full">
      <MapWithNoSSR />
    </div>
  );
}