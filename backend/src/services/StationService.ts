import { Types } from 'mongoose';
import Station from '../models/Station';
import Vehicle from '../models/Vehicle';
import Equipment from '../models/Equipment';
import AppError from '../utils/AppError';
import { ValidatedCapacity } from '../schemas/stationSchema';
import socketService from './SocketService';

export interface ServiceResult {
  success: boolean;
  message?: string;
  data?: any;
}

class StationService {
  private static instance: StationService;

  private constructor() {}

  public static getInstance(): StationService {
    if (!StationService.instance) {
      StationService.instance = new StationService();
    }
    return StationService.instance;
  }

  /**
   * Add a vehicle to a station
   */
  public async addVehicle(stationId: string, vehicleId: string): Promise<ServiceResult> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { success: false, message: 'Station not found' };
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Vehicle not found' };
    }

    if (vehicle.stationId) {
      return { success: false, message: 'Vehicle is already assigned to a station' };
    }

    station.vehicles.push(new Types.ObjectId(vehicleId));
    vehicle.stationId = new Types.ObjectId(stationId);

    await Promise.all([station.save(), vehicle.save()]);
    socketService.emitStationUpdate(stationId, { type: 'VEHICLE_ADDED', vehicleId });

    return { 
      success: true,
      data: { station, vehicle }
    };
  }

  /**
   * Remove a vehicle from a station
   */
  public async removeVehicle(stationId: string, vehicleId: string): Promise<ServiceResult> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { success: false, message: 'Station not found' };
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Vehicle not found' };
    }

    if (!vehicle.stationId?.equals(stationId)) {
      return { success: false, message: 'Vehicle is not assigned to this station' };
    }

    station.vehicles = station.vehicles.filter(id => !id.equals(vehicleId));
    vehicle.stationId = undefined;

    await Promise.all([station.save(), vehicle.save()]);
    socketService.emitStationUpdate(stationId, { type: 'VEHICLE_REMOVED', vehicleId });

    return { success: true };
  }

  /**
   * Add equipment to a station
   */
  public async addEquipment(stationId: string, equipmentId: string): Promise<ServiceResult> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { success: false, message: 'Station not found' };
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return { success: false, message: 'Equipment not found' };
    }

    if (equipment.stationId) {
      return { success: false, message: 'Equipment is already assigned to a station' };
    }

    station.equipment.push(new Types.ObjectId(equipmentId));
    equipment.stationId = new Types.ObjectId(stationId);

    await Promise.all([station.save(), equipment.save()]);
    socketService.emitStationUpdate(stationId, { type: 'EQUIPMENT_ADDED', equipmentId });

    return {
      success: true,
      data: { station, equipment }
    };
  }

  /**
   * Remove equipment from a station
   */
  public async removeEquipment(stationId: string, equipmentId: string): Promise<ServiceResult> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { success: false, message: 'Station not found' };
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return { success: false, message: 'Equipment not found' };
    }

    if (!equipment.stationId?.equals(stationId)) {
      return { success: false, message: 'Equipment is not assigned to this station' };
    }

    station.equipment = station.equipment.filter(id => !id.equals(equipmentId));
    equipment.stationId = undefined;

    await Promise.all([station.save(), equipment.save()]);
    socketService.emitStationUpdate(stationId, { type: 'EQUIPMENT_REMOVED', equipmentId });

    return { success: true };
  }

  /**
   * Update station capacity
   */
  public async updateCapacity(stationId: string, capacity: ValidatedCapacity): Promise<ServiceResult> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { success: false, message: 'Station not found' };
    }

    if (capacity.vehicles < station.vehicles.length) {
      return { success: false, message: 'Cannot reduce capacity below current vehicle count' };
    }

    if (capacity.equipment < station.equipment.length) {
      return { success: false, message: 'Cannot reduce capacity below current equipment count' };
    }

    station.capacity = capacity;
    await station.save();
    socketService.emitStationUpdate(stationId, { type: 'CAPACITY_UPDATED', capacity });

    return { success: true };
  }
}

export default StationService.getInstance();
