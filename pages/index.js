import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu } from '@headlessui/react';
import { getEvents } from '../lib/eventHelpers';

export default function Home() {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
   const loadEvents = async () => {
     try {
       const eventsList = await getEvents();
       setEvents(eventsList);
     } catch (error) {
       console.error('Erreur chargement événements:', error);
     } finally {
       setLoading(false);
     }
   };

   loadEvents();
 }, []);

 const handleDelete = async (eventId) => {
   if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
     try {
       await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
       setEvents(events.filter(e => e.id !== eventId));
     } catch (error) {
       alert('Erreur lors de la suppression');
     }
   }
 };

 const handleToggleStatus = async (eventId, currentStatus) => {
   try {
     await fetch(`/api/events/${eventId}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: currentStatus === 'active' ? 'closed' : 'active' })
     });
     setEvents(events.map(e => e.id === eventId ? {...e, status: currentStatus === 'active' ? 'closed' : 'active'} : e));
   } catch (error) {
     alert('Erreur lors du changement de statut');
   }
 };

 return (
   <div className="min-h-screen bg-gray-50">
     <header className="bg-[#1a2742] text-white py-4 px-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-8">
           <img src="/logo_sdis.png" alt="Logo SDIS" className="h-28" />
           <div className="space-y-1">
             <h1 className="text-3xl font-bold">Cellule Appui Drone</h1>
             <p className="text-base opacity-90">Service Départemental d'Incendie et de Secours du Morbihan</p>
           </div>
         </div>
       </div>
     </header>

     <main className="container mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-8">
         <h2 className="text-2xl font-bold text-gray-800">Interventions</h2>
         <Link 
           href="/event/new"
           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
         >
           Nouvelle intervention
         </Link>
       </div>

       {loading ? (
         <div className="text-center py-12">
           <div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full"></div>
           <p className="mt-4 text-gray-600">Chargement des interventions...</p>
         </div>
       ) : events.length === 0 ? (
         <div className="text-center py-12 bg-white rounded-lg shadow-sm">
           <p className="text-gray-600">Aucune intervention enregistrée</p>
         </div>
       ) : (
         <div className="grid gap-6">
           {events.map((event) => (
             <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="text-lg font-semibold">{event.commune}</h3>
                   <p className="text-gray-500">
                     {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                   </p>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className={`px-3 py-1 rounded-full text-sm ${
                     event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                   }`}>
                     {event.status === 'active' ? 'En cours' : 'Terminé'}
                   </span>
                   <Menu as="div" className="relative">
                     <Menu.Button className="p-1 hover:bg-gray-100 rounded">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                       </svg>
                     </Menu.Button>

                     <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                       <Menu.Item>
                         {({ active }) => (
                           <button
                             onClick={() => handleToggleStatus(event.id, event.status)}
                             className={`${
                               active ? 'bg-gray-100' : ''
                             } w-full text-left px-4 py-2 text-sm text-gray-700`}
                           >
                             {event.status === 'active' ? 'Clôturer' : 'Reprendre'}
                           </button>
                         )}
                       </Menu.Item>
                       <Menu.Item>
                         {({ active }) => (
                           <button
                             onClick={() => handleDelete(event.id)}
                             className={`${
                               active ? 'bg-gray-100' : ''
                             } w-full text-left px-4 py-2 text-sm text-red-600`}
                           >
                             Supprimer
                           </button>
                         )}
                       </Menu.Item>
                     </Menu.Items>
                   </Menu>
                 </div>
               </div>
               
               <div className="mt-4 border-t pt-4">
                 <div className="grid grid-cols-3 gap-4 text-sm">
                   <div>
                     <p className="text-gray-500">Zones couvertes</p>
                     <p className="font-medium">{event.stats?.zones || 0} zones</p>
                   </div>
                   <div>
                     <p className="text-gray-500">Surface totale</p>
                     <p className="font-medium">{event.stats?.surface || 0} ha</p>
                   </div>
                   <div>
                     <p className="text-gray-500">Type</p>
                     <p className="font-medium">{event.type || 'Non spécifié'}</p>
                   </div>
                 </div>
               </div>

               <div className="mt-4 flex gap-2">
                 <button
                   onClick={() => router.push(`/event/${event.id}`)}
                   className="flex-1 bg-[#1a2742] text-white px-4 py-2 rounded hover:bg-[#243150] transition-colors"
                 >
                   Accéder à l'intervention
                 </button>
               </div>
             </div>
           ))}
         </div>
       )}
     </main>
   </div>
 );
}