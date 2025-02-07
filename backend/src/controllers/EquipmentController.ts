import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Equipment, { EquipmentStatus, EquipmentType } from '../models/Equipment';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import SocketService from '../services/SocketService';

class EquipmentController {
  /**
   * Get all equipment
   * @route GET /api/v1/equipment
   */
  public getAllEquipment = catchAsync(async (req: Request, res: Response) => {
    const equipment = await Equipment.find()
      .populate('station', 'name')
      .populate('currentUser', 'name role')
      .populate('currentVehicle', 'name type');

    res.status(200).json({
      status: 'success',
      results: equipment.length,
      data: { equipment }
    });
  });

  /**
   * Get single equipment
   * @route GET /api/v1/equipment/:id
   */
  public getEquipment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id)
      .populate('station', 'name')
      .populate('currentUser', 'name role')
      .populate('currentVehicle', 'name type')
      .populate('maintenanceHistory.performedBy', 'name role');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Create new equipment
   * @route POST /api/v1/equipment
   */
  public createEquipment = catchAsync(async (req: Request, res: Response) => {
    const equipment = await Equipment.create(req.body);
    
    // Notify clients about new equipment
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentCreated(equipment);

    res.status(201).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Update equipment
   * @route PUT /api/v1/equipment/:id
   */
  public updateEquipment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    // Notify clients about equipment update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentUpdated(equipment);

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Delete equipment
   * @route DELETE /api/v1/equipment/:id
   */
  public deleteEquipment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    // Notify clients about equipment deletion
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentDeleted(equipment._id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Update equipment status
   * @route PATCH /api/v1/equipment/:id/status
   */
  public updateEquipmentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    
    if (!Object.values(EquipmentStatus).includes(status)) {
      return next(new AppError('Invalid equipment status', 400));
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    // Notify clients about status update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentStatusChanged(equipment);

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Add maintenance record
   * @route POST /api/v1/equipment/:id/maintenance
   */
  public addMaintenanceRecord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const maintenanceRecord = {
      ...req.body,
      performedBy: req.user._id,
      date: new Date()
    };

    equipment.maintenanceHistory.push(maintenanceRecord);
    equipment.lastInspection = maintenanceRecord.date;
    
    if (maintenanceRecord.nextMaintenanceDate) {
      equipment.nextInspectionDue = maintenanceRecord.nextMaintenanceDate;
    }

    await equipment.save();

    // Notify clients about maintenance update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentMaintenanceUpdated(equipment);

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Get equipment by type
   * @route GET /api/v1/equipment/type/:type
   */
  public getEquipmentByType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params;
    
    if (!Object.values(EquipmentType).includes(type as EquipmentType)) {
      return next(new AppError('Invalid equipment type', 400));
    }

    const equipment = await Equipment.find({ type })
      .populate('station', 'name')
      .populate('currentUser', 'name role');

    res.status(200).json({
      status: 'success',
      results: equipment.length,
      data: { equipment }
    });
  });

  /**
   * Get available equipment
   * @route GET /api/v1/equipment/available/:type
   */
  public getAvailableEquipment = catchAsync(async (req: Request, res: Response) => {
    const { type } = req.params;
    const { stationId } = req.query;

    const query: any = {
      status: EquipmentStatus.AVAILABLE,
      isActive: true
    };

    if (type && Object.values(EquipmentType).includes(type as EquipmentType)) {
      query.type = type;
    }

    if (stationId) {
      query.station = new Types.ObjectId(stationId as string);
    }

    const equipment = await Equipment.find(query)
      .populate('station', 'name')
      .select('-maintenanceHistory -notes');

    res.status(200).json({
      status: 'success',
      results: equipment.length,
      data: { equipment }
    });
  });

  /**
   * Get equipment maintenance history
   * @route GET /api/v1/equipment/:id/maintenance-history
   */
  public getMaintenanceHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id)
      .select('maintenanceHistory')
      .populate('maintenanceHistory.performedBy', 'name role');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { maintenanceHistory: equipment.maintenanceHistory }
    });
  });

  /**
   * Transfer equipment to another station
   * @route POST /api/v1/equipment/:id/transfer
   */
  public transferEquipment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { targetStationId } = req.body;

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        station: targetStationId,
        currentUser: null,
        currentVehicle: null,
        status: EquipmentStatus.AVAILABLE
      },
      { new: true }
    ).populate('station', 'name');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    // Notify clients about equipment transfer
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentTransferred(equipment);

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Update bulk equipment status
   * @route POST /api/v1/equipment/bulk/status
   */
  public updateBulkStatus = catchAsync(async (req: Request, res: Response) => {
    const { equipmentIds, status } = req.body;

    if (!Object.values(EquipmentStatus).includes(status)) {
      throw new AppError('Invalid equipment status', 400);
    }

    const result = await Equipment.updateMany(
      { _id: { $in: equipmentIds } },
      { status }
    );

    // Notify clients about bulk status update
    const socketService: SocketService = req.app.get('socketService');
    socketService.emitEquipmentBulkStatusChanged({ equipmentIds, status });

    res.status(200).json({
      status: 'success',
      data: { modifiedCount: result.modifiedCount }
    });
  });
}

export default new EquipmentController();
