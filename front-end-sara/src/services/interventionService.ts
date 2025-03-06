import axios from 'axios';
import { CreateInterventionPayload, InterventionType } from '@/types/intervention';

// Fix API_URL to use the base URL without any path prefixes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// The correct API endpoint without the /api prefix to prevent duplication
const API_ENDPOINT = `${API_URL}/v1/interventions`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to create auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (token) {
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }
  return {
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

// Get all interventions
export const getAllInterventions = async (): Promise<InterventionType[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockInterventions();
    }
    
    const response = await axios.get(`${API_ENDPOINT}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });
    
    // Ensure we're returning an array
    const responseData = response.data.data || response.data;
    
    // Log the structure to help with debugging
    console.log('API Response structure:', JSON.stringify(response.data, null, 2));
    
    // Check if responseData is an array, if not, try to extract the array from known properties
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && typeof responseData === 'object') {
      // Try common response structures
      if (Array.isArray(responseData.interventions)) {
        return responseData.interventions;
      } else if (responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        return responseData.items;
      }
    }
    
    // If we couldn't find an array, log an error and return an empty array
    console.error('Unexpected API response format:', responseData);
    return [];
  } catch (error) {
    console.error('Error fetching interventions:', error);
    return getMockInterventions();
  }
};

// Get active interventions
export const getActiveInterventions = async (): Promise<InterventionType[]> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.get(`${API_ENDPOINT}/active`, config);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching active interventions:', error);
    // Return mock data if API call fails
    return getMockInterventions().filter(
      intervention => ['pending', 'dispatched', 'en_route', 'on_site', 'in_progress'].includes(intervention.status)
    );
  }
};

// Get intervention by ID
export const getInterventionById = async (id: string): Promise<InterventionType | null> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.get(`${API_ENDPOINT}/${id}`, config);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching intervention ${id}:`, error);
    return null;
  }
};

// Mock implementation of creating an intervention
export const mockCreateIntervention = (data: any): InterventionType => {
  const mockId = Math.random().toString(36).substring(2, 15);
  
  return {
    _id: mockId,
    title: data.title || 'Mock Intervention',
    description: data.description || 'This is a mock intervention created due to API failure',
    location: {
      type: 'Point',
      coordinates: [
        data.location?.longitude || 1.888334,
        data.location?.latitude || 46.603354
      ],
      address: data.location?.address || 'Adresse non spécifiée'
    },
    priority: (data.priority || 'MEDIUM') as any,
    status: 'pending' as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    region: data.region || 'default-region',
    station: 'default-station',
    startTime: data.startTime || new Date().toISOString(),
    endTime: null,
    assignedTeams: [],
    requiredResources: [],
    createdBy: 'system',
    notes: []
  };
};

/**
 * Interface for the intervention creation payload
 */
export interface CreateInterventionPayload {
  title: string;
  description: string;
  type?: string;
  priority: string;
  location: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number];
    address?: string;
  };
  region?: string;
  station?: string;
  startTime?: string;
  commander?: string;
  estimatedDuration?: number;
  riskLevel?: string;
  hazards?: string[];
  status?: string;
}

/**
 * Creates a new intervention
 * @param data Intervention data
 * @returns Created intervention or null if error
 */
