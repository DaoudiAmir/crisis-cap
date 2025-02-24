import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Station, { IStation } from '../models/Station';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import socketService from '../services/SocketService';
import stationService, { ServiceResult } from '../services/StationService';
import { validateStation, validateCapacity } from '../schemas/stationSchema';

interface StationParams {
  id: string;
  vehicleId?: string;
  equipmentId?: string;
}

class StationController {
  /**
   * Get all stations
   * @route GET /api/v1/stations
   */
  public getAllStations = catchAsync(async (req: Request, res: Response) => {
    const stations = await Station.find()
      .populate('vehicles', 'name type status')
      .populate('equipment', 'name type status')
      .populate('personnel', 'name role status');

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
  public getStation = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id)
      .populate('vehicles', 'name type status')
      .populate('equipment', 'name type status')
      .populate('personnel', 'name role status');

    if (!station || !station._id) {
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
    const validatedData = validateStation(req.body);
    const station = await Station.create(validatedData);

    if (!station || !station._id) {
      throw new AppError('Failed to create station', 500);
    }

    socketService.emitStationUpdate(station._id.toString(), { type: 'STATION_CREATED', station });

    res.status(201).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Update a station
   * @route PATCH /api/v1/stations/:id
   */
  public updateStation = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const validatedData = validateStation(req.body);
    const station = await Station.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true
    });

    if (!station || !station._id) {
      return next(new AppError('Station not found', 404));
    }

    socketService.emitStationUpdate(station._id.toString(), { type: 'STATION_UPDATED', station });

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Delete a station
   * @route DELETE /api/v1/stations/:id
   */
  public deleteStation = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const station = await Station.findByIdAndDelete(req.params.id);

    if (!station || !station._id) {
      return next(new AppError('Station not found', 404));
    }

    socketService.emitStationUpdate(station._id.toString(), { type: 'STATION_DELETED', stationId: station._id.toString() });

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Add a vehicle to a station
   * @route POST /api/v1/stations/:id/vehicles/:vehicleId
   */
  public addVehicle = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    if (!req.params.id || !req.params.vehicleId || !Types.ObjectId.isValid(req.params.id) || !Types.ObjectId.isValid(req.params.vehicleId)) {
      return next(new AppError('Invalid station or vehicle ID', 400));
    }

    const result = await stationService.addVehicle(req.params.id, req.params.vehicleId);
    
    if (!result.success) {
      return next(new AppError(result.message || 'Failed to add vehicle', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Vehicle added to station successfully',
      data: result.data
    });
  });

  /**
   * Remove a vehicle from a station
   * @route DELETE /api/v1/stations/:id/vehicles/:vehicleId
   */
  public removeVehicle = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    if (!req.params.id || !req.params.vehicleId || !Types.ObjectId.isValid(req.params.id) || !Types.ObjectId.isValid(req.params.vehicleId)) {
      return next(new AppError('Invalid station or vehicle ID', 400));
    }

    const result = await stationService.removeVehicle(req.params.id, req.params.vehicleId);
    
    if (!result.success) {
      return next(new AppError(result.message || 'Failed to remove vehicle', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Vehicle removed from station successfully',
      data: result.data
    });
  });

  /**
   * Add equipment to a station
   * @route POST /api/v1/stations/:id/equipment
   */
  public addStationEquipment = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { equipmentId } = req.body;

    const station = await stationService.addEquipment(id, equipmentId);
    
    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    // Emit socket event
    socketService.emitStationResourceUpdated({
      stationId: id,
      resourceType: 'equipment',
      action: 'add',
      resourceId: equipmentId
    });

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Remove equipment from a station
   * @route DELETE /api/v1/stations/:id/equipment/:equipmentId
   */
  public removeStationEquipment = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const { id, equipmentId } = req.params;

    if (!equipmentId) {
      return next(new AppError('Equipment ID is required', 400));
    }

    const station = await stationService.removeEquipment(id, equipmentId);
    
    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    // Emit socket event
    socketService.emitStationResourceUpdated({
      stationId: id,
      resourceType: 'equipment',
      action: 'remove',
      resourceId: equipmentId
    });

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
   * Update station capacity
   * @route PATCH /api/v1/stations/:id/capacity
   */
  public updateCapacity = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    if (!req.params.id || !Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('Invalid station ID', 400));
    }

    const validatedCapacity = validateCapacity(req.body);
    const result = await stationService.updateCapacity(req.params.id, validatedCapacity);
    
    if (!result.success) {
      return next(new AppError(result.message || 'Failed to update capacity', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Station capacity updated successfully',
      data: result.data
    });
  });

  /**
   * Get station statistics
   * @route GET /api/v1/stations/:id/statistics
   */
  public getStationStatistics = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    const statistics = await stationService.getStationStatistics(station._id);

    res.status(200).json({
      status: 'success',
      data: { statistics }
    });
  });

  /**
   * Get station resources
   * @route GET /api/v1/stations/:id/resources
   */
  public getStationResources = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id)
      .populate('vehicles')
      .populate('equipment')
      .populate('personnel');

    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicles: station.vehicles,
        equipment: station.equipment,
        personnel: station.personnel
      }
    });
  });

  /**
   * Get nearby stations
   * @route GET /api/v1/stations/:id/nearby
   */
  public getNearbyStations = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const station = await Station.findById(req.params.id);
    
    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    const radius = Number(req.query.radius) || 10; // Default 10km radius
    const nearbyStations = await stationService.findNearbyStations(station.location, radius);

    res.status(200).json({
      status: 'success',
      results: nearbyStations.length,
      data: { stations: nearbyStations }
    });
  });

  /**
   * Update station status
   * @route PATCH /api/v1/stations/:id/status
   */
  public updateStationStatus = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const station = await Station.findById(req.params.id);

    if (!station) {
      return next(new AppError('Station not found', 404));
    }

    station.status = status;
    await station.save();

    // Emit socket event for real-time updates
    socketService.emitStationStatusChanged({
      stationId: station._id,
      status: station.status
    });

    res.status(200).json({
      status: 'success',
      data: { station }
    });
  });

  /**
 * Add resource to station
 * @route POST /api/v1/stations/:id/resources
 */
public addStationResource = catchAsync(async (req: Request<StationParams>, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { resourceType, resourceId } = req.body;

  let result: ServiceResult;
  switch (resourceType) {
    case 'vehicle':
      result = await stationService.addVehicle(id, resourceId);
      break;
    case 'equipment':
      result = await stationService.addEquipment(id, resourceId);
      break;
    default:
      return next(new AppError('Invalid resource type', 400));
  }

  if (!result.success) {
    return next(new AppError(result.message || 'Failed to add resource', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Resource added successfully',
    data: result.data
  });
});
}

export default new StationController();
