/**
 * Geocoding Service
 * 
 * This service handles address autocomplete and geocoding functionality
 * using OpenStreetMap's Nominatim API through our Next.js API routes to avoid CORS issues.
 */

import axios from 'axios';

/**
 * Interface for geocoding results
 */
export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Interface for Nominatim search results
 */
interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

/**
 * Geocode an address to get coordinates
 * @param address The address to geocode
 * @returns Promise with the geocoding result
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  try {
    // Default coordinates (center of France) for fallback
    const defaultCoordinates = {
      address,
      latitude: 46.603354,
      longitude: 1.888334
    };

    if (!address || address.trim() === '') {
      console.warn('Empty address provided to geocodeAddress, using default coordinates');
      return defaultCoordinates;
    }

    console.log(`Attempting to geocode address: "${address}"`);

    // Make a request to our Next.js API route that proxies to Nominatim
    try {
      const response = await axios.get('/api/geocoding/geocode', {
        params: {
          q: address
        },
        timeout: 5000 // 5 second timeout to prevent long waits
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const result = response.data[0] as NominatimResult;
        
        // Validate the coordinates
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);
        
        if (!isNaN(latitude) && !isNaN(longitude) && 
            latitude >= -90 && latitude <= 90 && 
            longitude >= -180 && longitude <= 180) {
          
          console.log(`Successfully geocoded address: "${address}" to coordinates:`, { latitude, longitude });
          
          return {
            address: result.display_name || address,
            latitude,
            longitude
          };
        } else {
          console.warn('Invalid coordinates received from geocoding API:', { lat: result.lat, lon: result.lon });
          throw new Error('Invalid coordinates received from geocoding API');
        }
      } else {
        console.warn('No results found for address:', address);
        throw new Error('No geocoding results found for address');
      }
    } catch (apiError) {
      console.error('API error during geocoding:', apiError);
      throw apiError; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // Fallback to default coordinates
    return {
      address,
      latitude: 46.603354,
      longitude: 1.888334
    };
  }
};

/**
 * Get address suggestions based on user input
 * @param input The user input to get suggestions for
 * @returns Promise with an array of address suggestions
 */
export const getAddressSuggestions = async (input: string): Promise<string[]> => {
  try {
    if (input.length < 3) {
      return [];
    }

    // Make a request to our Next.js API route that proxies to Nominatim
    const response = await axios.get('/api/geocoding/search', {
      params: {
        q: input,
        limit: 5,
        countrycodes: 'fr' // Limit to France
      }
    });

    if (response.data && response.data.length > 0) {
      // Extract display names from results
      return response.data.map((result: NominatimResult) => result.display_name);
    }

    return [];
  } catch (error) {
    console.error('Error getting address suggestions:', error);
    return [];
  }
};
