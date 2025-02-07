import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Team, { TeamStatus, TeamType } from '../models/Team';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import SocketService from '../services/SocketService';

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

  private mapInterventionToTeamType(interventionType: string): TeamType {
    const mapping: { [key: string]: TeamType } = {
      'fire': TeamType.FIRE_FIGHTING,
      'rescue': TeamType.RESCUE,
      'medical': TeamType.MEDICAL,
      'hazmat': TeamType.HAZMAT,
      'special': TeamType.SPECIAL_OPS
    };

    return mapping[interventionType] || TeamType.FIRE_FIGHTING;
  }
}

export default new TeamController();
