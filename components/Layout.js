export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#1a2742] text-white py-4 px-8">
        <div className="flex items-center gap-8">
          <img src="/logo_sdis.png" alt="Logo SDIS" className="h-28" /> {/* Logo encore plus grand (112px) */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Cellule Appui Drone</h1>
            <p className="text-base opacity-90">Service Départemental d'Incendie et de Secours du Morbihan</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}