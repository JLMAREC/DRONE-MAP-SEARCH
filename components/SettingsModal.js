import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { settings, updateWhatsAppNumber } = useSettings();
  const [tempNumber, setTempNumber] = useState(
    settings?.whatsappNumber ? settings.whatsappNumber.replace(/^33/, '0') : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateWhatsAppNumber(tempNumber);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a2742]">Paramètres</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro WhatsApp
            </label>
            <input
              type="tel"
              value={tempNumber}
              onChange={(e) => setTempNumber(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2742] focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce numéro sera utilisé pour le partage WhatsApp
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1a2742] text-white rounded-lg hover:bg-[#243150] transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}