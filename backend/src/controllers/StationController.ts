import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Station from '../models/Station';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Equipment from '../models/Equipment';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import SocketService from '../services/SocketService';

class StationController {
  /**
   * Get all stations
   * @route GET /api/v1/stations
   */
  public getAllStations = catchAsync(async (req: Request, res: Response) => {
    const stations = await Station.find();
    res.status(200).json({
      status: 'success',
      results: stations.length,
      data: { stations }
    });
  });

  /**
   * Get a single station
   * @route GET /api/v1/stations/:id
   */
  public getStation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Create a new station
   * @route POST /api/v1/stations
   */
  public createStation = catchAsync(async (req: Request, res: Response) => {
    const station = await Station.create(req.body);
    
    // Notify clients about new station
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitStationCreated(station);

    res.status(201).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Update a station
   * @route PUT /api/v1/stations/:id
   */
  public updateStation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    // Notify clients about station update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitStationUpdated(station);

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Update station status
   * @route PATCH /api/v1/stations/:id/status
   */
  public updateStationStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    // Notify clients about status update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitStationStatusChanged(station);

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Get station statistics
   * @route GET /api/v1/stations/:id/statistics
   */
  public getStationStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stationId = new Types.ObjectId(req.params.id);

    const [
      personnelCount,
      vehicleCount,
      equipmentCount,
      activePersonnel,
      availableVehicles,
      equipmentInMaintenance
    ] = await Promise.all([
      User.countDocuments({ station: stationId }),
      Vehicle.countDocuments({ station: stationId }),
      Equipment.countDocuments({ station: stationId }),
      User.countDocuments({ station: stationId, isAvailable: true }),
      Vehicle.countDocuments({ station: stationId, status: 'available' }),
      Equipment.countDocuments({ station: stationId, status: 'maintenance' })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          personnel: {
            total: personnelCount,
            active: activePersonnel,
            availability: personnelCount ? (activePersonnel / personnelCount) * 100 : 0
          },
          vehicles: {
            total: vehicleCount,
            available: availableVehicles,
            availability: vehicleCount ? (availableVehicles / vehicleCount) * 100 : 0
          },
          equipment: {
            total: equipmentCount,
            inMaintenance: equipmentInMaintenance,
            maintenanceRate: equipmentCount ? (equipmentInMaintenance / equipmentCount) * 100 : 0
          }
        }
      }
    });
  });

  /**
   * Get station resources
   * @route GET /api/v1/stations/:id/resources
   */
  public getStationResources = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stationId = new Types.ObjectId(req.params.id);

    const [personnel, vehicles, equipment] = await Promise.all([
      User.find({ station: stationId }).select('name role isAvailable lastActive'),
      Vehicle.find({ station: stationId }).select('name type status lastMaintenance'),
      Equipment.find({ station: stationId }).select('name type status lastInspection')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        resources: {
          personnel,
          vehicles,
          equipment
        }
      }
    });
  });

  /**
   * Get nearby stations
   * @route GET /api/v1/stations/:id/nearby
   */
  public getNearbyStations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    const radius = Number(req.query.radius) || 10; // Default 10km radius
    const coordinates = station.address.coordinates;

    const nearbyStations = await Station.find({
      _id: { $ne: station._id },
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('name address');

    res.status(200).json({
      status: 'success',
      results: nearbyStations.length,
      data: { stations: nearbyStations }
    });
  });

  /**
   * Add resource to station
   * @route POST /api/v1/stations/:id/resources
   */
  public addStationResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType, resourceId } = req.body;
    const stationId = req.params.id;

    let resource;
    switch (resourceType) {
      case 'personnel':
        resource = await User.findByIdAndUpdate(
          resourceId,
          { station: stationId },
          { new: true }
        );
        break;
      case 'vehicle':
        resource = await Vehicle.findByIdAndUpdate(
          resourceId,
          { station: stationId },
          { new: true }
        );
        break;
      case 'equipment':
        resource = await Equipment.findByIdAndUpdate(
          resourceId,
          { station: stationId },
          { new: true }
        );
        break;
      default:
        return next(new AppError('Invalid resource type', 400));
    }

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Notify clients about resource addition
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitStationResourceUpdated({ stationId, resourceType, action: 'add', resource });

    res.status(200).json({
      status: 'success',
      data: { resource }
    });
  });

  /**
   * Remove resource from station
   * @route DELETE /api/v1/stations/:id/resources/:resourceId
   */
  public removeStationResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType } = req.query;
    const { id: stationId, resourceId } = req.params;

    let resource;
    switch (resourceType) {
      case 'personnel':
        resource = await User.findByIdAndUpdate(
          resourceId,
          { $unset: { station: 1 } },
          { new: true }
        );
        break;
      case 'vehicle':
        resource = await Vehicle.findByIdAndUpdate(
          resourceId,
          { $unset: { station: 1 } },
          { new: true }
        );
        break;
      case 'equipment':
        resource = await Equipment.findByIdAndUpdate(
          resourceId,
          { $unset: { station: 1 } },
          { new: true }
        );
        break;
      default:
        return next(new AppError('Invalid resource type', 400));
    }

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Notify clients about resource removal
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitStationResourceUpdated({ stationId, resourceType, action: 'remove', resource });

    res.status(200).json({
      status: 'success',
      data: null
    });
  });
}

export default new StationController();
