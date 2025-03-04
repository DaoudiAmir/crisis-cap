import { z } from 'zod';

// Intervention status enum
export const InterventionStatus = z.enum([
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'in_progress',
  'completed',
  'cancelled'
]);

// Priority level enum
export const PriorityLevel = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
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
    .describe('Longitude coordinate'),
  address: z.string()
    .optional()
    .describe('Optional address description')
});

// Resource schema
const resourceSchema = z.object({
  type: z.enum(['VEHICLE', 'EQUIPMENT', 'PERSONNEL']),
  id: z.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .describe('Resource MongoDB ObjectId'),
  quantity: z.number()
    .int()
    .min(1)
    .describe('Quantity of resource needed')
});

// Timeline event schema
const timelineEventSchema = z.object({
  timestamp: z.string()
    .datetime()
    .describe('Event timestamp'),
  description: z.string()
    .min(1)
    .max(500)
    .describe('Event description'),
  type: z.enum(['STATUS_CHANGE', 'RESOURCE_ASSIGNMENT', 'NOTE', 'OTHER']),
  userId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .describe('User who created the event')
});

// Schema for creating a new intervention
export const createInterventionSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3)
      .max(200)
      .describe('Intervention title'),
    description: z.string()
      .min(10)
      .max(1000)
      .describe('Detailed description of the intervention'),
    location: locationSchema,
    priority: PriorityLevel,
    requiredResources: z.array(resourceSchema)
      .optional(),
    estimatedDuration: z.number()
      .int()
      .min(1)
      .describe('Estimated duration in minutes')
      .optional(),
    startTime: z.string()
      .datetime()
      .optional(),
    regionId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Region MongoDB ObjectId')
  })
});

// Schema for updating an intervention
export const updateInterventionSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3)
      .max(200)
      .optional(),
    description: z.string()
      .min(10)
      .max(1000)
      .optional(),
    location: locationSchema.optional(),
    priority: PriorityLevel.optional(),
    status: InterventionStatus.optional(),
    requiredResources: z.array(resourceSchema)
      .optional(),
    estimatedDuration: z.number()
      .int()
      .min(1)
      .optional(),
    endTime: z.string()
      .datetime()
      .optional()
  })
});

// Schema for adding a timeline event
export const addTimelineEventSchema = z.object({
  body: timelineEventSchema
});

// Schema for intervention ID parameter
export const interventionParamsSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Valid MongoDB ObjectId')
  })
});

// Schema for assigning resources
export const assignResourceSchema = z.object({
  body: z.object({
    resourceId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Resource MongoDB ObjectId'),
    type: z.enum(['VEHICLE', 'EQUIPMENT', 'PERSONNEL']),
    quantity: z.number()
      .int()
      .min(1)
      .describe('Quantity to assign')
  })
});

// Schema for intervention query parameters
export const interventionQuerySchema = z.object({
  query: z.object({
    status: InterventionStatus.optional(),
    priority: PriorityLevel.optional(),
    regionId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    startDate: z.string()
      .datetime()
      .optional(),
    endDate: z.string()
      .datetime()
      .optional()
  }).optional()
});
