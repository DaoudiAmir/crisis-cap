import { Request, Response, NextFunction } from 'express';
import { VehicleStatus, VehicleType } from '../models/Vehicle';
import VehicleService from '../services/VehicleService';
import AppError from '../utils/AppError';

class VehicleController {
  // @route   POST /api/vehicles
  // @desc    Create a new vehicle
  // @access  Private - Officer and above
  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      
      res.status(201).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/vehicles
  // @desc    Get vehicles with filters
  // @access  Private
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      let vehicles;
      
      if (req.query.status) {
        vehicles = await VehicleService.getVehiclesByStatus(req.query.status as VehicleStatus);
      } else if (req.query.type) {
        vehicles = await VehicleService.getVehiclesByType(req.query.type as VehicleType);
      } else if (req.query.region) {
        if (req.query.available === 'true') {
          vehicles = await VehicleService.getAvailableVehiclesByRegion(req.query.region as string);
        } else {
          vehicles = await VehicleService.getVehiclesByRegion(req.query.region as string);
        }
      } else {
        // Default to getting vehicles by status AVAILABLE if no filters
        vehicles = await VehicleService.getVehiclesByStatus(VehicleStatus.AVAILABLE);
      }
      
      res.status(200).json({
        status: 'success',
        data: { vehicles }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/vehicles/:id
  // @desc    Get vehicle by ID
  // @access  Private
  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/vehicles/:id
  // @desc    Update vehicle
  // @access  Private - Officer and above
  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.updateVehicle(req.params.id, req.body);
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/vehicles/:id/location
  // @desc    Update vehicle location
  // @access  Private
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { coordinates } = req.body;
      const vehicle = await VehicleService.updateVehicleLocation(
        req.params.id,
        coordinates
      );
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/vehicles/:id/maintenance
  // @desc    Set vehicle to maintenance status
  // @access  Private - Officer and above
  async setMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.setVehicleMaintenance(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/vehicles/:id/history
  // @desc    Get vehicle intervention history
  // @access  Private
  async getInterventionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await VehicleService.getVehicleInterventionHistory(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { history }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new VehicleController();
