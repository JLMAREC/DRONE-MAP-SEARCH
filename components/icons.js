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

export const sharedPositionIcon = new L.DivIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        class="w-5 h-5 text-white" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <path d="M20 12a8 8 0 1 0-16 0c0 3.5 2 6.5 4 8l4 4 4-4c2-1.5 4-4.5 4-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
  `,
  className: 'shared-position-icon',
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

export const poiIcon = new L.DivIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-lg">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    </svg>
  </div>`,
  className: 'poi-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export const cynoIcon = new L.DivIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9.5C15 11.433 13.433 13 11.5 13S8 11.433 8 9.5C8 7.567 9.567 6 11.5 6S15 7.567 15 9.5Z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.5 13C9.567 13 8 11.433 8 9.5M15 9.5C15 7.567 13.433 6 11.5 6"/>
    </svg>
  </div>`,
  className: 'cyno-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
export const phoneIcon = new L.DivIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full border-2 border-white shadow-lg">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  </div>`,
  className: 'phone-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
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