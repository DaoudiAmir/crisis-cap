import { Types } from 'mongoose';
import Equipment, { IEquipment } from '../models/Equipment';
import Station from '../models/Station';
import Team from '../models/Team';
import AppError from '../utils/AppError';
import { ServiceResult } from './StationService';

class EquipmentService {
  /**
   * Create new equipment
   */
  async createEquipment(equipmentData: Partial<IEquipment>): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.create(equipmentData);
      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create equipment'
      };
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(equipmentId: string, updateData: Partial<IEquipment>): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.findByIdAndUpdate(equipmentId, updateData, {
        new: true,
        runValidators: true
      });

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update equipment'
      };
    }
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(equipmentId: string): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.findByIdAndDelete(equipmentId);

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      // Remove equipment reference from station if assigned
      if (equipment.stationId) {
        await Station.findByIdAndUpdate(equipment.stationId, {
          $pull: { equipment: equipment._id }
        });
      }

      // Remove equipment reference from team if assigned
      if (equipment.assignedTeam) {
        await Team.findByIdAndUpdate(equipment.assignedTeam, {
          $pull: { equipment: equipment._id }
        });
      }

      return {
        success: true,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete equipment'
      };
    }
  }

  /**
   * Assign equipment to a station
   */
  async assignToStation(equipmentId: string, stationId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(equipmentId) || !Types.ObjectId.isValid(stationId)) {
        return {
          success: false,
          message: 'Invalid equipment or station ID'
        };
      }

      const [equipment, station] = await Promise.all([
        Equipment.findById(equipmentId),
        Station.findById(stationId)
      ]);

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      if (!station) {
        return {
          success: false,
          message: 'Station not found'
        };
      }

      if (equipment.stationId) {
        return {
          success: false,
          message: 'Equipment is already assigned to a station'
        };
      }

      equipment.stationId = new Types.ObjectId(stationId);
      station.equipment.push(new Types.ObjectId(equipmentId));

      await Promise.all([equipment.save(), station.save()]);

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign equipment to station'
      };
    }
  }

  /**
   * Unassign equipment from a station
   */
  async unassignFromStation(equipmentId: string): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.findById(equipmentId);

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      if (!equipment.stationId) {
        return {
          success: false,
          message: 'Equipment is not assigned to any station'
        };
      }

      const station = await Station.findById(equipment.stationId);
      if (station) {
        station.equipment = station.equipment.filter(id => id.toString() !== equipmentId);
        await station.save();
      }

      equipment.stationId = undefined;
      await equipment.save();

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unassign equipment from station'
      };
    }
  }

  /**
   * Get equipment maintenance history
   */
  async getMaintenanceHistory(equipmentId: string) {
    const equipment = await Equipment.findById(equipmentId)
      .select('maintenanceHistory')
      .populate('maintenanceHistory');

    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    return equipment.maintenanceHistory;
  }

  /**
   * Add maintenance record
   */
  async addMaintenanceRecord(equipmentId: string, record: any): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.findById(equipmentId);

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      equipment.maintenanceHistory.push(record);
      await equipment.save();

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add maintenance record'
      };
    }
  }

  /**
   * Update equipment status
   */
  async updateStatus(equipmentId: string, status: string): Promise<ServiceResult> {
    try {
      const equipment = await Equipment.findById(equipmentId);

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      equipment.status = status;
      await equipment.save();

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update equipment status'
      };
    }
  }
}

export default new EquipmentService();
