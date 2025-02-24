import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { UserRole, IUser } from '../models/User';
import { TeamStatus, ITeam } from '../models/Team';
import { InterventionStatus, IIntervention } from '../models/Intervention';
import { InterventionEvents, ResourceEvents, AlertEvents } from '../utils/events';
import { IStation, StationStatus } from '../models/Station';
import { IVehicle, VehicleStatus } from '../models/Vehicle';
import { IEquipment } from '../models/Equipment';

interface LocationData {
  coordinates: [number, number];
  timestamp?: Date;
}

interface AlertData {
  message: string;
  severity: 'low' | 'medium' | 'high';
  region?: string;
  timestamp?: Date;
}

interface UserUpdateData {
  status?: string;
  location?: LocationData;
  team?: string;
  station?: string;
}

interface TeamUpdateData {
  status?: TeamStatus;
  members?: string[];
  leader?: string;
  vehicle?: string;
  station?: string;
}

interface StationUpdateData {
  status?: StationStatus;
  capacity?: number;
  location?: LocationData;
  personnel?: string[];
  vehicles?: string[];
  equipment?: string[];
}

interface StationResourceData {
  stationId: string;
  resourceType: 'vehicle' | 'equipment' | 'personnel';
  action: 'add' | 'remove' | 'update';
  resource: IVehicle | IEquipment | IUser;
}

class SocketService {
  private static _instance: SocketService;
  private io: SocketServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  public initialize(server: Server): void {
    if (!this.io) {
      this.io = new SocketServer(server, {
        cors: {
          origin: process.env.CLIENT_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true
        }
      });
      this.setupEventHandlers();
      logger.info('Socket.IO service initialized');
    }
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join room for specific role
      socket.on('join:role', (role: string) => {
        socket.join(`role:${role}`);
      });

      // Join room for specific region
      socket.on('join:region', (region: string) => {
        socket.join(`region:${region}`);
      });

      // Join room for specific team
      socket.on('join:team', (teamId: string) => {
        socket.join(`team:${teamId}`);
      });

      // Join room for specific station
      socket.on('join:station', (stationId: string) => {
        socket.join(`station:${stationId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // User events
  public emitUserUpdated(userId: string, data: UserUpdateData): void {
    if (!this.io) return;
    this.io.emit(`user:${userId}:updated`, data);
  }

  public emitUserAvailabilityUpdated(data: { userId: string; isAvailable: boolean }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.USER_AVAILABILITY_UPDATED, data);
  }

  public emitUserLocationUpdated(data: { userId: string } & LocationData): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.USER_LOCATION_UPDATED, data);
  }

  public emitUserTeamUpdated(data: { userId: string; team: ITeam }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.USER_TEAM_UPDATED, data);
  }

  public emitUserStatusChanged(data: { userId: string; status: string }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.USER_STATUS_CHANGED, data);
  }

  // Team events
  public emitTeamUpdated(teamId: string, data: TeamUpdateData): void {
    if (!this.io) return;
    this.io.emit(`team:${teamId}:updated`, data);
  }

  public emitTeamStatusChanged(teamId: string, status: TeamStatus): void {
    if (!this.io) return;
    this.io.emit(`team:${teamId}:status`, { status });
  }

  // Intervention events
  public emitInterventionCreated(intervention: IIntervention): void {
    if (!this.io) return;
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_CREATED, intervention);
  }

  public emitInterventionUpdated(intervention: IIntervention): void {
    if (!this.io) return;
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_UPDATED, intervention);
  }

  public emitInterventionStatusChanged(intervention: IIntervention): void {
    if (!this.io) return;
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_STATUS_CHANGED, intervention);
  }

  // Vehicle events
  public emitVehicleLocationUpdated(data: { vehicleId: string } & LocationData): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.VEHICLE_LOCATION_UPDATED, data);
  }

  public emitVehicleStatusChanged(data: { vehicleId: string; status: VehicleStatus }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.VEHICLE_STATUS_CHANGED, data);
  }

  public emitVehicleAssignedToIntervention(data: { vehicleId: string; interventionId: string }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.VEHICLE_ASSIGNED_TO_INTERVENTION, data);
  }

  public emitVehicleRemovedFromIntervention(data: { vehicleId: string; interventionId: string }): void {
    if (!this.io) return;
    this.io.emit(ResourceEvents.VEHICLE_REMOVED_FROM_INTERVENTION, data);
  }

  // Alert events
  public emitEmergencyAlert(data: AlertData): void {
    if (!this.io) return;
    if (data.region) {
      this.io.to(`region:${data.region}`).emit(AlertEvents.EMERGENCY_ALERT, {
        ...data,
        timestamp: data.timestamp || new Date()
      });
    } else {
      this.io.emit(AlertEvents.EMERGENCY_ALERT, {
        ...data,
        timestamp: data.timestamp || new Date()
      });
    }
  }

  public emitWeatherAlert(data: AlertData): void {
    if (!this.io) return;
    if (data.region) {
      this.io.to(`region:${data.region}`).emit(AlertEvents.WEATHER_ALERT, {
        ...data,
        timestamp: data.timestamp || new Date()
      });
    } else {
      this.io.emit(AlertEvents.WEATHER_ALERT, {
        ...data,
        timestamp: data.timestamp || new Date()
      });
    }
  }

  public emitSystemAlert(data: Omit<AlertData, 'region'>): void {
    if (!this.io) return;
    this.io.emit(AlertEvents.SYSTEM_ALERT, {
      ...data,
      timestamp: data.timestamp || new Date()
    });
  }

  // Station events
  public emitStationUpdate(stationId: string, data: StationUpdateData): void {
    if (!this.io) return;
    this.io.emit(`station:${stationId}:update`, data);
  }

  public emitStationCreated(station: IStation): void {
    if (!this.io) return;
    this.io.emit('station:created', station);
  }

  public emitStationUpdated(station: IStation): void {
    if (!this.io) return;
    this.io.emit('station:updated', station);
  }

  public emitStationDeleted(stationId: string): void {
    if (!this.io) return;
    this.io.emit('station:deleted', { stationId });
  }

  public emitStationStatusChanged(station: IStation): void {
    if (!this.io) return;
    this.io.emit(`station:${station._id}:status`, station.status);
  }

  public emitStationResourceUpdated(data: StationResourceData): void {
    if (!this.io) return;
    this.io.emit(`station:${data.stationId}:resource`, data);
  }

  // Broadcast to specific roles
  public emitToRole(role: UserRole, event: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.to(`role:${role}`).emit(event, data);
  }
}

// Export both the type and the singleton instance
export type { SocketService };
const socketServiceInstance = SocketService.getInstance();
export default socketServiceInstance;
