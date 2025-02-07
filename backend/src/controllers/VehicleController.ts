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
  // @desc    Get all vehicles with filters
  // @access  Private
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as VehicleStatus,
        type: req.query.type as VehicleType,
        station: req.query.station as string,
        isAvailable: req.query.isAvailable === 'true'
      };

      const vehicles = await VehicleService.getVehicles(filters);
      
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

  // @route   PATCH /api/vehicles/:id/status
  // @desc    Update vehicle status
  // @access  Private - Team Leader and above
  async updateVehicleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!Object.values(VehicleStatus).includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const vehicle = await VehicleService.updateVehicleStatus(
        req.params.id,
        status,
        req.user?._id
      );
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/vehicles/:id/crew
  // @desc    Assign crew to vehicle
  // @access  Private - Team Leader and above
  async assignCrew(req: Request, res: Response, next: NextFunction) {
    try {
      const { crewMembers } = req.body;
      const vehicle = await VehicleService.assignCrew(
        req.params.id,
        crewMembers
      );
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   DELETE /api/vehicles/:id/crew/:userId
  // @desc    Remove crew member from vehicle
  // @access  Private - Team Leader and above
  async removeCrewMember(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.removeCrewMember(
        req.params.id,
        req.params.userId
      );
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/vehicles/:id/maintenance
  // @desc    Report vehicle maintenance issue
  // @access  Private
  async reportMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { issue, severity } = req.body;
      const vehicle = await VehicleService.reportMaintenance(
        req.params.id,
        {
          issue,
          severity,
          reportedBy: req.user?._id
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: { vehicle }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/vehicles/:id/maintenance/:maintenanceId
  // @desc    Update maintenance status
  // @access  Private - Officer and above
  async updateMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, resolution } = req.body;
      const vehicle = await VehicleService.updateMaintenanceStatus(
        req.params.id,
        req.params.maintenanceId,
        status,
        resolution,
        req.user?._id
      );
      
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
      const vehicle = await VehicleService.updateLocation(
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

  // @route   GET /api/vehicles/station/:stationId/available
  // @desc    Get available vehicles in a station
  // @access  Private
  async getAvailableVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await VehicleService.getAvailableVehicles(req.params.stationId);
      
      res.status(200).json({
        status: 'success',
        data: { vehicles }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/vehicles/stats
  // @desc    Get vehicle statistics
  // @access  Private - Officer and above
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await VehicleService.getVehicleStats(
        req.query.station as string
      );
      
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new VehicleController();
