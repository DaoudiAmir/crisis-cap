import axios from 'axios';
import { Intervention, InterventionType } from '@/types/intervention';
import { getAuthToken } from '@/utils/auth';

// Base API URL configuration
// NOTE: The backend API is accessible at http://localhost:3000/api/v1
// So we ensure API_URL is just the base without the /api part
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Different parts of the app define API_URL either as 'http://localhost:3000/api' 
// or just 'http://localhost:3000', so we need to check and build accordingly
const API_BASE = API_URL.endsWith('/api') 
  ? `${API_URL}/v1` 
  : `${API_URL}/api/v1`;

// The correct API endpoint
const API_ENDPOINT = `${API_BASE}/interventions`;

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
const mockCreateIntervention = (data: any): InterventionType => {
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
 * @returns Created intervention
 */
export const createIntervention = async (data: Partial<Intervention>): Promise<{ intervention: Intervention; warnings?: string[] }> => {
  try {
    // Ensure coordinates are valid numbers
    let coordinates: [number, number] = [1.888334, 46.603354]; // Default to center of France
    
    // Try to extract coordinates from the location object
    if (data.location?.coordinates && 
        Array.isArray(data.location.coordinates) && 
        data.location.coordinates.length === 2 &&
        typeof data.location.coordinates[0] === 'number' && 
        typeof data.location.coordinates[1] === 'number' &&
        !isNaN(data.location.coordinates[0]) && 
        !isNaN(data.location.coordinates[1])) {
      coordinates = data.location.coordinates as [number, number];
    } 
    // Try to extract from latitude/longitude properties
    else if (data.location?.latitude !== undefined && 
             data.location?.longitude !== undefined &&
             !isNaN(Number(data.location.latitude)) && 
             !isNaN(Number(data.location.longitude))) {
      coordinates = [Number(data.location.longitude), Number(data.location.latitude)];
    }
    
    // Prepare the payload with validated data
    const payload = {
      ...data,
      location: {
        type: 'Point',
        coordinates,
        address: data.location?.address || 'Address not provided'
      },
      // Ensure required fields have default values
      title: data.title || 'Untitled Intervention',
      description: data.description || 'No description provided',
      type: data.type || 'fire',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'pending',
      region: data.region || 'default-region',
      station: data.station || 'default-station',
      commander: data.commander || 'default-commander',
      startTime: data.startTime || new Date().toISOString(),
      createdBy: data.createdBy || 'system'
    };
    
    // Log the payload for debugging
    console.log('Creating intervention with payload:', JSON.stringify(payload, null, 2));
    
    // Get authentication token
    const authToken = getAuthToken();
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      // Return mock data with warnings
      return { 
        intervention: mockCreateIntervention(data),
        warnings: ['Using mock data due to missing authentication token']
      };
    }
    
    // Make the API call with the correct endpoint
    const response = await axios.post(`${API_ENDPOINT}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Check for warnings in the response
    if (response.data.warnings && response.data.warnings.length > 0) {
      console.warn('Intervention created with warnings:', response.data.warnings);
      // Return both the intervention and warnings
      return {
        intervention: response.data.data.intervention,
        warnings: response.data.warnings
      };
    }
    
    return { intervention: response.data.data.intervention };
  } catch (error) {
    console.error('Error creating intervention:', error);
    
    // Extract detailed validation errors if available
    if (axios.isAxiosError(error) && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const errorMessage = validationErrors.map((err: any) => 
        `${err.field}: ${err.message}`
      ).join(', ');
      
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    
    // Handle other types of errors
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to create intervention: ${errorMessage}`);
    }
    
    throw new Error('Failed to create intervention: Unknown error');
  }
};

/**
 * Test function to debug intervention creation API
 * Call this from the browser console to test API directly
 */
export const testInterventionCreation = async () => {
  console.log('Testing intervention creation...');
  
  // Create a test payload that matches exactly what the backend expects
  const testPayload = {
    title: "Test Intervention",
    description: "This is a test intervention created to debug the API",
    type: "fire",
    priority: "HIGH", // Using uppercase as per the schema
    location: {
      type: "Point",
      coordinates: [2.3522, 48.8566], // Paris coordinates in GeoJSON format [longitude, latitude]
      address: "Paris, France"
    },
    region: "507f1f77bcf86cd799439011", // Sample MongoDB ObjectId
    station: "507f1f77bcf86cd799439011", // Station ID
    commander: "507f1f77bcf86cd799439011", // Commander ID
    startTime: new Date().toISOString(),
    estimatedDuration: 60,
    riskLevel: "medium",
    hazards: [],
    status: "pending",
    createdBy: "507f1f77bcf86cd799439011" // Creator ID
  };
  
  console.log('Test payload:', JSON.stringify(testPayload, null, 2));
  
  try {
    // Get authentication token
    const authToken = getAuthToken();
    if (!authToken) {
      console.error('No auth token found, cannot proceed with API test');
      return { success: false, error: 'No authentication token found' };
    }
    
    console.log('Making direct API call to debug the issue...');
    
    const response = await axios.post(`${API_ENDPOINT}`, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Test succeeded with response:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Test failed with error:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received for request:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

/**
 * Test function to verify intervention creation payload structure
 * This helps debug the 500 server error issue
 */
export const testInterventionCreation2 = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
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
    const response = await axios.post(`${API_ENDPOINT}`, testPayload, {
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

/**
 * Make the test function available in the global scope for browser console testing
 */
if (typeof window !== 'undefined') {
  (window as any).testInterventionCreation = testInterventionCreation;
  
  // Add a direct API test function that bypasses our service
  (window as any).testDirectApiCall = async (customPayload?: any) => {
    const authToken = getAuthToken();
    if (!authToken) {
      console.error('No auth token found!');
      return { success: false, error: 'No authentication token found' };
    }
    
    const defaultPayload = {
      title: "Minimal Test",
      description: "Minimal test with only required fields",
      type: "fire",
      location: {
        type: "Point",
        coordinates: [2.3522, 48.8566] // Paris [longitude, latitude]
      },
      region: "507f1f77bcf86cd799439011",
      startTime: new Date().toISOString()
    };
    
    const payload = customPayload || defaultPayload;
    console.log('Testing direct API call with payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await axios.post(`${API_ENDPOINT}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('Direct API call succeeded:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Direct API call failed:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      }
      return { success: false, error: error.response?.data || error.message };
    }
  };
}
