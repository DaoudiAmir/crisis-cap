import React, { useState, useRef, useEffect } from 'react';
import { geocodeAddress, getAddressSuggestions, GeocodingResult } from '@/services/geocodingService';

interface AddressAutocompleteProps {
  onAddressSelect: (
    address: string, 
    latOrCoordinates?: number | { latitude: number; longitude: number; coordinates: [number, number] }, 
    lng?: number
  ) => void;
  initialValue?: string;
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
  initialValue = '',
  initialAddress,
  placeholder = 'Enter an address',
  className = '',
  required = false
}) => {
  // Use initialAddress if provided (for backward compatibility), otherwise use initialValue
  const initialAddressValue = initialAddress !== undefined ? initialAddress : initialValue;
  
  const [address, setAddress] = useState(initialAddressValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update the input field when initialValue or initialAddress changes
  useEffect(() => {
    const newInitialValue = initialAddress !== undefined ? initialAddress : initialValue;
    if (newInitialValue && newInitialValue !== address) {
      setAddress(newInitialValue);
    }
  }, [initialValue, initialAddress, address]);

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
      // Clear any pending timeouts when component unmounts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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
      // First update the input field with the selected address
      setAddress(selectedAddress);
      setLoading(true);
      setError(null);
      
      // Default coordinates (center of France)
      const defaultLongitude = 1.888334;
      const defaultLatitude = 46.603354;
      
      // First check if we have mock coordinates for this address
      const mockCoords = getMockCoordinates(selectedAddress);
      
      // Try to geocode the address
      try {
        console.log('Geocoding address:', selectedAddress);
        const geocodeResponse = await geocodeAddress(selectedAddress);
        
        if (geocodeResponse && 
            typeof geocodeResponse.latitude === 'number' && 
            typeof geocodeResponse.longitude === 'number' && 
            !isNaN(geocodeResponse.latitude) && 
            !isNaN(geocodeResponse.longitude)) {
          
          // Log successful geocoding
          console.log('Successfully geocoded address:', selectedAddress);
          console.log('Coordinates:', geocodeResponse.longitude, geocodeResponse.latitude);
          
          const lat = geocodeResponse.latitude;
          const lng = geocodeResponse.longitude;
          
          // Create coordinates object in the format expected by AllIncidents.tsx
          const coordinatesObject = {
            latitude: lat,
            longitude: lng,
            coordinates: [lng, lat] as [number, number]
          };
          
          // Call the parent component's onAddressSelect with the address and coordinates object
          // This is for AllIncidents.tsx and other newer components
          try {
            onAddressSelect(selectedAddress, coordinatesObject);
          } catch (e) {
            // If that fails, try the older format (intervention-test.tsx)
            console.log('Falling back to older onAddressSelect signature');
            onAddressSelect(selectedAddress, lat, lng);
          }
          
          setLoading(false);
          setShowSuggestions(false);
          return;
        } else {
          console.warn('Invalid coordinates received from geocoding API:', geocodeResponse);
          throw new Error('Invalid coordinates from geocoding API');
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
        setUsingFallback(true);
        // Continue to fallback
      }
      
      // If we reach here, geocoding failed or returned invalid coordinates
      // Use mock coordinates or default as fallback
      console.warn(`Using fallback coordinates for address: ${selectedAddress}`);
      
      let fallbackLatitude = defaultLatitude;
      let fallbackLongitude = defaultLongitude;
      
      // Use mock coordinates if available
      if (mockCoords && typeof mockCoords.latitude === 'number' && typeof mockCoords.longitude === 'number') {
        fallbackLatitude = mockCoords.latitude;
        fallbackLongitude = mockCoords.longitude;
      }
      
      console.log('Using fallback coordinates:', fallbackLongitude, fallbackLatitude);
      
      // Create coordinates object in the format expected by AllIncidents.tsx
      const coordinatesObject = {
        latitude: fallbackLatitude,
        longitude: fallbackLongitude,
        coordinates: [fallbackLongitude, fallbackLatitude] as [number, number]
      };
      
      // Try the newer format first, fall back to older format if needed
      try {
        onAddressSelect(selectedAddress, coordinatesObject);
      } catch (e) {
        console.log('Falling back to older onAddressSelect signature');
        onAddressSelect(selectedAddress, fallbackLatitude, fallbackLongitude);
      }
    } catch (error) {
      console.error('Error in handleAddressSelect:', error);
      setError('Failed to get coordinates for this address');
      
      // Even in case of error, still update with default coordinates for France
      const fallbackLongitude = 1.888334;
      const fallbackLatitude = 46.603354;
      
      // Create coordinates object in the format expected by AllIncidents.tsx
      const coordinatesObject = {
        latitude: fallbackLatitude,
        longitude: fallbackLongitude,
        coordinates: [fallbackLongitude, fallbackLatitude] as [number, number]
      };
      
      // Try the newer format first, fall back to older format if needed
      try {
        onAddressSelect(selectedAddress, coordinatesObject);
      } catch (e) {
        console.log('Falling back to older onAddressSelect signature');
        onAddressSelect(selectedAddress, fallbackLatitude, fallbackLongitude);
      }
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  // Function to fetch address suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Don't search again if the query is the same
    if (query === lastSearchTerm) {
      return;
    }

    setLastSearchTerm(query);
    setLoading(true);
    setError(null);

    try {
      // Try to get suggestions from the API
      const response = await getAddressSuggestions(query);
      
      if (response && Array.isArray(response) && response.length > 0) {
        setSuggestions(response);
        setUsingFallback(false);
        setShowSuggestions(true);
      } else {
        // If API returns empty or invalid response, use mock data
        console.warn('No suggestions from API, using mock data');
        setSuggestions(getMockSuggestions(query));
        setUsingFallback(true);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions(getMockSuggestions(query));
      setUsingFallback(true);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      // Check if a word has been completed (space added)
      const hasCompletedWord = value.endsWith(' ') || 
                              (lastSearchTerm && value.split(' ').length > lastSearchTerm.split(' ').length);
      
      if (hasCompletedWord || value.length > lastSearchTerm.length + 3) {
        // Set a timeout to avoid too many API calls
        searchTimeoutRef.current = setTimeout(() => {
          fetchSuggestions(value);
        }, 500); // 500ms delay
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed and there are suggestions, select the first one
    if (e.key === 'Enter' && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      handleAddressSelect(suggestions[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => address.length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      
      {usingFallback && (
        <div className="text-xs text-amber-500 mt-1">
          Using offline data (limited accuracy)
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-500 mt-1">
          {error}
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
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
