import { z } from 'zod';

// Vehicle status enum
export const VehicleStatus = z.enum([
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'OUT_OF_SERVICE'
]);

// Vehicle type enum
export const VehicleType = z.enum([
  'FIRE_ENGINE',
  'LADDER_TRUCK',
  'RESCUE_VEHICLE',
  'AMBULANCE',
  'COMMAND_VEHICLE',
  'UTILITY_VEHICLE',
  'WATER_TENDER',
  'HAZMAT_UNIT'
]);

// Location schema
const locationSchema = z.object({
  latitude: z.number()
    .min(-90)
    .max(90)
    .describe('Latitude coordinate'),
  longitude: z.number()
    .min(-180)
    .max(180)
    .describe('Longitude coordinate')
});

// Maintenance record schema
const maintenanceRecordSchema = z.object({
  type: z.enum(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY']),
  description: z.string()
    .min(10)
    .max(500)
    .describe('Maintenance description'),
  date: z.string()
    .datetime()
    .describe('Maintenance date'),
  technician: z.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .describe('Technician user ID'),
  cost: z.number()
    .min(0)
    .optional()
    .describe('Maintenance cost'),
  nextMaintenanceDate: z.string()
    .datetime()
    .optional()
    .describe('Next scheduled maintenance date')
});

// Crew member schema
const crewMemberSchema = z.object({
  userId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .describe('User MongoDB ObjectId'),
  role: z.enum(['DRIVER', 'COMMANDER', 'FIREFIGHTER', 'MEDIC', 'SPECIALIST'])
});

// Schema for creating a new vehicle
export const createVehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string()
      .min(3)
      .max(20)
      .describe('Vehicle registration number'),
    type: VehicleType,
    model: z.string()
      .min(2)
      .max(100)
      .describe('Vehicle model'),
    capacity: z.number()
      .int()
      .min(1)
      .describe('Vehicle capacity'),
    stationId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Station MongoDB ObjectId'),
    regionId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Region MongoDB ObjectId'),
    features: z.array(z.string())
      .optional()
      .describe('Special features or capabilities'),
    crew: z.array(crewMemberSchema)
      .optional()
  })
});

// Schema for updating a vehicle
export const updateVehicleSchema = z.object({
  body: z.object({
    status: VehicleStatus.optional(),
    location: locationSchema.optional(),
    crew: z.array(crewMemberSchema).optional(),
    features: z.array(z.string()).optional(),
    stationId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    regionId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
  })
});

// Schema for vehicle ID parameter
export const vehicleParamsSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Valid MongoDB ObjectId')
  })
});

// Schema for adding maintenance record
export const addMaintenanceRecordSchema = z.object({
  body: maintenanceRecordSchema
});

// Schema for updating vehicle location
export const updateLocationSchema = z.object({
  body: locationSchema
});

// Schema for vehicle query parameters
export const vehicleQuerySchema = z.object({
  query: z.object({
    status: VehicleStatus.optional(),
    type: VehicleType.optional(),
    stationId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    regionId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    available: z.boolean().optional()
  }).optional()
});
