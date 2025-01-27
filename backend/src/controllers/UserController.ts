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
}

export default new UserController();
