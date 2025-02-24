import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import RegionController from '../controllers/RegionController';
import {
  createRegionSchema,
  updateRegionSchema,
  regionParamsSchema,
  coordinatesSchema
} from '../schemas/regionSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes accessible to all authenticated users
router
  .route('/')
  .get(RegionController.getAllRegions)
  .post(
    restrictTo(UserRole.REGIONAL_COORDINATOR),
    validateRequest(createRegionSchema),
    RegionController.createRegion
  );

router
  .route('/:id')
  .get(
    validateRequest(regionParamsSchema),
    RegionController.getRegionById
  )
  .patch(
    restrictTo(UserRole.REGIONAL_COORDINATOR),
    validateRequest({ ...regionParamsSchema, ...updateRegionSchema }),
    RegionController.updateRegion
  )
  .delete(
    restrictTo(UserRole.REGIONAL_COORDINATOR),
    validateRequest(regionParamsSchema),
    RegionController.deleteRegion
  );

// Get region resource summary
router.get(
  '/:id/resources',
  validateRequest(regionParamsSchema),
  RegionController.getResourceSummary
);

// Check if point is within region
router.post(
  '/check-point',
  validateRequest(coordinatesSchema),
  RegionController.checkPointInRegion
);

// Get overlapping regions
router.post(
  '/overlapping',
  validateRequest(coordinatesSchema),
  RegionController.getOverlappingRegions
);

export default router;