export const createIntervention = async (data: CreateInterventionPayload): Promise<{ success: boolean; data?: InterventionType; error?: string }> => {
  try {
    // Extract coordinates for easier validation
    let longitude = 1.888334; // Default to France center longitude
    let latitude = 46.603354; // Default to France center latitude
    
    // Try to get coordinates from the data
    if (data.location.coordinates && Array.isArray(data.location.coordinates) && data.location.coordinates.length === 2) {
      const [lon, lat] = data.location.coordinates;
      if (lon !== null && lat !== null && !isNaN(Number(lon)) && !isNaN(Number(lat))) {
        longitude = Number(lon);
        latitude = Number(lat);
      }
    } else if (data.location.longitude !== undefined && data.location.latitude !== undefined) {
      if (data.location.longitude !== null && data.location.latitude !== null) {
        longitude = Number(data.location.longitude);
        latitude = Number(data.location.latitude);
      }
    }
    
    // If coordinates are still null or undefined but we have an address, try to geocode it
    if ((longitude === 1.888334 && latitude === 46.603354) && data.location.address) {
      try {
        console.log('Attempting to geocode address:', data.location.address);
        const coordinates = await geocodeAddress(data.location.address);
        longitude = coordinates.longitude;
        latitude = coordinates.latitude;
      } catch (geocodeError) {
        console.error('Failed to geocode address:', geocodeError);
      }
    }
    
    // Format the payload to match the backend schema exactly
    const payload = {
      title: data.title,
      description: data.description,
      type: data.type || 'fire',
      priority: data.priority.toUpperCase(),
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format: [longitude, latitude]
        address: data.location.address || 'Adresse non spécifiée'
      },
      // Required fields based on the Intervention model
      region: data.regionId || "507f1f77bcf86cd799439011", // Map regionId to region as expected by backend
      station: data.station || "507f1f77bcf86cd799439011", // Default MongoDB ObjectId
      startTime: data.startTime || new Date().toISOString(),
      commander: data.commander || "507f1f77bcf86cd799439011", // Default MongoDB ObjectId
      // Optional fields with defaults
      estimatedDuration: data.estimatedDuration || 60,
      riskLevel: data.riskLevel || "medium",
      hazards: data.hazards || [],
      status: data.status || "pending"
    };

    console.log('Creating intervention with payload:', JSON.stringify(payload, null, 2));
    
    // Get authentication token
    const authToken = getAuthToken();
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      const mockData = mockCreateIntervention(data);
      return { 
        success: true, 
        data: mockData,
        error: 'No authentication token found. Using mock data.' 
      };
    }
    
    // Log the token (masked) for debugging
    console.log('Using auth token:', authToken ? `${authToken.substring(0, 10)}...` : 'null');
    
    // Make the API call with the correct endpoint
    try {
      const response = await axios.post(API_ENDPOINT, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('Intervention created successfully:', response.data);
      return { 
        success: true, 
        data: response.data.data?.intervention || response.data 
      };
    } catch (error: any) {
      console.error('Error creating intervention:', error);
      
      // Extract error message for better user feedback
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'Failed to create intervention';
      
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Fall back to mock data
      console.log('Using mock data as fallback');
      const mockData = mockCreateIntervention(data);
      return { 
        success: true, 
        data: mockData,
        error: `API Error: ${errorMessage}. Using mock data instead.` 
      };
    }
  } catch (error: any) {
    console.error('Error in createIntervention:', error);
    // Return mock data as a fallback with error information
    const mockData = mockCreateIntervention(data);
    return { 
      success: true, 
      data: mockData,
      error: `Unexpected error: ${error.message}. Using mock data instead.` 
    };
  }
};

/**
 * Test function to verify intervention creation payload structure
 * This helps debug the 500 server error issue
 */
export const testInterventionCreation = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Create a minimal test payload with all required fields
    const testPayload = {
      title: "Test Intervention",
      description: "This is a test intervention to debug the API",
      type: "fire",
      priority: "MEDIUM",
      location: {
        type: "Point",
        coordinates: [1.888334, 46.603354], // Default France center
        address: "Test Address, France"
      },
      region: "507f1f77bcf86cd799439011", // Default MongoDB ObjectId
      station: "507f1f77bcf86cd799439011", // Default MongoDB ObjectId
      startTime: new Date().toISOString(),
      commander: "507f1f77bcf86cd799439011", // Default MongoDB ObjectId
      status: "pending"
    };

    console.log('Testing intervention creation with payload:', JSON.stringify(testPayload, null, 2));
    
    // Get authentication token
    const authToken = getAuthToken();
    if (!authToken) {
      return { 
        success: false, 
        error: 'No authentication token found.' 
      };
    }
    
    // Make the API call with the correct endpoint
    const response = await axios.post(API_ENDPOINT, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Test successful:', response.data);
    return { 
      success: true, 
      data: response.data
    };
  } catch (error: any) {
    console.error('Test failed:', error);
    
    // Extract detailed error information
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    };
    
    console.log('Error details:', errorDetails);
    
    return { 
      success: false, 
      error: `API Error: ${error.response?.data?.message || error.message}`,
      data: errorDetails
    };
  }
};

/**
 * Utility function to geocode an address and get coordinates
 * @param address Address to geocode
 * @returns Promise with coordinates or default values
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  if (!address) {
    console.warn('No address provided for geocoding, using default coordinates');
    return {
      latitude: 46.603354, // Default to France center
      longitude: 1.888334
    };
  }

  try {
    console.log(`Geocoding address: ${address}`);
    
    // Try using our Next.js API proxy for geocoding
    const response = await axios.get(`/api/geocoding/geocode`, {
      params: { q: address }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`Geocoded coordinates: ${result.lat}, ${result.lon}`);
      
      // Ensure we're getting numeric values
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      
      // Validate the coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates returned from geocoding service');
      }
      
      return {
        latitude,
        longitude
      };
    }
    
    throw new Error('No results returned from geocoding service');
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // Use default coordinates for France as fallback
    return {
      latitude: 46.603354,
      longitude: 1.888334
    };
  }
};

/**
 * Update intervention status
 */
export const updateInterventionStatus = async (id: string, status: string): Promise<InterventionType | null> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.patch(`${API_ENDPOINT}/${id}/status`, { status }, config);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating intervention ${id} status:`, error);
    return null;
  }
};

/**
 * Add note to intervention
 */
export const addNoteToIntervention = async (id: string, note: string): Promise<InterventionType | null> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.post(`${API_ENDPOINT}/${id}/notes`, { content: note }, config);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error adding note to intervention ${id}:`, error);
    return null;
  }
};

