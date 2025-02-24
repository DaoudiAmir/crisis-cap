import { Types } from 'mongoose';
import Vehicle, { IVehicle, VehicleType, VehicleStatus } from '../models/Vehicle';
import Region from '../models/Region';
import Intervention, { IIntervention } from '../models/Intervention';
import AppError from '../utils/AppError';
import type { SocketService } from './SocketService';
import { default as socketService } from './SocketService';

interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
}

// Initialize socket service
socketService.initialize(null); // Will be properly initialized later

interface CreateVehicleDTO {
  type: VehicleType;
  location: {
    coordinates: [number, number];
  };
  region: string;
}

interface UpdateVehicleDTO {
  status?: VehicleStatus;
  location?: {
    coordinates: [number, number];
  };
  region?: string;
}

interface VehicleLocation {
  vehicleId: string;
  coordinates: [number, number];
  timestamp: Date;
}

interface VehicleInterventionHistory {
  intervention: IIntervention;
  startTime: Date;
  endTime?: Date;
  status: string;
}

class VehicleService {
  // Create a new vehicle
  async createVehicle(data: CreateVehicleDTO): Promise<IVehicle> {
    try {
      // Verify region exists
      const region = await Region.findById(data.region);
      if (!region) {
        throw new AppError('Region not found', 404);
      }

      const vehicle = await Vehicle.create({
        ...data,
        region: new Types.ObjectId(data.region),
        status: VehicleStatus.AVAILABLE
      });

      return vehicle;
    } catch (err) {
      const error = err as ServiceError;
      throw new AppError(error.message || 'Error creating vehicle', error.statusCode || 500);
    }
  }

  // Get vehicle by ID
  async getVehicleById(vehicleId: string): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }
      return vehicle;
    } catch (err) {
      const error = err as ServiceError;
      throw new AppError(error.message || 'Error fetching vehicle', error.statusCode || 500);
    }
  }

  // Update vehicle
  async updateVehicle(vehicleId: string, updateData: UpdateVehicleDTO): Promise<IVehicle> {
    try {
      if (updateData.region) {
        const region = await Region.findById(updateData.region);
        if (!region) {
          throw new AppError('Region not found', 404);
        }
        updateData.region = new Types.ObjectId(updateData.region).toString();
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      // Emit socket event for location update if location changed
      if (updateData.location && socketService) {
        socketService.emitVehicleLocationUpdated({
          vehicleId,
          coordinates: updateData.location.coordinates,
          timestamp: new Date()
        });
      }

      return vehicle;
    } catch (err) {
      const error = err as ServiceError;
      throw new AppError(error.message || 'Error updating vehicle', error.statusCode || 500);
    }
  }

  // Update vehicle status
  async updateVehicleStatus(vehicleId: string, status: VehicleStatus): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      vehicle.status = status;
      await vehicle.save();

      // Emit socket event
      socketService.emitVehicleStatusChanged({
        vehicleId,
        status
      });

      return vehicle;
    } catch (error) {
      console.error('Update vehicle status error:', error);
      throw error;
    }
  }

  // Mark vehicle as in use
  async markVehicleInUse(vehicleId: string): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      vehicle.status = VehicleStatus.DEPLOYED;
      await vehicle.save();

      // Emit socket event
      socketService.emitVehicleStatusChanged({
        vehicleId,
        status: VehicleStatus.DEPLOYED
      });

      return vehicle;
    } catch (error) {
      console.error('Mark vehicle in use error:', error);
      throw error;
    }
  }

  // Get vehicles by region
  async getVehiclesByRegion(regionId: string): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ region: new Types.ObjectId(regionId) });
    } catch (err) {
      throw new AppError('Error fetching vehicles by region', 500);
    }
  }

  // Get available vehicles in region
  async getAvailableVehiclesByRegion(regionId: string): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({
        region: new Types.ObjectId(regionId),
        status: VehicleStatus.AVAILABLE
      });
    } catch (err) {
      throw new AppError('Error fetching available vehicles', 500);
    }
  }

  // Update vehicle location
  async updateVehicleLocation(vehicleId: string, coordinates: [number, number]): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        {
          location: {
            type: 'Point',
            coordinates
          }
        },
        { new: true }
      );

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      // Emit socket event
      socketService.emitVehicleLocationUpdated({
        vehicleId,
        coordinates,
        timestamp: new Date()
      });

      return vehicle;
    } catch (err) {
      throw new AppError('Error updating vehicle location', 500);
    }
  }

  // Get vehicles by type
  async getVehiclesByType(type: VehicleType): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ type });
    } catch (err) {
      throw new AppError('Error fetching vehicles by type', 500);
    }
  }

  // Get vehicles by status
  async getVehiclesByStatus(status: VehicleStatus): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ status });
    } catch (err) {
      throw new AppError('Error fetching vehicles by status', 500);
    }
  }

  // Get vehicle intervention history
  async getVehicleInterventionHistory(vehicleId: string): Promise<VehicleInterventionHistory[]> {
    try {
      const interventions = await Intervention.find({
        'resources.resourceId': vehicleId,
        'resources.resourceType': 'Vehicle'
      }).sort({ startTime: -1 });

      return interventions.map(intervention => ({
        intervention,
        startTime: intervention.startTime,
        endTime: intervention.endTime,
        status: intervention.status
      }));
    } catch (err) {
      throw new AppError('Error fetching vehicle intervention history', 500);
    }
  }

  // Set vehicle maintenance status
  async setVehicleMaintenance(vehicleId: string): Promise<IVehicle> {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      if (vehicle.status === VehicleStatus.IN_USE) {
        throw new AppError('Cannot set maintenance status for vehicle in use', 400);
      }

      vehicle.status = VehicleStatus.MAINTENANCE;
      await vehicle.save();

      return vehicle;
    } catch (err) {
      const error = err as ServiceError;
      throw new AppError(error.message || 'Error setting vehicle maintenance status', error.statusCode || 500);
    }
  }
}

export default new VehicleService();
