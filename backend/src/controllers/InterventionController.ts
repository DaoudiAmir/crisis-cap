import { Request, Response, NextFunction } from 'express';
import { InterventionStatus, InterventionType, InterventionPriority } from '../models/Intervention';
import InterventionService from '../services/InterventionService';
import AppError from '../utils/AppError';

class InterventionController {
  // @route   POST /api/interventions
  // @desc    Create a new intervention
  // @access  Private - Team Leader and above
  async createIntervention(req: Request, res: Response, next: NextFunction) {
    try {
      const intervention = await InterventionService.createIntervention({
        ...req.body,
        createdBy: req.user?._id
      });
      
      res.status(201).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/interventions
  // @desc    Get all interventions with filters
  // @access  Private
  async getInterventions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      
      // Handle status - can be a single value or comma-separated list
      if (req.query.status) {
        if (typeof req.query.status === 'string' && req.query.status.includes(',')) {
          filters.status = req.query.status.split(',');
        } else {
          filters.status = req.query.status;
        }
      }
      
      // Handle other filter parameters
      if (req.query.type) filters.type = req.query.type;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.region) filters.region = req.query.region;
      if (req.query.station) filters.station = req.query.station;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.sort) filters.sort = req.query.sort;

      const interventions = await InterventionService.getInterventions(filters);
      
      res.status(200).json({
        status: 'success',
        data: { interventions }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/interventions/:id
  // @desc    Get intervention by ID
  // @access  Private
  async getInterventionById(req: Request, res: Response, next: NextFunction) {
    try {
      const intervention = await InterventionService.getInterventionById(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/interventions/:id/status
  // @desc    Update intervention status
  // @access  Private - Team Leader and above
  async updateInterventionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!Object.values(InterventionStatus).includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const intervention = await InterventionService.updateInterventionStatus(
        req.params.id,
        status,
        req.user?._id
      );
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/interventions/:id/resources
  // @desc    Add resource to intervention
  // @access  Private - Team Leader and above
  async addResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId, resourceType } = req.body;
      const intervention = await InterventionService.addResourceToIntervention(
        req.params.id,
        resourceId,
        resourceType
      );
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   DELETE /api/interventions/:id/resources/:resourceId
  // @desc    Remove resource from intervention
  // @access  Private - Team Leader and above
  async removeResource(req: Request, res: Response, next: NextFunction) {
    try {
      const intervention = await InterventionService.removeResourceFromIntervention(
        req.params.id,
        req.params.resourceId
      );
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   POST /api/interventions/:id/notes
  // @desc    Add note to intervention
  // @access  Private
  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { note } = req.body;
      const intervention = await InterventionService.addInterventionNote(
        req.params.id,
        note
      );
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   PATCH /api/interventions/:id/location
  // @desc    Update intervention location
  // @access  Private - Team Leader and above
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { location } = req.body;
      const intervention = await InterventionService.updateInterventionLocation(
        req.params.id,
        location
      );
      
      res.status(200).json({
        status: 'success',
        data: { intervention }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/interventions/:id/timeline
  // @desc    Get intervention timeline
  // @access  Private
  async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await InterventionService.getInterventionTimeline(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: { timeline }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/interventions/stats
  // @desc    Get intervention statistics
  // @access  Private - Officer and above
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await InterventionService.getUserInterventions(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/interventions/nearby
  // @desc    Get interventions near a location
  // @access  Private
  async getNearbyInterventions(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, radius } = req.query;
      const interventions = await InterventionService.getUserInterventions(
        req.user._id,
        {
          location: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            radius: Number(radius)
          }
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: { interventions }
      });
    } catch (err) {
      next(err);
    }
  }

  // @route   GET /api/v1/interventions/recent
  // @desc    Get recent interventions for dashboard
  // @access  Private
  async getRecentInterventions(req: Request, res: Response, next: NextFunction) {
    try {
      // Get the 5 most recent interventions
      const interventions = await InterventionService.getInterventions({
        limit: 5,
        sort: '-createdAt'
      }) || [];
      
      res.status(200).json({
        status: 'success',
        data: { interventions }
      });
    } catch (err) {
      console.error("Recent interventions error:", err);
      next(err);
    }
  }

  // @route   GET /api/v1/interventions/active
  // @desc    Get active interventions for map
  // @access  Private
  async getActiveInterventions(req: Request, res: Response, next: NextFunction) {
    try {
      // Get active interventions (in progress, dispatched, etc.)
      const interventions = await InterventionService.getInterventions({
        status: [
          InterventionStatus.IN_PROGRESS,
          InterventionStatus.DISPATCHED,
          InterventionStatus.PENDING,
          InterventionStatus.EN_ROUTE,
          InterventionStatus.ON_SITE
        ]
      }) || [];
      
      res.status(200).json({
        status: 'success',
        data: { interventions }
      });
    } catch (err) {
      console.error("Active interventions error:", err);
      next(err);
    }
  }
}

export default new InterventionController();
