import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import EquipmentController from '../controllers/EquipmentController';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentParamsSchema,
  maintenanceRecordSchema,
  equipmentTransferSchema,
  equipmentStatusSchema,
  bulkStatusUpdateSchema
} from '../schemas/equipmentSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes accessible to all authenticated users
router
  .route('/')
  .get(EquipmentController.getAllEquipment)
  .post(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(createEquipmentSchema),
    EquipmentController.createEquipment
  );

router
  .route('/:id')
  .get(
    validateRequest(equipmentParamsSchema),
    EquipmentController.getEquipment
  )
  .put(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest({ params: equipmentParamsSchema, body: updateEquipmentSchema }),
    EquipmentController.updateEquipment
  )
  .delete(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(equipmentParamsSchema),
    EquipmentController.deleteEquipment
  );

// Get equipment by type
router.get(
  '/type/:type',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getEquipmentByType
);

// Get equipment by station
router.get(
  '/station/:stationId',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getEquipmentByStation
);

// Get available equipment
router.get(
  '/available/:type',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getAvailableEquipment
);

// Get equipment status
router.get(
  '/:id/status',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getEquipmentStatus
);

// Get equipment history
router.get(
  '/:id/history',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getEquipmentHistory
);

// Get equipment maintenance history
router.get(
  '/:id/maintenance-history',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getMaintenanceHistory
);

// Equipment status management
router.patch(
  '/:id/status',
  restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest({ params: equipmentParamsSchema, body: equipmentStatusSchema }),
  EquipmentController.updateEquipmentStatus
);

// Equipment notes management
router.post(
  '/:id/notes',
  validateRequest(equipmentParamsSchema),
  EquipmentController.addEquipmentNote
);
router.get(
  '/:id/notes',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getEquipmentNotes
);

// Equipment assignment
router.post(
  '/:id/assign',
  validateRequest(equipmentParamsSchema),
  EquipmentController.assignEquipment
);
router.post(
  '/:id/return',
  validateRequest(equipmentParamsSchema),
  EquipmentController.returnEquipment
);

// Equipment maintenance management
router.post(
  '/:id/maintenance',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest({ params: equipmentParamsSchema, body: maintenanceRecordSchema }),
  EquipmentController.addMaintenanceRecord
);
router.get(
  '/:id/maintenance',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getMaintenanceRecords
);
router.put(
  '/:id/maintenance/:recordId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(equipmentParamsSchema),
  EquipmentController.updateMaintenanceRecord
);

// Equipment inspection management
router.post(
  '/:id/inspection',
  validateRequest(equipmentParamsSchema),
  EquipmentController.addInspectionRecord
);
router.get(
  '/:id/inspection',
  validateRequest(equipmentParamsSchema),
  EquipmentController.getInspectionRecords
);
router.put(
  '/:id/inspection/:recordId',
  validateRequest(equipmentParamsSchema),
  EquipmentController.updateInspectionRecord
);

// Equipment transfer between stations
router.post(
  '/:id/transfer',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest({ params: equipmentParamsSchema, body: equipmentTransferSchema }),
  EquipmentController.transferEquipment
);

// Bulk operations
router.post(
  '/bulk/status',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(bulkStatusUpdateSchema),
  EquipmentController.updateBulkStatus
);
router.post(
  '/bulk/maintenance',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(bulkStatusUpdateSchema),
  EquipmentController.addBulkMaintenance
);
router.post(
  '/bulk/transfer',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(bulkStatusUpdateSchema),
  EquipmentController.transferBulkEquipment
);

export default router;
