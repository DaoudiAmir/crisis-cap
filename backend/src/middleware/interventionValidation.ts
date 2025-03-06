import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { InterventionPriority, InterventionType } from '../models/Intervention';

/**
 * Middleware to validate and sanitize intervention data before creation
 * Provides helpful error messages and defaults for missing fields
 */
export const validateInterventionData = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const errors: string[] = [];
    const defaultObjectId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    
    // Validate and sanitize required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push('Title is required');
      data.title = 'Untitled Intervention';
    }
    
    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push('Description is required');
      data.description = 'No description provided';
    }
    
    // Validate and sanitize type
    if (!data.type || !Object.values(InterventionType).includes(data.type as InterventionType)) {
      errors.push(`Type must be one of: ${Object.values(InterventionType).join(', ')}`);
      data.type = InterventionType.FIRE;
    }
    
    // Validate and sanitize priority
    if (!data.priority || !Object.values(InterventionPriority).includes(data.priority as InterventionPriority)) {
      errors.push(`Priority must be one of: ${Object.values(InterventionPriority).join(', ')}`);
      data.priority = InterventionPriority.MEDIUM;
    }
    
    // Validate and sanitize location
    if (!data.location) {
      errors.push('Location is required');
      data.location = {
        type: 'Point',
        coordinates: [1.888334, 46.603354], // Default to center of France
        address: 'Address not provided'
      };
    } else {
      // Ensure location has type 'Point'
      data.location.type = 'Point';
      
      // Validate coordinates
      if (!data.location.coordinates || 
          !Array.isArray(data.location.coordinates) || 
          data.location.coordinates.length !== 2 ||
          typeof data.location.coordinates[0] !== 'number' || 
          typeof data.location.coordinates[1] !== 'number' ||
          isNaN(data.location.coordinates[0]) || 
          isNaN(data.location.coordinates[1])) {
        
        errors.push('Location coordinates must be an array of two numbers [longitude, latitude]');
        
        // Try to extract coordinates from other properties if available
        if (data.location.latitude !== undefined && data.location.longitude !== undefined &&
            !isNaN(Number(data.location.latitude)) && !isNaN(Number(data.location.longitude))) {
          
          data.location.coordinates = [Number(data.location.longitude), Number(data.location.latitude)];
        } else {
          // Default to center of France
          data.location.coordinates = [1.888334, 46.603354];
        }
      }
      
      // Ensure address exists
      if (!data.location.address || typeof data.location.address !== 'string' || data.location.address.trim() === '') {
        data.location.address = 'Address not provided';
      }
    }
    
    // Validate and sanitize region
    if (!data.region) {
      errors.push('Region is required');
      data.region = defaultObjectId;
    } else if (typeof data.region === 'string' && !mongoose.Types.ObjectId.isValid(data.region)) {
      errors.push('Region must be a valid MongoDB ObjectId');
      data.region = defaultObjectId;
    }
    
    // Validate and sanitize station
    if (!data.station) {
      errors.push('Station is required');
      data.station = defaultObjectId;
    } else if (typeof data.station === 'string' && !mongoose.Types.ObjectId.isValid(data.station)) {
      errors.push('Station must be a valid MongoDB ObjectId');
      data.station = defaultObjectId;
    }
    
    // Validate and sanitize commander
    if (!data.commander) {
      errors.push('Commander is required');
      data.commander = defaultObjectId;
    } else if (typeof data.commander === 'string' && !mongoose.Types.ObjectId.isValid(data.commander)) {
      errors.push('Commander must be a valid MongoDB ObjectId');
      data.commander = defaultObjectId;
    }
    
    // Validate and sanitize startTime
    if (!data.startTime) {
      errors.push('Start time is required');
      data.startTime = new Date();
    } else {
      try {
        data.startTime = new Date(data.startTime);
        if (isNaN(data.startTime.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        errors.push('Start time must be a valid date');
        data.startTime = new Date();
      }
    }
    
    // Generate a code if not provided
    if (!data.code) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      data.code = `INT-${year}${month}${day}-${random}`;
    }
    
    // Set default values for optional fields
    data.status = data.status || 'pending';
    data.riskLevel = data.riskLevel || 'medium';
    data.hazards = data.hazards || [];
    data.teams = data.teams || [];
    data.resources = data.resources || [];
    data.weatherConditions = data.weatherConditions || {
      temperature: 20,
      windSpeed: 10,
      windDirection: 'N',
      precipitation: 'none',
      visibility: 'good'
    };
    
    // Set createdBy if not provided
    if (!data.createdBy && req.user?._id) {
      data.createdBy = req.user._id;
    } else if (!data.createdBy) {
      data.createdBy = defaultObjectId;
    }
    
    // If there are validation errors but we've provided defaults,
    // log the errors but continue with the request
    if (errors.length > 0) {
      console.warn('Intervention validation warnings:', errors);
      req.validationWarnings = errors;
    }
    
    // Update the request body with sanitized data
    req.body = data;
    
    next();
  } catch (error) {
    console.error('Error in intervention validation middleware:', error);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid intervention data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
