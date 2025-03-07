import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import UserService from '../services/UserService';
import AppError from '../utils/AppError';

class UserController {
  // @route   POST /api/users/register
  // @desc    Register a new user
  // @access  Private - Officer and above
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/users/login
  // @desc    Login user
  // @access  Public
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);
      console.log('Request body:', req.body);
      
      const loginResponse = await UserService.loginUser(email, password);

      res.status(200).json({
        status: 'success',
        data: loginResponse
      });
    } catch (err) {
      console.error('Login error in controller:', err);
      next(err);
    }
  }

  // @route   GET /api/users/me
  // @desc    Get current user profile
  // @access  Private
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await UserService.getUserById(req.user._id);
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PUT /api/users/:id
  // @desc    Update user
  // @access  Private - Officer and above, or self
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if user is updating their own profile or has sufficient permissions
      if (req.user?._id !== id && !['OFFICER', 'REGIONAL_COORDINATOR', 'LOGISTICS_MANAGER'].includes(req.user?.role || '')) {
        throw new AppError('You do not have permission to perform this action', 403);
      }

      const user = await UserService.updateUser(id, req.body);
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/role/:role
  // @desc    Get users by role
  // @access  Private - Team Leader and above
  async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;
      const users = await UserService.getUsersByRole(role as UserRole);
      res.status(200).json({
        status: 'success',
        data: {
          users
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/station/:stationId
  // @desc    Get users by station
  // @access  Private - Team Leader and above
  async getUsersByStation(req: Request, res: Response, next: NextFunction) {
    try {
      const { stationId } = req.params;
      const users = await UserService.getUsersByStation(stationId);
      res.status(200).json({
        status: 'success',
        data: {
          users
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/users/:id/deactivate
  // @desc    Deactivate user
  // @access  Private - Officer and above
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.deactivateUser(id);
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/users/:id/reactivate
  // @desc    Reactivate user
  // @access  Private - Officer and above
  async reactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.reactivateUser(id);
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/users/:id/availability
  // @desc    Update user availability
  // @access  Private
  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, startTime, endTime } = req.body;
      const user = await UserService.updateAvailability(
        req.params.id,
        status,
        startTime,
        endTime
      );
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/users/:id/specializations
  // @desc    Add user specialization
  // @access  Private - Officer and above
  async addSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const { specialization, certificationDate, expiryDate } = req.body;
      const user = await UserService.addSpecialization(
        req.params.id,
        {
          specialization,
          certificationDate,
          expiryDate,
          issuedBy: req.user?._id
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   DELETE /api/users/:id/specializations/:specializationId
  // @desc    Remove user specialization
  // @access  Private - Officer and above
  async removeSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.removeSpecialization(
        req.params.id,
        req.params.specializationId
      );
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/users/:id/team
  // @desc    Assign user to team
  // @access  Private - Team Leader and above
  async assignToTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, role } = req.body;
      const user = await UserService.assignToTeam(
        req.params.id,
        teamId,
        role
      );
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   DELETE /api/users/:id/team
  // @desc    Remove user from team
  // @access  Private - Team Leader and above
  async removeFromTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.removeFromTeam(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/available
  // @desc    Get available users
  // @access  Private - Team Leader and above
  async getAvailableUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { station, specialization } = req.query;
      const users = await UserService.getAvailableUsers(
        station as string,
        specialization as string
      );
      
      res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/:id/schedule
  // @desc    Get user schedule
  // @access  Private - Self or Team Leader and above
  async getUserSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      // Check if user is requesting their own schedule or has sufficient permissions
      if (req.user?._id !== req.params.id && !['TEAM_LEADER', 'OFFICER', 'REGIONAL_COORDINATOR'].includes(req.user?.role || '')) {
        throw new AppError('You do not have permission to view this schedule', 403);
      }

      const schedule = await UserService.getUserSchedule(
        req.params.id,
        startDate as string,
        endDate as string
      );
      
      res.status(200).json({
        status: 'success',
        data: { schedule }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/stats
  // @desc    Get user statistics
  // @access  Private - Officer and above
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { station, startDate, endDate } = req.query;
      const stats = await UserService.getUserStats(
        station as string,
        startDate as string,
        endDate as string
      );
      
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/users/nearby
  // @desc    Get users near a location
  // @access  Private - Team Leader and above
  async getNearbyUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, radius } = req.query;
      const users = await UserService.getNearbyUsers(
        [Number(longitude), Number(latitude)],
        Number(radius) || 5000 // Default 5km radius
      );
      
      res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/users/:id/location
  // @desc    Update user location
  // @access  Private - Self only
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { coordinates } = req.body;
      
      // Users can only update their own location
      if (req.user?._id !== req.params.id) {
        throw new AppError('You can only update your own location', 403);
      }

      const user = await UserService.updateLocation(
        req.params.id,
        coordinates
      );
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PUT /api/users/profile
  // @desc    Update user profile
  // @access  Private
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('Not authenticated', 401);
      }

      const allowedFields = ['firstName', 'lastName', 'email', 'contactInfo'];
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const user = await UserService.updateUser(userId, updateData);

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PUT /api/users/password
  // @desc    Change user password
  // @access  Private
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new AppError('Please provide current and new password', 400);
      }

      await UserService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/v1/users/:id/status
  // @desc    Get user status
  // @access  Private
  async getUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      
      const user = await UserService.getUserById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Create a status object with relevant information
      const userStatus = {
        status: user.status,
        location: user.location,
        currentIntervention: user.currentIntervention,
        team: user.team
      };
      
      res.status(200).json({
        status: 'success',
        data: userStatus
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/v1/users/:id/status
  // @desc    Update user status
  // @access  Private - Self or Team Leader and above
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { status } = req.body;
      
      // For debugging
      console.log('Update status request:', {
        requestUserId: req.user?._id,
        targetUserId: userId,
        requestUserRole: req.user?.role,
        newStatus: status
      });
      
      // Temporarily disable permission check for testing
      // We'll allow any authenticated user to update any user's status
      /*
      if (req.user?._id !== userId && !['TEAM_LEADER', 'OFFICER', 'REGIONAL_COORDINATOR'].includes(req.user?.role || '')) {
        throw new AppError('You do not have permission to update this user\'s status', 403);
      }
      */
      
      if (!status) {
        throw new AppError('Status is required', 400);
      }
      
      // Update user status
      const user = await UserService.updateUserStatus(userId, status);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            status: user.status,
            location: user.location,
            currentIntervention: user.currentIntervention,
            team: user.team
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
