import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { StationType, StationStatus } from '../models/Station';
import { Types } from 'mongoose';

// Helper schema for ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => ObjectId.isValid(val),
  { message: 'Invalid ObjectId' }
);

// Location schema
const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  lastUpdated: z.date().optional(),
});

// Equipment allocation schema
const equipmentAllocationSchema = z.object({
  equipmentId: objectIdSchema,
  quantity: z.number().int().positive(),
  status: z.string(),
  lastChecked: z.date().optional(),
});

// Vehicle allocation schema
const vehicleAllocationSchema = z.object({
  vehicleId: objectIdSchema,
  status: z.string(),
  assignedTeamId: objectIdSchema.optional(),
  lastMaintenance: z.date().optional(),
});

// Base station schema for shared properties
const baseStationSchema = {
  name: z.string().min(2).max(100),
  type: z.nativeEnum(StationType),
  status: z.nativeEnum(StationStatus),
  location: locationSchema,
  capacity: z.object({
    teams: z.number().int().positive(),
    vehicles: z.number().int().positive(),
    equipment: z.number().int().positive(),
  }),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string(),
  }),
  equipment: z.array(equipmentAllocationSchema).optional(),
  vehicles: z.array(vehicleAllocationSchema).optional(),
  teams: z.array(objectIdSchema).optional(),
  notes: z.array(z.string()).optional(),
};

// Create station schema
export const createStationSchema = z.object({
  body: z.object(baseStationSchema),
});

// Update station schema
export const updateStationSchema = z.object({
  body: z.object({
    ...baseStationSchema,
    status: z.nativeEnum(StationStatus).optional(),
    equipment: z.array(equipmentAllocationSchema).optional(),
    vehicles: z.array(vehicleAllocationSchema).optional(),
  }).partial(),
});

// Station params schema for route parameters
export const stationParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Equipment allocation request schema
export const equipmentAllocationRequestSchema = z.object({
  body: z.object({
    equipmentId: objectIdSchema,
    quantity: z.number().int().positive(),
  }),
});

// Vehicle allocation request schema
export const vehicleAllocationRequestSchema = z.object({
  body: z.object({
    vehicleId: objectIdSchema,
  }),
});

const coordinatesSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90)    // latitude
  ])
});

const capacitySchema = z.object({
  vehicles: z.number().int().min(0).optional(),
  equipment: z.number().int().min(0).optional(),
  personnel: z.number().int().min(0).optional()
});

const stationSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  location: coordinatesSchema,
  capacity: capacitySchema,
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  region: z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid region ID'
  }),
  vehicles: z.array(z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid vehicle ID'
  })).optional(),
  equipment: z.array(z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid equipment ID'
  })).optional(),
  personnel: z.array(z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid personnel ID'
  })).optional(),
  contactInfo: z.object({
    phone: z.string().min(10).max(20).optional(),
    email: z.string().email().optional(),
    emergencyNumber: z.string().min(10).max(20)
  }).optional()
});

// Validation function
export const validateStation = (data: unknown) => {
  return stationSchema.parse(data);
};

export const validateCapacity = (data: unknown) => {
  return capacitySchema.parse(data);
};

export type CreateStationSchema = z.infer<typeof createStationSchema>;
export type UpdateStationSchema = z.infer<typeof updateStationSchema>;
export type StationParamsSchema = z.infer<typeof stationParamsSchema>;
export type EquipmentAllocationRequestSchema = z.infer<typeof equipmentAllocationRequestSchema>;
export type VehicleAllocationRequestSchema = z.infer<typeof vehicleAllocationRequestSchema>;
export type ValidatedStation = z.infer<typeof stationSchema>;
export type ValidatedCapacity = z.infer<typeof capacitySchema>;
