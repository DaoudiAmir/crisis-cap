import { Types } from 'mongoose';
import Region, { IRegion } from '../models/Region';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import AppError from '../utils/AppError';

interface CreateRegionDTO {
  name: string;
  coordinates: { number: number }[];
}

interface UpdateRegionDTO {
  name?: string;
  coordinates?: { number: number }[];
}

interface RegionResourceSummary {
  totalVehicles: number;
  availableVehicles: number;
  totalFirefighters: number;
  activeFirefighters: number;
}

class RegionService {
  // Create a new region
  async createRegion(data: CreateRegionDTO): Promise<IRegion> {
    try {
      // Check if region with same name exists
      const existingRegion = await Region.findOne({ name: data.name });
      if (existingRegion) {
        throw new AppError('Region with this name already exists', 400);
      }

      const region = await Region.create(data);
      return region;
    } catch (err: any) {
      throw new AppError(err.message || 'Error creating region', err.statusCode || 500);
    }
  }

  // Get region by ID
  async getRegionById(regionId: string): Promise<IRegion> {
    try {
      const region = await Region.findById(regionId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }
      return region;
    } catch (err: any) {
      throw new AppError(err.message || 'Error fetching region', err.statusCode || 500);
    }
  }

  // Update region
  async updateRegion(regionId: string, updateData: UpdateRegionDTO): Promise<IRegion> {
    try {
      const region = await Region.findByIdAndUpdate(
        regionId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!region) {
        throw new AppError('Region not found', 404);
      }

      return region;
    } catch (err: any) {
      throw new AppError(err.message || 'Error updating region', err.statusCode || 500);
    }
  }

  // Delete region
  async deleteRegion(regionId: string): Promise<void> {
    try {
      // Check if region has any associated resources
      const hasVehicles = await Vehicle.exists({ region: regionId });
      const hasUsers = await User.exists({ station: regionId });

      if (hasVehicles || hasUsers) {
        throw new AppError('Cannot delete region with associated resources', 400);
      }

      const region = await Region.findByIdAndDelete(regionId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }
    } catch (err: any) {
      throw new AppError(err.message || 'Error deleting region', err.statusCode || 500);
    }
  }

  // Get all regions
  async getAllRegions(): Promise<IRegion[]> {
    try {
      return await Region.find().sort({ name: 1 });
    } catch (err: any) {
      throw new AppError('Error fetching regions', 500);
    }
  }

  // Get region resource summary
  async getRegionResourceSummary(regionId: string): Promise<RegionResourceSummary> {
    try {
      const region = await Region.findById(regionId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }

      const [vehicles, firefighters] = await Promise.all([
        Vehicle.find({ region: regionId }),
        User.find({ station: regionId })
      ]);

      return {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'available').length,
        totalFirefighters: firefighters.length,
        activeFirefighters: firefighters.filter(f => f.isActive).length
      };
    } catch (err: any) {
      throw new AppError('Error fetching region resource summary', 500);
    }
  }

  // Check if point is within region
  async isPointInRegion(regionId: string, coordinates: [number, number]): Promise<boolean> {
    try {
      const region = await Region.findById(regionId);
      if (!region) {
        throw new AppError('Region not found', 404);
      }

      // Implementation of point-in-polygon algorithm would go here
      // For now, returning a placeholder
      return true;
    } catch (err: any) {
      throw new AppError('Error checking point in region', 500);
    }
  }

  // Get overlapping regions
  async getOverlappingRegions(coordinates: { number: number }[]): Promise<IRegion[]> {
    try {
      // In a real implementation, this would use spatial queries
      // For now, returning a simplified version
      return await Region.find();
    } catch (err: any) {
      throw new AppError('Error finding overlapping regions', 500);
    }
  }
}

export default new RegionService();
