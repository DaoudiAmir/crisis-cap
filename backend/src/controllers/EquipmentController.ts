import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Equipment, { EquipmentStatus, EquipmentType, IEquipment } from '../models/Equipment';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';
import socketService from '../services/SocketService';
import { validateEquipment } from '../schemas/equipmentSchema';

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
    const validatedData = validateEquipment(req.body);
    const equipment = await Equipment.create(validatedData);

    if (!equipment || !equipment._id) {
      throw new AppError('Failed to create equipment', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_CREATED', equipment });

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
    const validatedData = validateEquipment(req.body);
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true
    });

    if (!equipment || !equipment._id) {
      return next(new AppError('Equipment not found', 404));
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_UPDATED', equipment });

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

    if (!equipment || !equipment._id) {
      return next(new AppError('Equipment not found', 404));
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_DELETED', equipmentId: equipment._id.toString() });

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Get equipment by type
   * @route GET /api/v1/equipment/type/:type
   */
  public getEquipmentByType = catchAsync(async (req: Request, res: Response) => {
    const equipment = await Equipment.find({ type: req.params.type as EquipmentType })
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
   * Get equipment by station
   * @route GET /api/v1/equipment/station/:stationId
   */
  public getEquipmentByStation = catchAsync(async (req: Request, res: Response) => {
    const equipment = await Equipment.find({ station: new Types.ObjectId(req.params.stationId) })
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
   * Get available equipment
   * @route GET /api/v1/equipment/available/:type
   */
  public getAvailableEquipment = catchAsync(async (req: Request, res: Response) => {
    const equipment = await Equipment.find({
      type: req.params.type as EquipmentType,
      status: EquipmentStatus.AVAILABLE,
      currentUser: { $exists: false }
    })
      .populate('station', 'name')
      .populate('currentVehicle', 'name type');

    res.status(200).json({
      status: 'success',
      results: equipment.length,
      data: { equipment }
    });
  });

  /**
   * Get equipment status
   * @route GET /api/v1/equipment/:id/status
   */
  public getEquipmentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id).select('status lastStatusUpdate');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        status: equipment.status,
        lastUpdate: equipment.lastStatusUpdate
      }
    });
  });

  /**
   * Update equipment status
   * @route PATCH /api/v1/equipment/:id/status
   */
  public updateEquipmentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status as EquipmentStatus,
        lastStatusUpdate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!equipment || !equipment._id) {
      return next(new AppError('Equipment not found', 404));
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'STATUS_UPDATED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Add maintenance record
   * @route POST /api/v1/equipment/:id/maintenance
   */
  public addMaintenanceRecord = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const maintenanceRecord = {
      ...req.body,
      performedBy: new Types.ObjectId(req.user._id),
      date: new Date()
    };

    equipment.maintenanceHistory.push(maintenanceRecord);
    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to save maintenance record', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'MAINTENANCE_ADDED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Get maintenance history
   * @route GET /api/v1/equipment/:id/maintenance
   */
  public getMaintenanceHistory = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
   * Get equipment history
   * @route GET /api/v1/equipment/:id/history
   */
  public getEquipmentHistory = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id)
      .select('statusHistory transferHistory maintenanceHistory')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('transferHistory.fromStation toStation', 'name')
      .populate('transferHistory.fromUser toUser', 'name role')
      .populate('transferHistory.fromVehicle toVehicle', 'name type')
      .populate('maintenanceHistory.performedBy', 'name role');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        statusHistory: equipment.statusHistory,
        transferHistory: equipment.transferHistory,
        maintenanceHistory: equipment.maintenanceHistory
      }
    });
  });

  /**
   * Transfer equipment
   * @route POST /api/v1/equipment/:id/transfer
   */
  public transferEquipment = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const { toStation, toVehicle, toUser } = req.body;

    if (toStation) equipment.station = new Types.ObjectId(toStation);
    if (toVehicle) equipment.currentVehicle = new Types.ObjectId(toVehicle);
    if (toUser) equipment.currentUser = new Types.ObjectId(toUser);

    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to transfer equipment', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_TRANSFERRED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Transfer bulk equipment
   * @route POST /api/v1/equipment/bulk/transfer
   */
  public transferBulkEquipment = catchAsync(async (req: Request, res: Response) => {
    const { equipmentIds, toStation, toVehicle, toUser } = req.body;

    const updateData: any = {};
    if (toStation) updateData.station = new Types.ObjectId(toStation);
    if (toVehicle) updateData.currentVehicle = new Types.ObjectId(toVehicle);
    if (toUser) updateData.currentUser = new Types.ObjectId(toUser);

    const result = await Equipment.updateMany(
      { _id: { $in: equipmentIds.map(id => new Types.ObjectId(id)) } },
      { $set: updateData }
    );

    equipmentIds.forEach(id => {
      socketService.emitEquipmentUpdate(id, { type: 'EQUIPMENT_TRANSFERRED', ...updateData });
    });

    res.status(200).json({
      status: 'success',
      data: { modifiedCount: result.modifiedCount }
    });
  });

  /**
   * Bulk update equipment status
   * @route POST /api/v1/equipment/bulk/status
   */
  public updateBulkStatus = catchAsync(async (req: Request, res: Response) => {
    const { equipmentIds, status } = req.body;

    const result = await Equipment.updateMany(
      { _id: { $in: equipmentIds.map(id => new Types.ObjectId(id)) } },
      {
        $set: {
          status,
          lastStatusUpdate: new Date()
        }
      }
    );

    equipmentIds.forEach(id => {
      socketService.emitEquipmentUpdate(id, { type: 'STATUS_UPDATED', status });
    });

    res.status(200).json({
      status: 'success',
      data: { modifiedCount: result.modifiedCount }
    });
  });

  /**
   * Add bulk maintenance records
   * @route POST /api/v1/equipment/bulk/maintenance
   */
  public addBulkMaintenance = catchAsync(async (req: Request, res: Response) => {
    const { equipmentIds, maintenanceData } = req.body;

    const maintenanceRecord = {
      ...maintenanceData,
      performedBy: new Types.ObjectId(req.user._id),
      date: new Date()
    };

    const result = await Equipment.updateMany(
      { _id: { $in: equipmentIds.map(id => new Types.ObjectId(id)) } },
      {
        $push: {
          maintenanceHistory: maintenanceRecord
        }
      }
    );

    equipmentIds.forEach(id => {
      socketService.emitEquipmentUpdate(id, { type: 'MAINTENANCE_ADDED', maintenanceRecord });
    });

    res.status(200).json({
      status: 'success',
      data: { modifiedCount: result.modifiedCount }
    });
  });

  /**
   * Add equipment note
   * @route POST /api/v1/equipment/:id/notes
   */
  public addEquipmentNote = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const note = {
      ...req.body,
      createdBy: new Types.ObjectId(req.user._id),
      createdAt: new Date()
    };

    equipment.notes.push(note);
    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to save note', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'NOTE_ADDED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Get equipment notes
   * @route GET /api/v1/equipment/:id/notes
   */
  public getEquipmentNotes = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id)
      .select('notes')
      .populate('notes.createdBy', 'name role');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { notes: equipment.notes }
    });
  });

  /**
   * Assign equipment
   * @route POST /api/v1/equipment/:id/assign
   */
  public assignEquipment = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const { userId, vehicleId } = req.body;

    if (userId) equipment.currentUser = new Types.ObjectId(userId);
    if (vehicleId) equipment.currentVehicle = new Types.ObjectId(vehicleId);
    equipment.status = EquipmentStatus.IN_USE;
    equipment.lastStatusUpdate = new Date();

    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to assign equipment', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_ASSIGNED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Return equipment
   * @route POST /api/v1/equipment/:id/return
   */
  public returnEquipment = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    equipment.currentUser = undefined;
    equipment.currentVehicle = undefined;
    equipment.status = EquipmentStatus.AVAILABLE;
    equipment.lastStatusUpdate = new Date();

    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to return equipment', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'EQUIPMENT_RETURNED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Get maintenance records
   * @route GET /api/v1/equipment/:id/maintenance
   */
  public getMaintenanceRecords = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
   * Update maintenance record
   * @route PUT /api/v1/equipment/:id/maintenance/:recordId
   */
  public updateMaintenanceRecord = catchAsync(async (req: Request<{ id: string; recordId: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const maintenanceRecord = equipment.maintenanceHistory.id(req.params.recordId);
    if (!maintenanceRecord) {
      return next(new AppError('Maintenance record not found', 404));
    }

    Object.assign(maintenanceRecord, req.body);
    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to update maintenance record', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'MAINTENANCE_UPDATED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Add inspection record
   * @route POST /api/v1/equipment/:id/inspection
   */
  public addInspectionRecord = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const inspectionRecord = {
      ...req.body,
      inspectedBy: new Types.ObjectId(req.user._id),
      date: new Date()
    };

    equipment.inspectionHistory.push(inspectionRecord);
    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to save inspection record', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'INSPECTION_ADDED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });

  /**
   * Get inspection records
   * @route GET /api/v1/equipment/:id/inspection
   */
  public getInspectionRecords = catchAsync(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id)
      .select('inspectionHistory')
      .populate('inspectionHistory.inspectedBy', 'name role');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { inspectionHistory: equipment.inspectionHistory }
    });
  });

  /**
   * Update inspection record
   * @route PUT /api/v1/equipment/:id/inspection/:recordId
   */
  public updateInspectionRecord = catchAsync(async (req: Request<{ id: string; recordId: string }>, res: Response, next: NextFunction) => {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    const inspectionRecord = equipment.inspectionHistory.id(req.params.recordId);
    if (!inspectionRecord) {
      return next(new AppError('Inspection record not found', 404));
    }

    Object.assign(inspectionRecord, req.body);
    await equipment.save();

    if (!equipment._id) {
      throw new AppError('Failed to update inspection record', 500);
    }

    socketService.emitEquipmentUpdate(equipment._id.toString(), { type: 'INSPECTION_UPDATED', equipment });

    res.status(200).json({
      status: 'success',
      data: { equipment }
    });
  });
}

export default new EquipmentController();
