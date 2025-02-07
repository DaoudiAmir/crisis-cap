import { z } from 'zod';

export const createStationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(20),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90)    // latitude
      ]),
      address: z.string().min(5).max(200)
    }),
    capacity: z.object({
      personnel: z.number().int().min(1),
      vehicles: z.number().int().min(1),
      equipment: z.number().int().min(1)
    }),
    status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
    type: z.enum(['fire', 'medical', 'police', 'mixed']),
    contact: z.object({
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      email: z.string().email(),
      emergencyNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/)
    })
  })
});

export const updateStationSchema = createStationSchema.deepPartial();

export const stationParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid station ID')
  })
});

export const stationQuerySchema = z.object({
  query: z.object({
    status: z.enum(['active', 'maintenance', 'inactive']).optional(),
    type: z.enum(['fire', 'medical', 'police', 'mixed']).optional(),
    location: z.object({
      longitude: z.number(),
      latitude: z.number(),
      radius: z.number().positive()
    }).optional()
  })
});
