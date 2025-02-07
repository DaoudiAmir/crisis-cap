import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../models/User';
import TeamController from '../controllers/TeamController';
import { createTeamSchema, updateTeamSchema, teamParamsSchema, teamMemberSchema, teamScheduleSchema, teamStatusSchema } from '../schemas/teamSchema';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes accessible to all authenticated users
router
  .route('/')
  .get(TeamController.getAllTeams)
  .post(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(createTeamSchema),
    TeamController.createTeam
  );

router
  .route('/:id')
  .get(
    validateRequest(teamParamsSchema),
    TeamController.getTeam
  )
  .put(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(teamParamsSchema.and(updateTeamSchema)),
    TeamController.updateTeam
  )
  .delete(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(teamParamsSchema),
    TeamController.deleteTeam
  );

router
  .route('/:id/members')
  .get(
    validateRequest(teamParamsSchema),
    TeamController.getTeamMembers
  )
  .post(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(teamParamsSchema.and(teamMemberSchema)),
    TeamController.addTeamMember
  );

router.delete(
  '/:id/members/:userId',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(teamParamsSchema),
  TeamController.removeTeamMember
);

router
  .route('/:id/schedule')
  .get(
    validateRequest(teamParamsSchema),
    TeamController.getTeamSchedule
  )
  .put(
    restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
    validateRequest(teamParamsSchema.and(teamScheduleSchema)),
    TeamController.updateTeamSchedule
  );

router.patch(
  '/:id/status',
  restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(teamParamsSchema.and(teamStatusSchema)),
  TeamController.updateTeamStatus
);

router.post(
  '/:id/vehicle',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(teamParamsSchema),
  TeamController.assignVehicle
);

router.get(
  '/available/:interventionType',
  validateRequest(teamParamsSchema),
  TeamController.getAvailableTeams
);

router.get('/:id/current-status', TeamController.getTeamStatus);
router.get('/:id/history', TeamController.getTeamHistory);

// Get teams by station
router.get('/station/:stationId', TeamController.getTeamsByStation);

// Team member management
router.patch('/:id/members/:userId/role', TeamController.updateMemberRole);
router.patch('/:id/members/:userId/leader', TeamController.setTeamLeader);

// Team vehicle management
router.delete('/:id/vehicle', TeamController.removeVehicle);

// Team intervention management
router.post('/:id/intervention', TeamController.assignIntervention);
router.delete('/:id/intervention', TeamController.removeIntervention);

// Team notes management
router.post('/:id/notes', TeamController.addTeamNote);
router.get('/:id/notes', TeamController.getTeamNotes);

export default router;
