import axios from 'axios';

// Internal getAuthToken function - same implementation as in interventionService.ts
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Base API URL configuration - updated to match interventionService.ts
// NOTE: The backend API is accessible at http://localhost:3000/api/v1
// So we ensure API_URL is just the base without the /api part
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Different parts of the app define API_URL either as 'http://localhost:3000/api' 
// or just 'http://localhost:3000', so we need to check and build accordingly
const API_BASE = API_URL.endsWith('/api') 
  ? `${API_URL}/v1` 
  : `${API_URL}/api/v1`;

// Endpoint definitions
const RESOURCES_ENDPOINT = `${API_BASE}/resources`;
const TEAMS_ENDPOINT = `${API_BASE}/teams`;
const USERS_ENDPOINT = `${API_BASE}/users`;
const VEHICLES_ENDPOINT = `${API_BASE}/vehicles`;
const EQUIPMENT_ENDPOINT = `${API_BASE}/equipment`;

// Resource types
export type ResourceType = 'User' | 'Vehicle' | 'Equipment';

// Resource status types
export type ResourceStatus = 'available' | 'assigned' | 'en_route' | 'on_site' | 'returning' | 'unavailable';

// Resource interface
export interface Resource {
  _id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  capabilities?: string[];
  assignedTo?: string; // ID of the intervention it's assigned to
}

// Team interface
export interface Team {
  _id: string;
  name: string;
  leader: string; // User ID
  members: string[]; // Array of User IDs
  vehicles: string[]; // Array of Vehicle IDs
  status: 'active' | 'standby' | 'unavailable';
  specializations?: string[];
  assignedTo?: string; // ID of the intervention it's assigned to
}

// Resource assignment request
export interface ResourceAssignmentRequest {
  interventionId: string;
  resources: Array<{
    id: string;
    type: ResourceType;
  }>;
}

// Team assignment request
export interface TeamAssignmentRequest {
  interventionId: string;
  teamId: string;
  role?: string;
}

/**
 * Get all available resources
 */
export const getAvailableResources = async (): Promise<Resource[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockResources().filter(r => r.status === 'available');
    }
    
    // Get available users
    const usersResponse = await axios.get(`${USERS_ENDPOINT}?status=available`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    // Get available vehicles
    const vehiclesResponse = await axios.get(`${VEHICLES_ENDPOINT}?status=available`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    // Combine and format as resources
    const users = usersResponse.data.data.users.map((user: any) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      type: 'User' as ResourceType,
      status: 'available' as ResourceStatus,
      capabilities: user.skills || [],
      location: user.lastKnownLocation
    }));
    
    const vehicles = vehiclesResponse.data.data.vehicles.map((vehicle: any) => ({
      _id: vehicle._id,
      name: vehicle.callSign || vehicle.registrationNumber,
      type: 'Vehicle' as ResourceType,
      status: 'available' as ResourceStatus,
      capabilities: vehicle.capabilities || [],
      location: vehicle.lastKnownLocation
    }));
    
    return [...users, ...vehicles];
  } catch (error) {
    console.error('Error fetching available resources:', error);
    return getMockResources().filter(r => r.status === 'available');
  }
};

/**
 * Get all teams
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockTeams();
    }
    
    const response = await axios.get(TEAMS_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    return response.data.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return getMockTeams();
  }
};

/**
 * Assign resources to an intervention
 */
export const assignResourcesToIntervention = async (
  request: ResourceAssignmentRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot assign resources');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.post(
      `${API_BASE}/interventions/${request.interventionId}/resources`,
      { resources: request.resources },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning resources:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to assign resources' 
    };
  }
};

/**
 * Assign a team to an intervention
 */
export const assignTeamToIntervention = async (
  request: TeamAssignmentRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot assign team');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.post(
      `${API_BASE}/interventions/${request.interventionId}/teams`,
      { 
        teamId: request.teamId,
        role: request.role || 'support'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning team:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to assign team' 
    };
  }
};

/**
 * Get resources assigned to an intervention
 */
export const getInterventionResources = async (
  interventionId: string
): Promise<Resource[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockResources().filter(r => r.assignedTo === interventionId);
    }
    
    const response = await axios.get(
      `${API_BASE}/interventions/${interventionId}/resources`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return response.data.data.resources;
  } catch (error) {
    console.error('Error fetching intervention resources:', error);
    return getMockResources().filter(r => r.assignedTo === interventionId);
  }
};

/**
 * Get teams assigned to an intervention
 */
export const getInterventionTeams = async (
  interventionId: string
): Promise<Team[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockTeams().filter(t => t.assignedTo === interventionId);
    }
    
    const response = await axios.get(
      `${API_BASE}/interventions/${interventionId}/teams`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return response.data.data.teams;
  } catch (error) {
    console.error('Error fetching intervention teams:', error);
    return getMockTeams().filter(t => t.assignedTo === interventionId);
  }
};

/**
 * Update a resource's status
 */
