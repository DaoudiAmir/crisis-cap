import axios from 'axios';
import { CreateInterventionPayload, InterventionType } from '@/types/intervention';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Get all interventions
export const getAllInterventions = async (): Promise<InterventionType[]> => {
  try {
    const response = await axios.get(`${API_URL}/v1/interventions`);
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
    const response = await axios.get(`${API_URL}/v1/interventions/active`);
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
    const response = await axios.get(`${API_URL}/v1/interventions/${id}`);
    return response.data.data.intervention;
  } catch (error) {
    console.error(`Error fetching intervention ${id}:`, error);
    return null;
  }
};

// Create new intervention
export const createIntervention = async (interventionData: CreateInterventionPayload): Promise<InterventionType | null> => {
  try {
    const response = await axios.post(`${API_URL}/v1/interventions`, interventionData);
    return response.data.data.intervention;
  } catch (error) {
    console.error('Error creating intervention:', error);
    return null;
  }
};

// Update intervention status
export const updateInterventionStatus = async (id: string, status: string): Promise<InterventionType | null> => {
  try {
    const response = await axios.patch(`${API_URL}/v1/interventions/${id}`, { status });
    return response.data.data.intervention;
  } catch (error) {
    console.error(`Error updating intervention ${id} status:`, error);
    return null;
  }
};

// Add note to intervention
export const addNoteToIntervention = async (id: string, note: string): Promise<InterventionType | null> => {
  try {
    const response = await axios.post(`${API_URL}/v1/interventions/${id}/notes`, { note });
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
