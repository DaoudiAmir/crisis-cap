import { Types } from 'mongoose';
import Team, { ITeam } from '../models/Team';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Equipment from '../models/Equipment';
import AppError from '../utils/AppError';
import { ServiceResult } from './StationService';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(teamData: Partial<ITeam>): Promise<ServiceResult> {
    try {
      const team = await Team.create(teamData);
      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create team'
      };
    }
  }

  /**
   * Update a team
   */
  async updateTeam(teamId: string, updateData: Partial<ITeam>): Promise<ServiceResult> {
    try {
      const team = await Team.findByIdAndUpdate(teamId, updateData, {
        new: true,
        runValidators: true
      });

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update team'
      };
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(teamId: string): Promise<ServiceResult> {
    try {
      const team = await Team.findByIdAndDelete(teamId);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      return {
        success: true,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete team'
      };
    }
  }

  /**
   * Add a member to a team
   */
  async addMember(teamId: string, userId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: 'Invalid team or user ID'
        };
      }

      const [team, user] = await Promise.all([
        Team.findById(teamId),
        User.findById(userId)
      ]);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (team.members.includes(new Types.ObjectId(userId))) {
        return {
          success: false,
          message: 'User is already a member of this team'
        };
      }

      team.members.push(new Types.ObjectId(userId));
      await team.save();

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add team member'
      };
    }
  }

  /**
   * Remove a member from a team
   */
  async removeMember(teamId: string, userId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: 'Invalid team or user ID'
        };
      }

      const team = await Team.findById(teamId);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      const memberIndex = team.members.findIndex(id => id.toString() === userId);
      if (memberIndex === -1) {
        return {
          success: false,
          message: 'User is not a member of this team'
        };
      }

      team.members.splice(memberIndex, 1);
      await team.save();

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove team member'
      };
    }
  }

  /**
   * Assign a vehicle to a team
   */
  async assignVehicle(teamId: string, vehicleId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(vehicleId)) {
        return {
          success: false,
          message: 'Invalid team or vehicle ID'
        };
      }

      const [team, vehicle] = await Promise.all([
        Team.findById(teamId),
        Vehicle.findById(vehicleId)
      ]);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      if (vehicle.assignedTeam) {
        return {
          success: false,
          message: 'Vehicle is already assigned to another team'
        };
      }

      team.vehicles.push(new Types.ObjectId(vehicleId));
      vehicle.assignedTeam = new Types.ObjectId(teamId);
      
      await Promise.all([team.save(), vehicle.save()]);

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign vehicle'
      };
    }
  }

  /**
   * Unassign a vehicle from a team
   */
  async unassignVehicle(teamId: string, vehicleId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(vehicleId)) {
        return {
          success: false,
          message: 'Invalid team or vehicle ID'
        };
      }

      const [team, vehicle] = await Promise.all([
        Team.findById(teamId),
        Vehicle.findById(vehicleId)
      ]);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      const vehicleIndex = team.vehicles.findIndex(id => id.toString() === vehicleId);
      if (vehicleIndex === -1) {
        return {
          success: false,
          message: 'Vehicle is not assigned to this team'
        };
      }

      team.vehicles.splice(vehicleIndex, 1);
      vehicle.assignedTeam = undefined;
      
      await Promise.all([team.save(), vehicle.save()]);

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unassign vehicle'
      };
    }
  }

  /**
   * Assign equipment to a team
   */
  async assignEquipment(teamId: string, equipmentId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(equipmentId)) {
        return {
          success: false,
          message: 'Invalid team or equipment ID'
        };
      }

      const [team, equipment] = await Promise.all([
        Team.findById(teamId),
        Equipment.findById(equipmentId)
      ]);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      if (equipment.assignedTeam) {
        return {
          success: false,
          message: 'Equipment is already assigned to another team'
        };
      }

      team.equipment.push(new Types.ObjectId(equipmentId));
      equipment.assignedTeam = new Types.ObjectId(teamId);
      
      await Promise.all([team.save(), equipment.save()]);

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign equipment'
      };
    }
  }

  /**
   * Unassign equipment from a team
   */
  async unassignEquipment(teamId: string, equipmentId: string): Promise<ServiceResult> {
    try {
      if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(equipmentId)) {
        return {
          success: false,
          message: 'Invalid team or equipment ID'
        };
      }

      const [team, equipment] = await Promise.all([
        Team.findById(teamId),
        Equipment.findById(equipmentId)
      ]);

      if (!team) {
        return {
          success: false,
          message: 'Team not found'
        };
      }

      if (!equipment) {
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      const equipmentIndex = team.equipment.findIndex(id => id.toString() === equipmentId);
      if (equipmentIndex === -1) {
        return {
          success: false,
          message: 'Equipment is not assigned to this team'
        };
      }

      team.equipment.splice(equipmentIndex, 1);
      equipment.assignedTeam = undefined;
      
      await Promise.all([team.save(), equipment.save()]);

      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unassign equipment'
      };
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStatistics(teamId: string) {
    const team = await Team.findById(teamId)
      .populate('members')
      .populate('vehicles')
      .populate('equipment');

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    return {
      memberCount: team.members.length,
      vehicleCount: team.vehicles.length,
      equipmentCount: team.equipment.length,
      status: team.status,
      currentMission: team.currentMission
    };
  }
}

export default new TeamService();
