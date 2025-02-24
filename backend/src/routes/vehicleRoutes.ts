import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import VehicleController from '../controllers/VehicleController';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleParamsSchema,
  addMaintenanceRecordSchema,
  updateLocationSchema,
  vehicleQuerySchema
} from '../schemas/vehicleSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes accessible to authenticated users based on role
router
  .route('/')
  .get(
    validateRequest(vehicleQuerySchema),
    VehicleController.getVehicles
  )
  .post(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(createVehicleSchema),
    VehicleController.createVehicle
  );

router
  .route('/:id')
  .get(
    validateRequest(vehicleParamsSchema),
    VehicleController.getVehicleById
  )
  .patch(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest({ ...vehicleParamsSchema, ...updateVehicleSchema }),
    VehicleController.updateVehicle
  );

// Maintenance records
router
  .route('/:id/maintenance')
  .post(
    restrictTo(UserRole.OFFICER, UserRole.LOGISTICS_MANAGER),
    validateRequest({ ...vehicleParamsSchema, ...addMaintenanceRecordSchema }),
    VehicleController.reportMaintenance
  );

// Location updates
router
  .route('/:id/location')
  .patch(
    validateRequest({ ...vehicleParamsSchema, ...updateLocationSchema }),
    VehicleController.updateLocation
  );

// Statistics and reports
router.get(
  '/stats/utilization',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  VehicleController.getUtilizationStats
);

export default router;