export const updateResourceStatus = async (
  resourceId: string,
  resourceType: ResourceType,
  status: ResourceStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot update resource status');
      return { success: false, error: 'Authentication required' };
    }
    
    // Determine the endpoint based on resource type
    const endpoint = resourceType === 'User' 
      ? `${USERS_ENDPOINT}/${resourceId}/status`
      : `${VEHICLES_ENDPOINT}/${resourceId}/status`;
    
    const response = await axios.patch(
      endpoint,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating resource status:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update resource status' 
    };
  }
};

/**
 * Remove a resource from an intervention
 */
export const removeResourceFromIntervention = async (
  interventionId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot remove resource');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.delete(
      `${API_BASE}/interventions/${interventionId}/resources/${resourceId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error removing resource:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to remove resource' 
    };
  }
};

/**
 * Remove a team from an intervention
 */
export const removeTeamFromIntervention = async (
  interventionId: string,
  teamId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot remove team');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.delete(
      `${API_BASE}/interventions/${interventionId}/teams/${teamId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error removing team:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to remove team' 
    };
  }
};

/**
 * Get all equipment
 */
export const getAllEquipment = async (): Promise<Resource[]> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, using mock data');
      return getMockResources().filter(r => r.type === 'Equipment');
    }
    
    const response = await axios.get(EQUIPMENT_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    if (response.data && response.data.data && response.data.data.equipment) {
      return response.data.data.equipment.map((equipment: any) => ({
        _id: equipment._id,
        name: equipment.name || equipment.serialNumber || 'Unknown Equipment',
        type: 'Equipment' as ResourceType,
        status: equipment.status || 'available',
        capabilities: equipment.capabilities || [],
        station: equipment.station || 'Unknown',
        lastMaintenance: equipment.lastMaintenance || null,
        assignedTo: equipment.assignedTo || null
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching equipment:', error);
    // Return mock equipment data as fallback
    return getMockResources().filter(r => r.type === 'Equipment');
  }
};

/**
 * Create new equipment
 */
export const createEquipment = async (data: Partial<Resource>): Promise<{ success: boolean; data?: Resource; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot create equipment');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.post(
      EQUIPMENT_ENDPOINT,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { 
      success: true,
      data: response.data.data.equipment
    };
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to create equipment' 
    };
  }
};

/**
 * Update equipment
 */
export const updateEquipment = async (id: string, data: Partial<Resource>): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot update equipment');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.put(
      `${EQUIPMENT_ENDPOINT}/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update equipment' 
    };
  }
};

/**
 * Delete equipment
 */
export const deleteEquipment = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token found, cannot delete equipment');
      return { success: false, error: 'Authentication required' };
    }
    
    const response = await axios.delete(
      `${EQUIPMENT_ENDPOINT}/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to delete equipment' 
    };
  }
};

// Mock data for offline development
const getMockResources = (): Resource[] => [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'John Smith',
    type: 'User',
    status: 'available',
    capabilities: ['First Aid', 'Fire Fighting'],
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Fire Engine 1',
    type: 'Vehicle',
    status: 'available',
    capabilities: ['Water Tank', 'Ladder', 'Rescue Equipment'],
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Sarah Johnson',
    type: 'User',
    status: 'assigned',
    capabilities: ['Medical', 'Paramedic'],
    assignedTo: '60d21b4667d0d8992e610c90'
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    name: 'Ambulance 2',
    type: 'Vehicle',
    status: 'en_route',
    capabilities: ['Medical Equipment', 'Transport'],
    assignedTo: '60d21b4667d0d8992e610c90'
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    name: 'Mark Wilson',
    type: 'User',
    status: 'on_site',
    capabilities: ['Search and Rescue', 'Disaster Response'],
    assignedTo: '60d21b4667d0d8992e610c91'
  }
];

const getMockTeams = (): Team[] => [
  {
    _id: '60d21b4667d0d8992e610c95',
    name: 'Alpha Team',
    leader: '60d21b4667d0d8992e610c85',
    members: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c87'],
    vehicles: ['60d21b4667d0d8992e610c86'],
    status: 'active',
    specializations: ['Fire Response', 'Urban Search']
  },
  {
    _id: '60d21b4667d0d8992e610c96',
    name: 'Medical Response Unit',
    leader: '60d21b4667d0d8992e610c87',
    members: ['60d21b4667d0d8992e610c87'],
    vehicles: ['60d21b4667d0d8992e610c88'],
    status: 'active',
    specializations: ['Medical Emergency', 'Triage'],
    assignedTo: '60d21b4667d0d8992e610c90'
  },
  {
    _id: '60d21b4667d0d8992e610c97',
    name: 'Rescue Squad',
    leader: '60d21b4667d0d8992e610c89',
    members: ['60d21b4667d0d8992e610c89'],
    vehicles: [],
    status: 'standby',
    specializations: ['High-Angle Rescue', 'Water Rescue']
  }
];
