import { Types } from 'mongoose';
import Intervention, { IIntervention, InterventionStatus, InterventionType } from '../models/Intervention';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import AppError from '../utils/AppError';
import SocketService from './SocketService';

let socketService: SocketService;

export const initializeSocketService = (service: SocketService) => {
  socketService = service;
};

interface CreateInterventionDTO {
  title: string;
  type: InterventionType;
  location: {
    coordinates: [number, number];
  };
  region: string;  // Region ID
  startTime: Date;
  resources?: Array<{
    resourceId: string;
    resourceType: 'User' | 'Vehicle';
  }>;
}

interface UpdateInterventionDTO {
  status?: InterventionStatus;
  endTime?: Date;
  resources?: Array<{
    resourceId: string;
    resourceType: 'User' | 'Vehicle';
  }>;
}

class InterventionService {
  // Create a new intervention
  async createIntervention(data: CreateInterventionDTO): Promise<IIntervention> {
    try {
      const intervention: IIntervention = await Intervention.create({
        ...data,
        status: InterventionStatus.PENDING
      });

      // If resources are provided, assign them to the intervention
      if (data.resources && data.resources.length > 0) {
        await this.assignResourcesToIntervention(intervention._id.toString(), data.resources);
      }

      // Emit real-time update
      if (socketService) {
        socketService.emitInterventionCreated(intervention);
      }

      return intervention;
    } catch (error) {
      throw new AppError('Error creating intervention', 500);
    }
  }

  // Update intervention details
  async updateIntervention(
    interventionId: string,
    data: UpdateInterventionDTO
  ): Promise<IIntervention | null> {
    try {
      const intervention = await Intervention.findByIdAndUpdate(
        interventionId,
        { $set: data },
        { new: true }
      );

      if (!intervention) {
        throw new AppError('Intervention not found', 404);
      }

      // Emit real-time update
      if (socketService) {
        socketService.emitInterventionUpdated(intervention);
      }

      return intervention;
    } catch (error) {
      throw new AppError('Error updating intervention', 500);
    }
  }

  // Assign resources (Users or Vehicles) to an intervention
  private async assignResourcesToIntervention(
    interventionId: string,
    resources: Array<{ resourceId: string; resourceType: 'User' | 'Vehicle' }>
  ): Promise<void> {
    try {
      for (const resource of resources) {
        // Validate resource exists
        if (resource.resourceType === 'User') {
          const user = await User.findById(resource.resourceId);
          if (!user) throw new AppError(`User ${resource.resourceId} not found`, 404);
        } else {
          const vehicle = await Vehicle.findById(resource.resourceId);
          if (!vehicle) throw new AppError(`Vehicle ${resource.resourceId} not found`, 404);
        }
      }

      // Update intervention with new resources
      const intervention = await Intervention.findByIdAndUpdate(
        interventionId,
        { $set: { resources } },
        { new: true }
      );

      // Emit real-time update
      if (socketService && intervention) {
        socketService.emitResourcesAssigned(intervention);
      }
    } catch (error) {
      throw new AppError('Error assigning resources to intervention', 500);
    }
  }

  // Get intervention by ID with populated resources
  async getInterventionById(interventionId: string): Promise<IIntervention | null> {
    try {
      return await Intervention.findById(interventionId)
        .populate('resources.resourceId')
        .exec();
    } catch (error) {
      throw new AppError('Error fetching intervention', 500);
    }
  }

  // Get interventions for a specific user
  async getUserInterventions(userId: string): Promise<IIntervention[]> {
    try {
      return await Intervention.find({
        'resources': {
          $elemMatch: {
            resourceId: new Types.ObjectId(userId),
            resourceType: 'User'
          }
        }
      }).populate('resources.resourceId');
    } catch (error) {
      throw new AppError('Error fetching user interventions', 500);
    }
  }

  // Get active interventions in a region
  async getRegionActiveInterventions(regionId: string): Promise<IIntervention[]> {
    try {
      return await Intervention.find({
        status: { $in: [InterventionStatus.PENDING, InterventionStatus.IN_PROGRESS] }
      }).populate('resources.resourceId');
    } catch (error) {
      throw new AppError('Error fetching region interventions', 500);
    }
  }

  // Update intervention status
  async updateInterventionStatus(
    interventionId: string,
    status: InterventionStatus
  ): Promise<IIntervention | null> {
    try {
      const intervention = await Intervention.findByIdAndUpdate(
        interventionId,
        { $set: { status } },
        { new: true }
      );

      if (!intervention) {
        throw new AppError('Intervention not found', 404);
      }

      // Emit real-time update
      if (socketService) {
        socketService.emitInterventionStatusChanged(intervention);
      }

      return intervention;
    } catch (error) {
      throw new AppError('Error updating intervention status', 500);
    }
  }
}

export default new InterventionService();
