import { Types } from 'mongoose';
import ResourceAlert, { IResourceAlert, ResourceType } from '../models/ResourceAlert';
import Vehicle, { IVehicle, VehicleStatus } from '../models/Vehicle';
import Region from '../models/Region';
import AppError from '../utils/AppError';

interface ResourceAlertDTO {
  resourceType: ResourceType;
  level: number;
  severity: number;
  regionalObjectId: string;
}

interface VehicleAssignmentDTO {
  vehicleId: string;
  regionId: string;
  status?: VehicleStatus;
}

class ResourceManagementService {
  // Create a resource alert
  async createResourceAlert(data: ResourceAlertDTO): Promise<IResourceAlert> {
    try {
      // Validate region exists
      const region = await Region.findById(data.regionalObjectId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }

      const alert = await ResourceAlert.create({
        resourceType: data.resourceType,
        level: data.level,
        severity: data.severity,
        regional: {
          objectId: data.regionalObjectId
        },
        triggeredAt: new Date()
      });

      return alert;
    } catch (error) {
      throw new AppError('Error creating resource alert', 500);
    }
  }

  // Get active alerts for a region
  async getRegionActiveAlerts(regionId: string): Promise<IResourceAlert[]> {
    try {
      return await ResourceAlert.find({
        'regional.objectId': new Types.ObjectId(regionId)
      }).sort({ severity: -1, triggeredAt: -1 });
    } catch (error) {
      throw new AppError('Error fetching region alerts', 500);
    }
  }

  // Resolve a resource alert
  async resolveAlert(alertId: string): Promise<IResourceAlert | null> {
    try {
      const alert = await ResourceAlert.findById(alertId);
      if (!alert) {
        throw new AppError('Alert not found', 404);
      }

      await alert.resolveAlert();
      return alert;
    } catch (error) {
      throw new AppError('Error resolving alert', 500);
    }
  }

  // Assign vehicle to region
  async assignVehicleToRegion(data: VehicleAssignmentDTO): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findById(data.vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      const region = await Region.findById(data.regionId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }

      vehicle.region = new Types.ObjectId(data.regionId);
      if (data.status) {
        vehicle.status = data.status;
      }

      await vehicle.save();
      return vehicle;
    } catch (error) {
      throw new AppError('Error assigning vehicle to region', 500);
    }
  }

  // Get available vehicles in a region
  async getRegionAvailableVehicles(regionId: string): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({
        region: new Types.ObjectId(regionId),
        status: VehicleStatus.AVAILABLE
      });
    } catch (error) {
      throw new AppError('Error fetching available vehicles', 500);
    }
  }

  // Update vehicle status
  async updateVehicleStatus(
    vehicleId: string,
    status: VehicleStatus
  ): Promise<IVehicle | null> {
    try {
      return await Vehicle.findByIdAndUpdate(
        vehicleId,
        { status },
        { new: true }
      );
    } catch (error) {
      throw new AppError('Error updating vehicle status', 500);
    }
  }

  // Check resource levels and create alerts if necessary
  async monitorResourceLevels(regionId: string): Promise<void> {
    try {
      const vehicles = await this.getRegionAvailableVehicles(regionId);
      
      // Example threshold checks (these would be configurable in production)
      const vehicleThreshold = 3;
      if (vehicles.length < vehicleThreshold) {
        await this.createResourceAlert({
          resourceType: ResourceType.EQUIPMENT,
          level: (vehicles.length / vehicleThreshold) * 100,
          severity: 4,
          regionalObjectId: regionId
        });
      }
    } catch (error) {
      throw new AppError('Error monitoring resource levels', 500);
    }
  }
}

export default new ResourceManagementService();
