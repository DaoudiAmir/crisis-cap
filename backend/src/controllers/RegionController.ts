import { Request, Response, NextFunction } from 'express';
import RegionService from '../services/RegionService';
import AppError from '../utils/AppError';

class RegionController {
  // @route   POST /api/regions
  // @desc    Create a new region
  // @access  Private - Regional Coordinator only
  async createRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const region = await RegionService.createRegion(req.body);
      
      res.status(201).json({
        status: 'success',
        data: { region }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/regions
  // @desc    Get all regions
  // @access  Private
  async getAllRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const regions = await RegionService.getAllRegions();
      
      res.status(200).json({
        status: 'success',
        data: { regions }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/regions/:id
  // @desc    Get region by ID
  // @access  Private
  async getRegionById(req: Request, res: Response, next: NextFunction) {
    try {
      const region = await RegionService.getRegionById(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { region }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/regions/:id
  // @desc    Update region
  // @access  Private - Regional Coordinator only
  async updateRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const region = await RegionService.updateRegion(req.params.id, req.body);
      
      res.status(200).json({
        status: 'success',
        data: { region }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   DELETE /api/regions/:id
  // @desc    Delete region
  // @access  Private - Regional Coordinator only
  async deleteRegion(req: Request, res: Response, next: NextFunction) {
    try {
      await RegionService.deleteRegion(req.params.id);
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/regions/:id/resources
  // @desc    Get region resource summary
  // @access  Private
  async getResourceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await RegionService.getRegionResourceSummary(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { summary }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/regions/check-point
  // @desc    Check if a point is within a region
  // @access  Private
  async checkPointInRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const { regionId, coordinates } = req.body;
      const isInRegion = await RegionService.isPointInRegion(regionId, coordinates);
      
      res.status(200).json({
        status: 'success',
        data: { isInRegion }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/regions/overlapping
  // @desc    Get regions that overlap with given coordinates
  // @access  Private
  async getOverlappingRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const { coordinates } = req.body;
      const regions = await RegionService.getOverlappingRegions(coordinates);
      
      res.status(200).json({
        status: 'success',
        data: { regions }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new RegionController();
