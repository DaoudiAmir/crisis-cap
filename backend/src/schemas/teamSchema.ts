import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { TeamStatus, TeamType } from '../models/Team';

// Helper schema for ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => ObjectId.isValid(val),
  { message: 'Invalid ObjectId' }
);

// Team member schema
export const teamMemberSchema = z.object({
  userId: objectIdSchema,
  role: z.string(),
  joinedAt: z.date().optional(),
  isLeader: z.boolean().optional(),
});

// Team schedule schema
export const teamScheduleSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  isOnCall: z.boolean(),
});

// Team status schema
export const teamStatusSchema = z.nativeEnum(TeamStatus);

// Base team schema for shared properties
const baseTeamSchema = {
  name: z.string().min(2).max(50),
  type: z.nativeEnum(TeamType),
  stationId: objectIdSchema,
  status: teamStatusSchema,
  members: z.array(teamMemberSchema),
  schedule: z.array(teamScheduleSchema).optional(),
  vehicleId: objectIdSchema.optional(),
  equipmentIds: z.array(objectIdSchema).optional(),
  notes: z.array(z.object({
    content: z.string(),
    createdBy: objectIdSchema,
    createdAt: z.date().optional(),
  })).optional(),
};

// Create team schema
export const createTeamSchema = z.object({
  body: z.object(baseTeamSchema),
});

// Update team schema
export const updateTeamSchema = z.object({
  body: z.object({
    ...baseTeamSchema,
    status: teamStatusSchema.optional(),
    members: z.array(teamMemberSchema).optional(),
    schedule: z.array(teamScheduleSchema).optional(),
  }).partial(),
});

// Team params schema for route parameters
export const teamParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
export type UpdateTeamSchema = z.infer<typeof updateTeamSchema>;
export type TeamParamsSchema = z.infer<typeof teamParamsSchema>;
