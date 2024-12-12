import L from 'leaflet';

export const positionIcon = new L.DivIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        class="w-5 h-5 text-white" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      </svg>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export const victimIcon = new L.DivIcon({
  html: `<div class="flex items-center justify-center w-12 h-12">
    <div class="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-60"></div>
    <div class="absolute flex items-center justify-center w-12 h-12 bg-red-600 rounded-full border-2 border-white shadow-lg">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 0v0z" />
      </svg>
    </div>
  </div>`,
  className: 'victim-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48]
});

export const createLabelIcon = (text) => L.divIcon({
  className: 'custom-label',
  html: `
    <div class="bg-white px-4 py-2 rounded-md shadow-lg border-l-4 border-l-red-600">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
        <span class="text-[#1a2742] font-semibold whitespace-nowrap text-sm">
          ${text}
        </span>
      </div>
    </div>
  `,
  iconAnchor: [100, 30]
});