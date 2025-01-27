import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { IIntervention } from '../models/Intervention';
import { InterventionEvents, ResourceEvents, AlertEvents } from '../utils/events';

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

  public emitResourcesAssigned(intervention: IIntervention): void {
    this.io.to(`region:${intervention.region}`).emit(InterventionEvents.RESOURCES_ASSIGNED, intervention);
    
    // Notify assigned resources individually
    intervention.resources.forEach(resource => {
      this.io.to(`user:${resource.resourceId}`).emit(ResourceEvents.RESOURCE_ASSIGNED, intervention);
    });
  }

  // Alert events
  public emitAlertCreated(alert: any, regionId: string): void {
    this.io.to(`region:${regionId}`).emit(AlertEvents.ALERT_CREATED, alert);
  }

  public emitAlertUpdated(alert: any, regionId: string): void {
    this.io.to(`region:${regionId}`).emit(AlertEvents.ALERT_UPDATED, alert);
  }

  public emitVehicleLocationUpdated(data: { vehicleId: string; coordinates: [number, number]; timestamp: Date }): void {
    this.io.emit('vehicle:location_updated', data);
  }
}

export default SocketService;
