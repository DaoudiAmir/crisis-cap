import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Team, { TeamStatus, TeamType } from '../models/Team';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import SocketService from '../services/SocketService';
import TeamService from '../services/TeamService';

class TeamController {
  /**
   * Get all teams
   * @route GET /api/v1/teams
   */
  public getAllTeams = catchAsync(async (req: Request, res: Response) => {
    const teams = await Team.find()
      .populate('members.userId', 'name role')
      .populate('currentVehicle', 'name type')
      .populate('currentIntervention', 'type status');

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams }
    });
  });

  /**
   * Get a single team
   * @route GET /api/v1/teams/:id
   */
  public getTeam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id)
      .populate('members.userId', 'name role specializations')
      .populate('currentVehicle', 'name type status')
      .populate('currentIntervention', 'type status location');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Create a new team
   * @route POST /api/v1/teams
   */
  public createTeam = catchAsync(async (req: Request, res: Response) => {
    const team = await Team.create(req.body);
    
    // Notify clients about new team
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamCreated(team);

    res.status(201).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Update a team
   * @route PUT /api/v1/teams/:id
   */
  public updateTeam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('members.userId', 'name role')
    .populate('currentVehicle', 'name type');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about team update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamUpdated(team);

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Delete a team
   * @route DELETE /api/v1/teams/:id
   */
  public deleteTeam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about team deletion
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamDeleted(team._id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Get team schedule
   * @route GET /api/v1/teams/:id/schedule
   */
  public getTeamSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id).select('schedule');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { schedule: team.schedule }
    });
  });

  /**
   * Update team schedule
   * @route PUT /api/v1/teams/:id/schedule
   */
  public updateTeamSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { schedule: req.body },
      { new: true, runValidators: true }
    );

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about schedule update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamScheduleUpdated(team);

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Get team members
   * @route GET /api/v1/teams/:id/members
   */
  public getTeamMembers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id)
      .populate('members.userId', 'name role specializations isAvailable');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { members: team.members }
    });
  });

  /**
   * Add team member
   * @route POST /api/v1/teams/:id/members
   */
  public addTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role, specializations } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          members: {
            userId,
            role,
            specializations,
            joinedAt: new Date(),
            isLeader: false
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('members.userId', 'name role');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about member addition
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamMemberAdded({ teamId: team._id, member: team.members[team.members.length - 1] });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Remove team member
   * @route DELETE /api/v1/teams/:id/members/:userId
   */
  public removeTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          members: { userId: req.params.userId }
        }
      },
      { new: true }
    );

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about member removal
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamMemberRemoved({ teamId: team._id, userId: req.params.userId });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Update team status
   * @route PATCH /api/v1/teams/:id/status
   */
  public updateTeamStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    
    if (!Object.values(TeamStatus).includes(status)) {
      return next(new AppError('Invalid team status', 400));
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { status, lastStatusUpdate: new Date() },
      { new: true, runValidators: true }
    );

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Notify clients about status update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamStatusChanged(team);

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Get available teams
   * @route GET /api/v1/teams/available/:interventionType
   */
  public getAvailableTeams = catchAsync(async (req: Request, res: Response) => {
    const { interventionType } = req.params;
    const requiredTeamType = this.mapInterventionToTeamType(interventionType);

    const teams = await Team.find({
      type: requiredTeamType,
      status: { $in: [TeamStatus.ACTIVE, TeamStatus.ON_BREAK] },
      isActive: true,
      currentIntervention: { $exists: false }
    })
    .populate('members.userId', 'name role isAvailable')
    .populate('currentVehicle', 'name type status');

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams }
    });
  });

  /**
   * Assign vehicle to team
   * @route POST /api/v1/teams/:id/vehicle
   */
  public assignVehicle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.body;

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findOne({ _id: vehicleId, status: 'available' });
    if (!vehicle) {
      return next(new AppError('Vehicle not found or not available', 404));
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { currentVehicle: vehicleId },
      { new: true }
    ).populate('currentVehicle', 'name type');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'assigned' });

    // Notify clients about vehicle assignment
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamVehicleAssigned({ teamId: team._id, vehicle });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Assign intervention to team
   * @route POST /api/v1/teams/:id/intervention
   */
  public assignIntervention = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { interventionId } = req.body;

      const team = await TeamService.assignIntervention(id, interventionId);
      
      res.status(200).json({
        status: 'success',
        data: { team }
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * Remove intervention from team
   * @route DELETE /api/v1/teams/:id/intervention/:interventionId
   */
  public removeIntervention = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, interventionId } = req.params;

      const team = await TeamService.removeIntervention(id, interventionId);
      
      res.status(200).json({
        status: 'success',
        data: { team }
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * Add note to team
   * @route POST /api/v1/teams/:id/notes
   */
  public addTeamNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const createdBy = req.user?._id;

      const team = await TeamService.addNote(id, { content, createdBy });
      
      res.status(200).json({
        status: 'success',
        data: { team }
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * Get team notes
   * @route GET /api/v1/teams/:id/notes
   */
  public getTeamNotes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const notes = await TeamService.getNotes(id);
      
      res.status(200).json({
        status: 'success',
        data: { notes }
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * Get team status
   * @route GET /api/v1/teams/:id/current-status
   */
  public getTeamStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id)
      .select('status lastStatusUpdate currentLocation')
      .populate('currentIntervention', 'type status location');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        status: team.status,
        lastStatusUpdate: team.lastStatusUpdate,
        currentLocation: team.currentLocation,
        currentIntervention: team.currentIntervention
      }
    });
  });

  /**
   * Get team history
   * @route GET /api/v1/teams/:id/history
   */
  public getTeamHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id)
      .select('interventionHistory statusHistory')
      .populate('interventionHistory', 'type status startTime endTime location')
      .populate('statusHistory', 'status timestamp reason');

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        interventionHistory: team.interventionHistory,
        statusHistory: team.statusHistory
      }
    });
  });

  /**
   * Get teams by station
   * @route GET /api/v1/teams/station/:stationId
   */
  public getTeamsByStation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { stationId } = req.params;

    const teams = await Team.find({ station: stationId })
      .populate('members.userId', 'name role')
      .populate('currentVehicle', 'name type status')
      .populate('currentIntervention', 'type status location');

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams }
    });
  });

  /**
   * Update team member role
   * @route PATCH /api/v1/teams/:id/members/:userId/role
   */
  public updateMemberRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id, userId } = req.params;
    const { role } = req.body;

    const team = await Team.findOneAndUpdate(
      { 
        _id: id,
        'members.userId': userId
      },
      {
        $set: { 'members.$.role': role }
      },
      { new: true }
    ).populate('members.userId', 'name role');

    if (!team) {
      return next(new AppError('Team or member not found', 404));
    }

    // Notify clients about role update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamMemberRoleUpdated({ teamId: team._id, userId, role });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Set team leader
   * @route PATCH /api/v1/teams/:id/members/:userId/leader
   */
  public setTeamLeader = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Reset all members' isLeader to false
    team.members.forEach(member => {
      member.isLeader = false;
    });

    // Set new leader
    const memberIndex = team.members.findIndex(member => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return next(new AppError('Member not found in team', 404));
    }

    team.members[memberIndex].isLeader = true;
    await team.save();

    // Notify clients about leader update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamLeaderUpdated({ teamId: team._id, leaderId: userId });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  /**
   * Remove vehicle from team
   * @route DELETE /api/v1/teams/:id/vehicle
   */
  public removeVehicle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    const vehicleId = team.currentVehicle;
    if (!vehicleId) {
      return next(new AppError('Team has no assigned vehicle', 400));
    }

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'available' });

    // Remove vehicle from team
    team.currentVehicle = undefined;
    await team.save();

    // Notify clients about vehicle removal
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitTeamVehicleRemoved({ teamId: team._id, vehicleId });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  });

  private mapInterventionToTeamType(interventionType: string): TeamType {
    const typeMap: { [key: string]: TeamType } = {
      'FIRE': TeamType.FIREFIGHTING,
      'RESCUE': TeamType.RESCUE,
      'MEDICAL': TeamType.MEDICAL,
      'HAZMAT': TeamType.HAZMAT,
      'DEFAULT': TeamType.GENERAL
    };

    return typeMap[interventionType.toUpperCase()] || TeamType.GENERAL;
  }
}

export default new TeamController();
