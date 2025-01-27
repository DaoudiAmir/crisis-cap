import { Types } from 'mongoose';
import Vehicle, { IVehicle, VehicleType, VehicleStatus } from '../models/Vehicle';
import Region from '../models/Region';
import Intervention from '../models/Intervention';
import AppError from '../utils/AppError';
import SocketService from './SocketService';

let socketService: SocketService;

export const initializeSocketService = (service: SocketService) => {
  socketService = service;
};

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
    } catch (err: any) {
      throw new AppError(err.message || 'Error creating vehicle', err.statusCode || 500);
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
    } catch (err: any) {
      throw new AppError(err.message || 'Error fetching vehicle', err.statusCode || 500);
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
    } catch (err: any) {
      throw new AppError(err.message || 'Error updating vehicle', err.statusCode || 500);
    }
  }

  // Get vehicles by region
  async getVehiclesByRegion(regionId: string): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ region: new Types.ObjectId(regionId) });
    } catch (err: any) {
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
    } catch (err: any) {
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
      if (socketService) {
        socketService.emitVehicleLocationUpdated({
          vehicleId,
          coordinates,
          timestamp: new Date()
        });
      }

      return vehicle;
    } catch (err: any) {
      throw new AppError('Error updating vehicle location', 500);
    }
  }

  // Get vehicles by type
  async getVehiclesByType(type: VehicleType): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ type });
    } catch (err: any) {
      throw new AppError('Error fetching vehicles by type', 500);
    }
  }

  // Get vehicles by status
  async getVehiclesByStatus(status: VehicleStatus): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ status });
    } catch (err: any) {
      throw new AppError('Error fetching vehicles by status', 500);
    }
  }

  // Get vehicle intervention history
  async getVehicleInterventionHistory(vehicleId: string): Promise<any[]> {
    try {
      return await Intervention.find({
        'resources.resourceId': vehicleId,
        'resources.resourceType': 'Vehicle'
      }).sort({ startTime: -1 });
    } catch (err: any) {
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
    } catch (err: any) {
      throw new AppError(err.message || 'Error setting vehicle maintenance status', err.statusCode || 500);
    }
  }
}

export default new VehicleService();