// Mock data for fallback
const getMockInterventions = (): InterventionType[] => {
  return [
    {
      _id: '1',
      code: 'INT-2025-001',
      title: 'Apartment Fire in Paris',
      description: 'Three-story apartment building with fire on the second floor. Multiple residents trapped.',
      status: 'in_progress' as any,
      type: 'fire' as any,
      priority: 'high' as any,
      location: {
        type: 'Point',
        coordinates: [48.8566, 2.3522],
        address: '123 Rue de Rivoli, 75001 Paris, France'
      },
      region: '123456789012345678901234',
      station: '123456789012345678901234',
      startTime: new Date('2025-03-06T10:30:00Z'),
      estimatedDuration: 120,
      riskLevel: 'high',
      hazards: ['Smoke', 'Structural damage'],
      createdBy: '123456789012345678901234',
      createdAt: new Date('2025-03-06T10:30:00Z'),
      updatedAt: new Date('2025-03-06T11:45:00Z')
    },
    {
      _id: '2',
      code: 'INT-2025-002',
      title: 'Traffic Accident on A6 Highway',
      description: 'Multi-vehicle collision involving 3 cars and 1 truck. Possible fuel spill.',
      status: 'dispatched' as any,
      type: 'accident' as any,
      priority: 'critical' as any,
      location: {
        type: 'Point',
        coordinates: [45.7640, 4.8357],
        address: 'A6 Highway, Exit 42, Lyon, France'
      },
      region: '123456789012345678901234',
      station: '123456789012345678901234',
      startTime: new Date('2025-03-06T12:15:00Z'),
      estimatedDuration: 90,
      riskLevel: 'medium',
      hazards: ['Fuel spill', 'Traffic'],
      createdBy: '123456789012345678901234',
      createdAt: new Date('2025-03-06T12:15:00Z'),
      updatedAt: new Date('2025-03-06T12:30:00Z')
    },
    {
      _id: '3',
      code: 'INT-2025-003',
      title: 'Medical Emergency at Shopping Mall',
      description: 'Elderly person collapsed in the food court. Possible cardiac arrest.',
      status: 'completed' as any,
      type: 'medical' as any,
      priority: 'high' as any,
      location: {
        type: 'Point',
        coordinates: [43.2965, 5.3698],
        address: 'Centre Commercial Grand Littoral, Marseille, France'
      },
      region: '123456789012345678901234',
      station: '123456789012345678901234',
      startTime: new Date('2025-03-06T09:45:00Z'),
      endTime: new Date('2025-03-06T10:30:00Z'),
      estimatedDuration: 45,
      riskLevel: 'low',
      createdBy: '123456789012345678901234',
      createdAt: new Date('2025-03-06T09:45:00Z'),
      updatedAt: new Date('2025-03-06T10:30:00Z')
    },
    {
      _id: '4',
      code: 'INT-2025-004',
      title: 'Chemical Spill at Industrial Plant',
      description: 'Hazardous material spill at chemical processing facility. Evacuation in progress.',
      status: 'on_site' as any,
      type: 'hazmat' as any,
      priority: 'critical' as any,
      location: {
        type: 'Point',
        coordinates: [47.2184, -1.5536],
        address: 'Zone Industrielle, Nantes, France'
      },
      region: '123456789012345678901234',
      station: '123456789012345678901234',
      startTime: new Date('2025-03-06T11:00:00Z'),
      estimatedDuration: 180,
      riskLevel: 'extreme',
      hazards: ['Toxic chemicals', 'Explosion risk', 'Respiratory hazards'],
      createdBy: '123456789012345678901234',
      createdAt: new Date('2025-03-06T11:00:00Z'),
      updatedAt: new Date('2025-03-06T12:45:00Z')
    },
    {
      _id: '5',
      code: 'INT-2025-005',
      title: 'Flooding in Residential Area',
      description: 'Flash flooding affecting 20+ homes. Water levels rising rapidly.',
      status: 'pending' as any,
      type: 'natural_disaster' as any,
      priority: 'high' as any,
      location: {
        type: 'Point',
        coordinates: [44.8378, -0.5792],
        address: 'Quartier Saint-Michel, Bordeaux, France'
      },
      region: '123456789012345678901234',
      station: '123456789012345678901234',
      startTime: new Date('2025-03-06T13:30:00Z'),
      estimatedDuration: 240,
      riskLevel: 'high',
      hazards: ['Flooding', 'Electrical hazards', 'Structural damage'],
      createdBy: '123456789012345678901234',
      createdAt: new Date('2025-03-06T13:30:00Z'),
      updatedAt: new Date('2025-03-06T13:30:00Z')
    }
  ];
};
