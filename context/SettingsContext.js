import { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte
const SettingsContext = createContext();

// Provider component
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    whatsappNumber: ''
  });

  // Charger les paramètres au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNumber = localStorage.getItem('whatsappNumber');
      if (savedNumber) {
        setSettings(prev => ({
          ...prev,
          whatsappNumber: savedNumber
        }));
      }
    }
  }, []);

  // Mettre à jour le numéro WhatsApp
  const updateWhatsAppNumber = (number) => {
    // Formatter le numéro (enlever le 0 et ajouter 33)
    const formattedNumber = number.replace(/^0/, '33').replace(/\D/g, '');
    
    setSettings(prev => ({
      ...prev,
      whatsappNumber: formattedNumber
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsappNumber', formattedNumber);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateWhatsAppNumber }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};