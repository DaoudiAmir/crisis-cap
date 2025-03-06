import axios from 'axios';
import { CreateInterventionPayload, InterventionType } from '@/types/intervention';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    const config = getAuthHeaders();
    console.log('Fetching interventions with config:', config);
    const response = await axios.get(`${API_URL}/v1/interventions`, config);
    return response.data.data.interventions;
  } catch (error) {
    console.error('Error fetching interventions:', error);
    // Return mock data if API call fails
    return getMockInterventions();
  }
};

// Get active interventions
export const getActiveInterventions = async (): Promise<InterventionType[]> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.get(`${API_URL}/v1/interventions/active`, config);
    return response.data.data.interventions;
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
    const response = await axios.get(`${API_URL}/v1/interventions/${id}`, config);
    return response.data.data.intervention;
  } catch (error) {
    console.error(`Error fetching intervention ${id}:`, error);
    return null;
  }
};

/**
 * Creates a new intervention
 * @param data Intervention data
 * @returns Created intervention or null if error
 */
export const createIntervention = async (data: CreateInterventionPayload): Promise<InterventionType | null> => {
  try {
    // Extract coordinates for easier validation
    let longitude = 1.888334; // Default to France center longitude
    let latitude = 46.603354; // Default to France center latitude
    
    // Try to get coordinates from the data
    if (Array.isArray(data.location.coordinates) && data.location.coordinates.length === 2) {
      const [lon, lat] = data.location.coordinates;
      if (!isNaN(Number(lon)) && !isNaN(Number(lat))) {
        longitude = Number(lon);
        latitude = Number(lat);
      }
    } else if (!isNaN(Number(data.location.longitude)) && !isNaN(Number(data.location.latitude))) {
      longitude = Number(data.location.longitude);
      latitude = Number(data.location.latitude);
    }
    
    // Format the payload to match the backend expectations
    // Based on the backend schema and controller implementation
    const payload = {
      title: data.title,
      description: data.description,
      type: (data.type || 'fire').toLowerCase(),
      priority: (data.priority || 'MEDIUM').toUpperCase(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: data.location.address || 'Adresse non spécifiée'
      },
      code: data.code || `INT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      status: (data.status || 'pending').toLowerCase(),
      region: data.region || '507f1f77bcf86cd799439011',
      station: data.station || '507f1f77bcf86cd799439012',
      startTime: data.startTime || new Date().toISOString(),
      commander: data.commander || '507f1f77bcf86cd799439013',
      createdBy: data.createdBy || '507f1f77bcf86cd799439014',
      riskLevel: (data.riskLevel || 'medium').toLowerCase(),
      hazards: Array.isArray(data.hazards) ? data.hazards : [],
      teams: [],
      resources: [],
      notes: [],
      timeline: [],
      transcripts: []
    };

    console.log('Creating intervention with payload:', JSON.stringify(payload, null, 2));

    // Use the correct API endpoint based on the API structure
    const response = await axios.post(`${API_URL}/v1/interventions`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (response.status === 201 || response.status === 200) {
      console.log('Intervention created successfully:', response.data);
      return response.data.data?.intervention || response.data;
    } else {
      console.error('Unexpected response status:', response.status);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating intervention:', error.response?.data || error.message);
      
      // Log detailed validation errors if available
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.warn('Authentication error. Using mock data fallback.');
        return mockCreateIntervention(data);
      }
    } else {
      console.error('Unknown error creating intervention:', error);
    }
    return null;
  }
};

/**
 * Mock function to simulate creating an intervention
 * @param data Intervention data
 * @returns Mocked intervention
 */
const mockCreateIntervention = (data: CreateInterventionPayload): InterventionType => {
  const mockId = `mock-${Math.random().toString(36).substring(2, 15)}`;
  
  return {
    _id: mockId,
    code: data.code || `INT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    title: data.title,
    description: data.description,
    type: data.type,
    priority: data.priority,
    status: (data.status || 'pending').toLowerCase(),
    location: {
      type: 'Point',
      coordinates: data.location.coordinates || [1.888334, 46.603354],
      address: data.location.address || 'Adresse non spécifiée'
    },
    region: data.region || '507f1f77bcf86cd799439011',
    station: data.station || '507f1f77bcf86cd799439012',
    startTime: data.startTime || new Date().toISOString(),
    commander: data.commander || '507f1f77bcf86cd799439013',
    createdBy: data.createdBy || '507f1f77bcf86cd799439014',
    riskLevel: (data.riskLevel || 'medium').toLowerCase(),
    hazards: data.hazards || [],
    teams: [],
    resources: [],
    notes: [],
    timeline: [],
    transcripts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Test function to diagnose intervention creation validation requirements
 * This function sends a minimal payload to identify the exact required fields
 */
export const testInterventionCreation = async (): Promise<any> => {
  try {
    // Create a minimal test payload with only the fields we believe are required
    const minimalPayload = {
      title: "Test Intervention",
      description: "This is a test intervention to diagnose validation requirements",
      type: "fire",
      priority: "MEDIUM",
      location: {
        type: "Point",
        coordinates: [2.3489889, 48.8616376], // Paris coordinates
        address: "Test Address, Paris, France"
      },
      region: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId
      station: "507f1f77bcf86cd799439012", // Valid MongoDB ObjectId
      startTime: new Date().toISOString(),
      commander: "507f1f77bcf86cd799439013", // Valid MongoDB ObjectId
      createdBy: "507f1f77bcf86cd799439014", // Valid MongoDB ObjectId
      riskLevel: "medium",
      status: "pending"
    };

    console.log('Testing intervention creation with minimal payload:', JSON.stringify(minimalPayload, null, 2));

    // Try different API endpoint formats to identify the correct one
    const endpoints = [
      `${API_URL}/interventions`,
      `${API_URL}/v1/interventions`,
      `${API_URL}/api/interventions`,
      `${API_URL}/api/v1/interventions`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await axios.post(endpoint, minimalPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        console.log(`Success with endpoint ${endpoint}:`, response.data);
        return {
          success: true,
          endpoint,
          response: response.data
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`Error with endpoint ${endpoint}:`, error.response?.data || error.message);
        } else {
          console.error(`Unknown error with endpoint ${endpoint}:`, error);
        }
      }
    }

    // If all endpoints fail, return mock data
    return {
      success: false,
      message: "All endpoints failed, using mock data",
      mockData: mockCreateIntervention({
        title: "Test Intervention",
        description: "This is a test intervention",
        type: "fire",
        priority: "MEDIUM",
        location: {
          latitude: 48.8616376,
          longitude: 2.3489889,
          address: "Test Address, Paris, France"
        }
      })
    };
  } catch (error) {
    console.error('Error in test intervention creation:', error);
    return {
      success: false,
      error
    };
  }
};

// Update intervention status
export const updateInterventionStatus = async (id: string, status: string): Promise<InterventionType | null> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.patch(`${API_URL}/v1/interventions/${id}`, { status }, config);
    return response.data.data.intervention;
  } catch (error) {
    console.error(`Error updating intervention ${id} status:`, error);
    return null;
  }
};

// Add note to intervention
export const addNoteToIntervention = async (id: string, note: string): Promise<InterventionType | null> => {
  try {
    const config = getAuthHeaders();
    const response = await axios.post(`${API_URL}/v1/interventions/${id}/notes`, { note }, config);
    return response.data.data.intervention;
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
