import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    type: z.enum(['FIRE_FIGHTING', 'RESCUE', 'MEDICAL', 'HAZMAT', 'SPECIAL_OPS']),
    station: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid station ID'),
    members: z.array(z.object({
      userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
      role: z.string().min(2).max(50),
      specializations: z.array(z.string()).optional(),
      isLeader: z.boolean().default(false)
    })).min(1),
    schedule: z.array(z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      type: z.enum(['SHIFT', 'TRAINING', 'MAINTENANCE'])
    })).optional(),
    status: z.enum(['ACTIVE', 'ON_BREAK', 'OFF_DUTY', 'ON_MISSION']).default('ACTIVE'),
    currentVehicle: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID').optional(),
    isActive: z.boolean().default(true)
  })
});

export const updateTeamSchema = createTeamSchema.deepPartial();

export const teamParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ID')
  })
});

export const teamMemberSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    role: z.string().min(2).max(50),
    specializations: z.array(z.string()).optional(),
    isLeader: z.boolean().optional()
  })
});

export const teamScheduleSchema = z.object({
  body: z.array(z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    type: z.enum(['SHIFT', 'TRAINING', 'MAINTENANCE'])
  }))
});

export const teamStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'ON_BREAK', 'OFF_DUTY', 'ON_MISSION'])
  })
});
