export enum InterventionStatus {
  PENDING = 'pending',
  DISPATCHED = 'dispatched',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InterventionType {
  FIRE = 'fire',
  ACCIDENT = 'accident',
  MEDICAL = 'medical',
  RESCUE = 'rescue',
  HAZMAT = 'hazmat',
  NATURAL_DISASTER = 'natural_disaster'
}

export enum InterventionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TimelineEvent {
  timestamp: Date;
  event: string;
  details?: string;
  recordedBy: string;
}

export interface Note {
  timestamp: Date;
  content: string;
  author: string;
}

export interface Resource {
  resourceId: string;
  resourceType: 'User' | 'Vehicle';
  status: 'assigned' | 'en_route' | 'on_site' | 'returning';
  assignedAt: Date;
  arrivedAt?: Date;
}

export interface Team {
  teamId: string;
  role: string;
  assignedAt: Date;
}

export interface Intervention {
  _id: string;
  code: string;
  title: string;
  description: string;
  status: InterventionStatus;
  type: InterventionType;
  priority: InterventionPriority;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON compatibility
    address: string;
    accessInstructions?: string;
  };
  region: string; // MongoDB ObjectId
  station: string; // MongoDB ObjectId
  startTime: Date;
  endTime?: Date;
  estimatedDuration?: number;
  commander?: string; // MongoDB ObjectId
  createdBy: string; // MongoDB ObjectId
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
  hazards?: string[];
  weatherConditions?: {
    temperature?: number;
    windSpeed?: number;
    windDirection?: string;
    precipitation?: string;
    visibility?: string;
  };
  notes?: Note[];
  timeline?: TimelineEvent[];
  updatedAt: Date;
}

export interface CreateInterventionPayload {
  title: string;
  description: string;
  type: string;
  priority: string;
  location: {
    type: string; // "Point" for GeoJSON compatibility
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON compatibility
    address: string;
    accessInstructions?: string;
  };
  region: string; // MongoDB ObjectId
  station: string; // MongoDB ObjectId format
  startTime: string; // ISO date string
  commander: string; // MongoDB ObjectId format for the commander
  estimatedDuration?: number; // Duration in minutes
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
  hazards?: string[];
  status?: string;
  resources?: Array<{
    resourceId: string;
    resourceType: 'User' | 'Vehicle';
  }>;
  teams?: Array<{
    teamId: string;
    role: string;
  }>;
  createdBy?: string; // The user who created the intervention
  weatherConditions?: {
    temperature?: number;
    windSpeed?: number;
    windDirection?: string;
    precipitation?: string;
    visibility?: string;
  };
}

export interface InterventionType {
  _id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON compatibility
    address: string;
  };
  region: string; // MongoDB ObjectId
  station: string; // MongoDB ObjectId
  startTime: string; // ISO date string
  commander: string; // MongoDB ObjectId
  createdBy: string; // MongoDB ObjectId
  riskLevel: string; // 'low', 'medium', 'high', 'extreme'
  hazards: string[];
  teams: any[];
  resources: any[];
  notes: any[];
  timeline: any[];
  transcripts: any[];
  createdAt: string;
  updatedAt: string;
}
