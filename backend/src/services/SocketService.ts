import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { IIntervention } from '../models/Intervention';
import { InterventionEvents, ResourceEvents, AlertEvents } from '../utils/events';

interface UserAvailability {
  status: string;
  startTime?: Date;
  endTime?: Date;
  lastUpdated: Date;
}

interface UserTeam {
  teamId: string;
  role: string;
  joinedAt: Date;
}

interface Coordinates {
  type: 'Point';
  coordinates: [number, number];
}

interface LocationData {
  coordinates: [number, number];
  timestamp: Date;
}

interface AlertData {
  type: string;
  message: string;
  region?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
}

class SocketService {
  private io: SocketServer;

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join room for specific role
      socket.on('join:role', (role: string) => {
        socket.join(`role:${role}`);
      });

      // Join room for specific region
      socket.on('join:region', (regionId: string) => {
        socket.join(`region:${regionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  // Intervention events
  public emitInterventionCreated(intervention: IIntervention): void {
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_CREATED, intervention);
  }

  public emitInterventionUpdated(intervention: IIntervention): void {
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_UPDATED, intervention);
  }

  public emitInterventionStatusChanged(intervention: IIntervention): void {
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.INTERVENTION_STATUS_CHANGED, intervention);
  }

  // User events
  public emitUserAvailabilityUpdated(data: { userId: string; availability: UserAvailability }): void {
    this.io.emit(ResourceEvents.USER_AVAILABILITY_UPDATED, data);
  }

  public emitUserLocationUpdated(data: { userId: string } & LocationData): void {
    this.io.emit(ResourceEvents.USER_LOCATION_UPDATED, data);
  }

  public emitUserTeamUpdated(data: { userId: string; team: UserTeam | null }): void {
    this.io.emit(ResourceEvents.USER_TEAM_UPDATED, data);
  }

  public emitUserStatusChanged(data: { userId: string; status: string }): void {
    this.io.emit(ResourceEvents.USER_STATUS_CHANGED, data);
  }

  public emitUserAssignedToIntervention(data: { userId: string; interventionId: string }): void {
    this.io.emit(ResourceEvents.USER_ASSIGNED_TO_INTERVENTION, data);
  }

  public emitUserRemovedFromIntervention(data: { userId: string; interventionId: string }): void {
    this.io.emit(ResourceEvents.USER_REMOVED_FROM_INTERVENTION, data);
  }

  // Vehicle events
  public emitVehicleLocationUpdated(data: { vehicleId: string } & LocationData): void {
    this.io.emit(ResourceEvents.VEHICLE_LOCATION_UPDATED, data);
  }

  public emitVehicleStatusChanged(data: { vehicleId: string; status: string }): void {
    this.io.emit(ResourceEvents.VEHICLE_STATUS_CHANGED, data);
  }

  public emitVehicleAssignedToIntervention(data: { vehicleId: string; interventionId: string }): void {
    this.io.emit(ResourceEvents.VEHICLE_ASSIGNED_TO_INTERVENTION, data);
  }

  public emitVehicleRemovedFromIntervention(data: { vehicleId: string; interventionId: string }): void {
    this.io.emit(ResourceEvents.VEHICLE_REMOVED_FROM_INTERVENTION, data);
  }

  // Alert events
  public emitEmergencyAlert(data: AlertData): void {
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
    this.io.emit(AlertEvents.SYSTEM_ALERT, {
      ...data,
      timestamp: data.timestamp || new Date()
    });
  }
}

export default SocketService;
