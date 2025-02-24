import { z } from 'zod';
import { Types } from 'mongoose';
import { EquipmentStatus, EquipmentType } from '../models/Equipment';

const equipmentSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.nativeEnum(EquipmentType),
  status: z.nativeEnum(EquipmentStatus).optional(),
  description: z.string().min(10).max(500).optional(),
  serialNumber: z.string().min(3).max(50),
  purchaseDate: z.string().or(z.date()).optional(),
  lastMaintenanceDate: z.string().or(z.date()).optional(),
  nextMaintenanceDate: z.string().or(z.date()).optional(),
  station: z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid station ID'
  }).optional(),
  currentVehicle: z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid vehicle ID'
  }).optional(),
  currentUser: z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid user ID'
  }).optional(),
  maintenanceHistory: z.array(z.object({
    type: z.string(),
    description: z.string(),
    date: z.string().or(z.date()),
    performedBy: z.string().refine(val => Types.ObjectId.isValid(val), {
      message: 'Invalid user ID for maintenance performer'
    }),
    notes: z.string().optional()
  })).optional()
});

export const validateEquipment = (data: unknown) => {
  return equipmentSchema.parse(data);
};

export type ValidatedEquipment = z.infer<typeof equipmentSchema>;
