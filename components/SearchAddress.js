import { useState } from 'react';

export default function SearchAddress({ onAddressSelect }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}, Morbihan, France&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        onAddressSelect([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setSearch('');
      } else {
        alert('Adresse non trouvée');
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      alert('Erreur lors de la recherche');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une adresse..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#1a2742] text-white rounded hover:bg-[#243150] disabled:opacity-50"
        >
          {loading ? '...' : '→'}
        </button>
      </div>
    </form>
  );
}