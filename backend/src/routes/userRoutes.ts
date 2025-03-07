import express from 'express';
import UserController from '../controllers/UserController';
import UserService from '../services/UserService';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, loginSchema, updateUserSchema } from '../schemas/userSchema';
import { UserRole } from '../models/User';
import { getCurrentUser } from '../controllers/authController';

const router = express.Router();

// System routes
router.post('/init', (req, res, next) => {
  UserService.createInitialAdmin()
    .then(user => {
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Admin user already exists'
        });
      }
      res.status(201).json({
        status: 'success',
        data: {
          user
        }
      });
    })
    .catch(next);
});

// Public routes
router.post('/login', validateRequest(loginSchema), UserController.login);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

// Routes accessible to all authenticated users
router.get('/me', getCurrentUser);

// User profile routes
router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.changePassword);

// User status
router.get('/:id/status', UserController.getUserStatus);
router.patch('/:id/status', UserController.updateUserStatus);

// Routes with role-based access
router.post(
  '/register',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  validateRequest(createUserSchema),
  UserController.register
);

router.put(
  '/:id',
  validateRequest(updateUserSchema),
  UserController.updateUser
);

router.get(
  '/role/:role',
  restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  UserController.getUsersByRole
);

router.get(
  '/station/:stationId',
  restrictTo(UserRole.TEAM_LEADER, UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  UserController.getUsersByStation
);

// User activation routes
router.patch(
  '/:id/deactivate',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  UserController.deactivateUser
);

router.patch(
  '/:id/activate',
  restrictTo(UserRole.OFFICER, UserRole.REGIONAL_COORDINATOR),
  UserController.reactivateUser
);

export default router;
