import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import AppError from '../utils/AppError';

// Declare global augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: UserRole;
        isActive: boolean;
        firstName: string;
        lastName: string;
        email: string;
        badgeNumber: string;
        station: string;
        department: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Check if token exists
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2) Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret is not configured', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      _id: string;
      role: UserRole;
      isActive: boolean;
      firstName: string;
      lastName: string;
      email: string;
      badgeNumber: string;
      station: string;
      department: string;
    };
    
    req.user = decoded;

    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (err.name === 'TokenExpiredError') {
      next(new AppError('Token expired. Please log in again.', 401));
    } else {
      next(err);
    }
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
