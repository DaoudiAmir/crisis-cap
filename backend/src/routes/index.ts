import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import stationRoutes from './stationRoutes';
import teamRoutes from './teamRoutes';
import equipmentRoutes from './equipmentRoutes';
import interventionRoutes from './interventionRoutes';
import vehicleRoutes from './vehicleRoutes';
import regionRoutes from './regionRoutes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// API routes
router.use('/v1/users', userRoutes);
router.use('/v1/stations', stationRoutes);
router.use('/v1/teams', teamRoutes);
router.use('/v1/equipment', equipmentRoutes);
router.use('/v1/interventions', interventionRoutes);
router.use('/v1/vehicles', vehicleRoutes);
router.use('/v1/regions', regionRoutes);

export default router;
