import React, { useState, useRef, useEffect } from 'react';
import { geocodeAddress, getAddressSuggestions, GeocodingResult } from '@/services/geocodingService';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, coordinates: { latitude: number; longitude: number; coordinates: [number, number] }) => void;
  initialAddress?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

// Mock data for fallback when API is unavailable
const MOCK_SUGGESTIONS = {
  'par': [
    'Paris, France',
    'Paris 1er Arrondissement, Paris, France',
    'Paris 2e Arrondissement, Paris, France'
  ],
  'lyo': [
    'Lyon, France',
    'Lyon 1er Arrondissement, Lyon, France',
    'Lyon 2e Arrondissement, Lyon, France'
  ],
  'mar': [
    'Marseille, France',
    'Marseille 1er Arrondissement, Marseille, France',
    'Marseille 2e Arrondissement, Marseille, France'
  ],
  'bor': [
    'Bordeaux, France',
    'Bordeaux Centre, Bordeaux, France',
    'Bordeaux Lac, Bordeaux, France'
  ]
};

// Mock coordinates for fallback
const MOCK_COORDINATES = {
  'Paris, France': { latitude: 48.8566, longitude: 2.3522 },
  'Lyon, France': { latitude: 45.7578, longitude: 4.8320 },
  'Marseille, France': { latitude: 43.2965, longitude: 5.3698 },
  'Bordeaux, France': { latitude: 44.8378, longitude: -0.5792 }
};

/**
 * Address Autocomplete Component
 * 
 * A reusable component that provides address autocomplete functionality
 * using OpenStreetMap's Nominatim API with fallback to mock data.
 */
const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  initialAddress = '',
  placeholder = 'Entrez une adresse',
  className = '',
  required = false
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get mock suggestions based on input
  const getMockSuggestions = (input: string): string[] => {
    const lowercaseInput = input.toLowerCase();
    
    // Check if input matches any of our mock prefixes
    for (const [prefix, mockSuggestions] of Object.entries(MOCK_SUGGESTIONS)) {
      if (lowercaseInput.includes(prefix)) {
        return mockSuggestions;
      }
    }
    
    // Default suggestions if no match
    return [
      `${input}, Paris, France`,
      `${input}, Lyon, France`,
      `${input}, Marseille, France`
    ];
  };

  // Get mock coordinates for an address
  const getMockCoordinates = (address: string): { latitude: number; longitude: number } => {
    // Check if we have exact mock coordinates for this address
    for (const [mockAddress, coordinates] of Object.entries(MOCK_COORDINATES)) {
      if (address.includes(mockAddress)) {
        return coordinates;
      }
    }
    
    // Default to center of France if no match
    return { latitude: 46.603354, longitude: 1.888334 };
  };

  // Function to handle address selection
  const handleAddressSelect = async (selectedAddress: string) => {
    try {
      setAddress(selectedAddress);
      setLoading(true);
      setError(null);
      
      // Default coordinates (center of France)
      let defaultCoordinates: [number, number] = [1.888334, 46.603354];
      
      // First check if we have mock coordinates for this address
      const mockCoords = getMockCoordinates(selectedAddress);
      if (mockCoords && mockCoords.latitude && mockCoords.longitude) {
        defaultCoordinates = [mockCoords.longitude, mockCoords.latitude];
      }
      
      try {
        // Try to geocode the address
        const geocodeResponse = await geocodeAddress(selectedAddress);
        
        if (geocodeResponse && 
            geocodeResponse.latitude && 
            geocodeResponse.longitude && 
            !isNaN(Number(geocodeResponse.latitude)) && 
            !isNaN(Number(geocodeResponse.longitude))) {
          
          // Format coordinates as [longitude, latitude] for GeoJSON
          const coordinates: [number, number] = [
            Number(geocodeResponse.longitude), 
            Number(geocodeResponse.latitude)
          ];
          
          // Log successful geocoding
          console.log('Geocoded address:', selectedAddress);
          console.log('Coordinates:', coordinates);
          
          // Update the location with coordinates
          const updatedLocation = {
            latitude: Number(geocodeResponse.latitude),
            longitude: Number(geocodeResponse.longitude),
            address: selectedAddress,
            coordinates: coordinates // Format as [longitude, latitude] for GeoJSON
          };
          
          onAddressSelect(selectedAddress, updatedLocation);
          setLoading(false);
          setShowSuggestions(false);
          return;
        } else {
          console.warn('Invalid coordinates received from geocoding API:', geocodeResponse);
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
      
      // If we reach here, geocoding failed or returned invalid coordinates
      // Use default coordinates as fallback
      console.warn(`Using fallback coordinates for address: ${selectedAddress}`);
      
      const fallbackLocation = {
        latitude: defaultCoordinates[1],
        longitude: defaultCoordinates[0],
        address: selectedAddress,
        coordinates: defaultCoordinates // Format as [longitude, latitude] for GeoJSON
      };
      
      onAddressSelect(selectedAddress, fallbackLocation);
    } catch (error) {
      console.error('Error in handleAddressSelect:', error);
      setError('Failed to get coordinates for this address');
      
      // Even in case of error, still update with default coordinates for France
      const fallbackCoordinates: [number, number] = [1.888334, 46.603354];
      
      const fallbackLocation = {
        latitude: fallbackCoordinates[1],
        longitude: fallbackCoordinates[0],
        address: selectedAddress,
        coordinates: fallbackCoordinates
      };
      
      onAddressSelect(selectedAddress, fallbackLocation);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  // Handle address input change
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setError(null);

    if (value.length >= 3) {
      setLoading(true);
      try {
        // Try to get suggestions from the API
        const addressSuggestions = await getAddressSuggestions(value);
        
        if (addressSuggestions.length > 0) {
          setSuggestions(addressSuggestions);
          setShowSuggestions(true);
          setUsingFallback(false);
        } else {
          // Fallback to mock suggestions if API returns empty results
          const mockSuggestions = getMockSuggestions(value);
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
        
        // Fallback to mock suggestions on error
        const mockSuggestions = getMockSuggestions(value);
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          className={`input input-bordered w-full bg-gray-800 text-white ${className}`}
          required={required}
          aria-label="Adresse"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="loading loading-spinner loading-xs"></div>
          </div>
        )}
      </div>
      
      {error && <p className="text-error text-sm mt-1">{error}</p>}
      {usingFallback && !error && (
        <p className="text-warning text-xs mt-1">Mode hors-ligne: suggestions approximatives</p>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
              onClick={() => handleAddressSelect(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
