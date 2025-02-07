import { z } from 'zod';

export const createEquipmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    type: z.enum(['PROTECTIVE_GEAR', 'RESCUE_TOOL', 'MEDICAL_EQUIPMENT', 'COMMUNICATION_DEVICE', 'VEHICLE_EQUIPMENT', 'SPECIAL_EQUIPMENT']),
    serialNumber: z.string().min(5).max(50),
    station: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid station ID'),
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE']).default('AVAILABLE'),
    condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).default('NEW'),
    purchaseDate: z.string().datetime(),
    lastInspection: z.string().datetime().optional(),
    nextInspectionDue: z.string().datetime(),
    specifications: z.record(z.string()).optional(),
    maintenanceHistory: z.array(z.object({
      date: z.string().datetime(),
      type: z.enum(['INSPECTION', 'REPAIR', 'CALIBRATION', 'CLEANING']),
      description: z.string().min(10),
      performedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
      cost: z.number().optional(),
      nextMaintenanceDate: z.string().datetime().optional()
    })).optional(),
    isActive: z.boolean().default(true),
    notes: z.string().optional()
  })
});

export const updateEquipmentSchema = createEquipmentSchema.deepPartial();

export const equipmentParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid equipment ID')
  })
});

export const maintenanceRecordSchema = z.object({
  body: z.object({
    type: z.enum(['INSPECTION', 'REPAIR', 'CALIBRATION', 'CLEANING']),
    description: z.string().min(10),
    cost: z.number().optional(),
    nextMaintenanceDate: z.string().datetime().optional()
  })
});

export const equipmentTransferSchema = z.object({
  body: z.object({
    targetStationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid station ID')
  })
});

export const equipmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'])
  })
});

export const bulkStatusUpdateSchema = z.object({
  body: z.object({
    equipmentIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid equipment ID')),
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'])
  })
});
