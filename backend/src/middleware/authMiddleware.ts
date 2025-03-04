import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import AppError from '../utils/AppError';
import User from '../models/User';

// Declare global augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;
    
    // 1) Check if token exists in Authorization header or cookies
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      // Get token from Authorization header
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt && req.cookies.jwt !== 'logged-out') {
      // Get token from cookie
      token = req.cookies.jwt;
    }
    
    if (!token) {
      console.log('No token found in request');
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    // 2) Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string; role: UserRole };
      
      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }
      
      // 4) Set user in request
      req.user = currentUser;
      
      next();
    } catch (jwtError: any) {
      console.log('JWT verification error:', jwtError.name, jwtError.message);
      if (jwtError.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      } else if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Token expired. Please log in again.', 401));
      } else {
        return next(jwtError);
      }
    }
  } catch (err: any) {
    console.error('Authentication error:', err);
    return next(err);
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
