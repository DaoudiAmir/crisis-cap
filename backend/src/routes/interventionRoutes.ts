import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import InterventionController from '../controllers/InterventionController';
import {
  createInterventionSchema,
  updateInterventionSchema,
  interventionParamsSchema,
  addTimelineEventSchema,
  assignResourceSchema,
  interventionQuerySchema
} from '../schemas/interventionSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes accessible to authenticated users based on role
router
  .route('/')
  .get(
    validateRequest(interventionQuerySchema),
    InterventionController.getInterventions
  )
  .post(
    restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER),
    validateRequest(createInterventionSchema),
    InterventionController.createIntervention
  );

router
  .route('/:id')
  .get(
    validateRequest(interventionParamsSchema),
    InterventionController.getInterventionById
  )
  .patch(
    restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER),
    validateRequest({ ...interventionParamsSchema, ...updateInterventionSchema }),
    InterventionController.updateInterventionStatus
  );

// Notes management
router
  .route('/:id/notes')
  .post(
    validateRequest({ ...interventionParamsSchema, body: { note: true } }),
    InterventionController.addNote
  );

// Location management
router
  .route('/:id/location')
  .patch(
    restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER),
    validateRequest({ ...interventionParamsSchema, body: { location: true } }),
    InterventionController.updateLocation
  );

// Resource management
router
  .route('/:id/resources')
  .post(
    restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER),
    validateRequest({ ...interventionParamsSchema, ...assignResourceSchema }),
    InterventionController.addResource
  )
  .delete(
    restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER),
    validateRequest(interventionParamsSchema),
    InterventionController.removeResource
  );

// Timeline
router
  .route('/:id/timeline')
  .get(
    validateRequest(interventionParamsSchema),
    InterventionController.getTimeline
  );

// Dashboard routes - No validation required for these endpoints
router.get(
  '/recent',
  InterventionController.getRecentInterventions
);

router.get(
  '/active',
  InterventionController.getActiveInterventions
);

// Statistics
router.get(
  '/stats',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  InterventionController.getStats
);

export default router;
