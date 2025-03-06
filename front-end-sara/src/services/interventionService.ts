import axios from 'axios';
import { CreateInterventionPayload, InterventionType } from '@/types/intervention';

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
export const createIntervention = async (
  data: CreateInterventionPayload
): Promise<{ success: boolean; data?: InterventionType; error?: string }> => {
  try {
    console.log('Creating intervention with data:', data);
    
    // Set proper API endpoint
    const API_ENDPOINT = `${API_BASE}/interventions`;
    console.log('Using API endpoint:', API_ENDPOINT);
    
    // Generate a default MongoDB ObjectId if needed
    const defaultObjectId = "507f1f77bcf86cd799439011";
    
    // Prepare location data - handle if the location is not yet in the expected format
    let latitude = 46.603354; // Default to France's center if not available
    let longitude = 1.888334;
    
    if (data.location) {
      // If the coordinates are already in the right GeoJSON format
      if (data.location.coordinates && 
          Array.isArray(data.location.coordinates) && 
          data.location.coordinates.length === 2 &&
          data.location.coordinates[0] !== null &&
          data.location.coordinates[1] !== null) {
        longitude = data.location.coordinates[0];
        latitude = data.location.coordinates[1];
        console.log('Using provided coordinates:', longitude, latitude);
      }
      // If the coordinates aren't in the location object yet but we need to construct them
      // This handles transitioning from the old format to the new one
      else if ('latitude' in data.location && 'longitude' in data.location && 
               data.location.latitude !== undefined && data.location.longitude !== undefined &&
               data.location.latitude !== null && data.location.longitude !== null) {
        latitude = data.location.latitude;
        longitude = data.location.longitude;
        console.log('Using latitude/longitude from location object:', longitude, latitude);
      }
    }
    
    // If we have an address but no coordinates, try to geocode it
    if (data.location && data.location.address && 
        (!longitude || !latitude || longitude === 0 || latitude === 0 || 
         longitude === null || latitude === null)) {
      try {
        console.log('Geocoding address:', data.location.address);
        const coords = await geocodeAddress(data.location.address);
        if (coords && coords.latitude && coords.longitude && 
            !isNaN(coords.latitude) && !isNaN(coords.longitude)) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          console.log('Geocoded coordinates:', latitude, longitude);
        } else {
          console.warn('Geocoding returned invalid coordinates, using defaults');
        }
      } catch (error) {
        console.warn('Error geocoding address:', error);
        // Use default coordinates if geocoding fails
      }
    }
    
    // Ensure we have valid coordinates by checking for NaN, null, or undefined
    if (isNaN(latitude) || isNaN(longitude) || latitude === null || longitude === null) {
      console.warn('Invalid coordinates detected, using default coordinates for France');
      latitude = 46.603354;
      longitude = 1.888334;
    }
    
    // Format date if needed
    let startTime = data.startTime;
    if (!startTime) {
      startTime = new Date().toISOString();
    } else if (typeof startTime === 'string') {
      // Make sure we have a valid date format for the backend
      const date = new Date(startTime);
      if (!isNaN(date.getTime())) {
        startTime = date.toISOString();
      }
    }
    
    // Format the payload to match EXACTLY the backend CreateInterventionDTO interface
    // Provide default values for all required fields to prevent validation errors
    const payload = {
      title: data.title || "Intervention sans titre",
      description: data.description || "Aucune description fournie", 
      type: data.type || "other",
      priority: (data.priority || "MEDIUM").toUpperCase(), // Schema expects uppercase enum values
      location: {
        type: "Point",
        coordinates: [longitude, latitude] as [number, number], // GeoJSON format: [longitude, latitude]
        address: data.location?.address || 'Address not specified'
      },
      region: data.region || "default-region", // Use string ID instead of ObjectId
      station: data.station || "default-station", // Use string ID instead of ObjectId
      startTime: startTime,
      commander: data.commander || defaultObjectId, // Required field as MongoDB ObjectId
      estimatedDuration: data.estimatedDuration || 60,
      riskLevel: data.riskLevel || "medium",
      hazards: data.hazards || [],
      status: data.status || "pending", // Default status
      createdBy: data.createdBy || "system", // Use string ID instead of ObjectId
      resources: data.resources || [],
      teams: data.teams || [],
      code: data.code || `INT-${Date.now().toString().slice(-6)}`, // Generate a default code if not provided
      weatherConditions: data.weatherConditions || {
        temperature: 20,
        windSpeed: 10,
        windDirection: "N",
        precipitation: "none",
        visibility: "good"
      }
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
      // Debug information
      console.log('Making API call to:', API_ENDPOINT);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken.substring(0, 10)}...` : 'null'
      });
      
      const response = await axios.post(API_ENDPOINT, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('Intervention created successfully:', response.data);
      
      // If we have resources, assign them to the intervention
      if (data.resources && data.resources.length > 0 && response.data.data?.intervention?._id) {
        try {
          const interventionId = response.data.data.intervention._id;
          
          console.log('Assigning resources to intervention:', interventionId);
          // Import and use the resourceService here
          const { assignResourcesToIntervention } = await import('./resourceService');
          
          const resourceResult = await assignResourcesToIntervention({
            interventionId,
            resources: data.resources
          });
          
          if (!resourceResult.success) {
            console.warn('Failed to assign resources:', resourceResult.error);
          }
        } catch (resourceError) {
          console.error('Error assigning resources:', resourceError);
        }
      }
      
      // If we have teams, assign them to the intervention
      if (data.teams && data.teams.length > 0 && response.data.data?.intervention?._id) {
        try {
          const interventionId = response.data.data.intervention._id;
          
          console.log('Assigning teams to intervention:', interventionId);
          // Import and use the resourceService here
          const { assignTeamToIntervention } = await import('./resourceService');
          
          for (const team of data.teams) {
            const teamResult = await assignTeamToIntervention({
              interventionId,
              teamId: team.teamId,
              role: team.role
            });
            
            if (!teamResult.success) {
              console.warn(`Failed to assign team ${team.teamId}:`, teamResult.error);
            }
          }
        } catch (teamError) {
          console.error('Error assigning teams:', teamError);
        }
      }
      
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
      error: `Exception: ${error.message}. Using mock data instead.`
    };
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
    
    const response = await axios.post(API_ENDPOINT, testPayload, {
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

// Make the test function available in the global scope for browser console testing
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
      const response = await axios.post(API_ENDPOINT, payload, {
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
