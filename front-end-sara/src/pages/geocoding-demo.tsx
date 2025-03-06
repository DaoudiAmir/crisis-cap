import React, { useState } from 'react';
import Head from 'next/head';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import Sidebar from '@/components/Sidebar';
import { FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

/**
 * Geocoding Demo Page
 * 
 * This page demonstrates the address autocomplete and geocoding functionality
 * using OpenStreetMap's Nominatim API through our Next.js API routes.
 */
const GeocodingDemo: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [history, setHistory] = useState<Array<{ address: string; coordinates: { latitude: number; longitude: number } }>>([]);

  // Handle address selection
  const handleAddressSelect = (address: string, coords: { latitude: number; longitude: number }) => {
    setSelectedAddress(address);
    setCoordinates(coords);
    
    // Add to history
    setHistory(prev => [
      { address, coordinates: coords },
      ...prev.slice(0, 4) // Keep only the last 5 items
    ]);
  };

  return (
    <>
      <Head>
        <title>Démonstration de Géocodage | Crisis-Cap</title>
        <meta name="description" content="Démonstration de l'autocomplète d'adresses et du géocodage" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Démonstration de Géocodage</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Recherche d'adresse</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">
                    Entrez une adresse
                  </label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Commencez à taper une adresse..."
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    <FaInfoCircle className="inline mr-1" />
                    Utilisez OpenStreetMap Nominatim pour l'autocomplétion et le géocodage
                  </p>
                </div>
                
                {selectedAddress && coordinates && (
                  <div className="bg-gray-700 p-4 rounded-md">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      Résultat
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm break-words">
                        <span className="text-gray-400">Adresse:</span> {selectedAddress}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Latitude:</span> {coordinates.latitude.toFixed(6)}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Longitude:</span> {coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Historique des recherches</h2>
                
                {history.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    Aucune recherche effectuée
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-md">
                        <p className="text-sm font-medium mb-1 truncate">{item.address}</p>
                        <p className="text-xs text-gray-400">
                          {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">À propos de cette démonstration</h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Cette page démontre l'utilisation d'OpenStreetMap Nominatim comme alternative gratuite à Google Maps
                  pour l'autocomplétion d'adresses et le géocodage dans l'application Crisis-Cap.
                </p>
                
                <h3>Caractéristiques</h3>
                <ul>
                  <li>Autocomplétion d'adresses en temps réel</li>
                  <li>Conversion d'adresses en coordonnées géographiques (géocodage)</li>
                  <li>Gestion des erreurs avec mécanisme de repli</li>
                  <li>Proxy API pour éviter les problèmes CORS</li>
                  <li>Optimisé pour les adresses françaises</li>
                </ul>
                
                <h3>Avantages par rapport à Google Maps</h3>
                <ul>
                  <li>Entièrement gratuit sans limites d'utilisation</li>
                  <li>Données cartographiques open source</li>
                  <li>Pas de clé API requise</li>
                  <li>Contrôle total sur les données</li>
                  <li>Respect de la vie privée des utilisateurs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeocodingDemo;
