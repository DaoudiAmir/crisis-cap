import { z } from 'zod';

// Base coordinate schema
const coordinateSchema = z.object({
  number: z.number()
    .min(-180)
    .max(180)
    .describe('Coordinate value between -180 and 180 degrees')
});

// Schema for coordinates array
export const coordinatesSchema = z.object({
  coordinates: z.array(coordinateSchema)
    .min(3)
    .describe('Array of coordinates defining the region boundary. Minimum 3 points required.')
});

// Schema for creating a new region
export const createRegionSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2)
      .max(100)
      .describe('Region name'),
    coordinates: z.array(coordinateSchema)
      .min(3)
      .describe('Array of coordinates defining the region boundary')
  })
});

// Schema for updating a region
export const updateRegionSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2)
      .max(100)
      .optional()
      .describe('Region name'),
    coordinates: z.array(coordinateSchema)
      .min(3)
      .optional()
      .describe('Array of coordinates defining the region boundary')
  })
});

// Schema for region ID parameter
export const regionParamsSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .describe('Valid MongoDB ObjectId')
  })
});
