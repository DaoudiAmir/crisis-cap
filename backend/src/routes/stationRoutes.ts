import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import StationController from '../controllers/StationController';
import { createStationSchema, updateStationSchema, stationParamsSchema, stationQuerySchema } from '../schemas/stationSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all stations (accessible to all authenticated users)
router.get('/', validateRequest(stationQuerySchema), StationController.getAllStations);

// Get single station by ID
router.get('/:id', validateRequest(stationParamsSchema), StationController.getStation);

// Get station statistics
router.get('/:id/statistics', validateRequest(stationParamsSchema), StationController.getStationStatistics);

// Get station resources (personnel, vehicles, equipment)
router.get('/:id/resources', StationController.getStationResources);

// Get nearby stations within radius
router.get('/:id/nearby', validateRequest(stationQuerySchema), StationController.getNearbyStations);

// Routes restricted to officers and coordinators
router.use(restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR));

// Create new station
router.post(
  '/',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(createStationSchema),
  StationController.createStation
);

// Update station
router.put(
  '/:id',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(stationParamsSchema.and(updateStationSchema)),
  StationController.updateStation
);

// Update station status
router.patch('/:id/status', StationController.updateStationStatus);

// Manage station resources
router.post(
  '/:id/resources',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(stationParamsSchema),
  StationController.addStationResource
);
router.delete(
  '/:id/resources/:resourceId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.removeStationResource
);

// Manage station personnel
router.post(
  '/:id/personnel',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.addStationPersonnel
);
router.delete(
  '/:id/personnel/:userId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.removeStationPersonnel
);

// Manage station vehicles
router.post(
  '/:id/vehicles',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.addStationVehicle
);
router.delete(
  '/:id/vehicles/:vehicleId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.removeStationVehicle
);

// Manage station equipment
router.post(
  '/:id/equipment',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.addStationEquipment
);
router.delete(
  '/:id/equipment/:equipmentId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  StationController.removeStationEquipment
);

export default router;
