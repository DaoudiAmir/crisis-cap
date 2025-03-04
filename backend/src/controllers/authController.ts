import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserRole, UserStatus } from '../models/User';
import AppError from '../utils/AppError';
import mongoose from 'mongoose';
import { catchAsync } from '../utils/catchAsync';

// Map frontend role values to backend enum values
const mapRoleToEnum = (frontendRole: string): UserRole => {
  switch (frontendRole) {
    case 'FIREFIGHTER':
      return UserRole.FIREFIGHTER;
    case 'TEAM_LEADER':
      return UserRole.TEAM_LEADER;
    case 'OFFICER':
      return UserRole.OFFICER;
    case 'REGIONAL_COORDINATOR':
      return UserRole.REGIONAL_COORDINATOR;
    case 'LOGISTICS_MANAGER':
      return UserRole.LOGISTICS_MANAGER;
    default:
      return UserRole.FIREFIGHTER; // Default role
  }
};

const signToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(
    { 
      id,
      role
    }, 
    secret, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    }
  );
};

const createSendToken = (user: any, statusCode: number, req: Request, res: Response) => {
  const token = signToken(user._id, user.role);
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const
  };
  
  // Set cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      badgeNumber,
      department,
      station,
      role = 'FIREFIGHTER',
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Map the frontend role to the backend enum value
    const mappedRole = mapRoleToEnum(role);

    // Create a default region ObjectId
    const defaultRegionId = new mongoose.Types.ObjectId();
    
    // Create default location
    const defaultLocation = {
      type: 'Point',
      coordinates: [0, 0], // Default coordinates
      lastUpdated: new Date()
    };
    
    // Create default contact info
    const defaultContactInfo = {
      phone: '0000000000', // Default phone
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Relation',
        phone: '0000000000'
      }
    };

    // Create new user with default values for required fields
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: mappedRole,
      status: UserStatus.AVAILABLE,
      badgeNumber,
      department: department || 'Default Department',
      station: station || new mongoose.Types.ObjectId(), // Default station ID
      region: defaultRegionId,
      location: defaultLocation,
      contactInfo: defaultContactInfo,
      specializations: [],
      certifications: [],
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    next(error);
  }
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
});

export const logout = (req: Request, res: Response) => {
  // Clear the JWT cookie by setting it to 'logged-out' and expiring it
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const
  });
  
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('There is no user with this email address', 404);
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'reset-secret-key',
      { expiresIn: '1h' }
    );

    // TODO: Send reset token via email
    
    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to email',
    });
  } catch (error) {
    next(error);
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET || 'reset-secret-key'
    ) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Update password
    user.password = password;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id).select('+password');

    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new AppError('Your current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});
